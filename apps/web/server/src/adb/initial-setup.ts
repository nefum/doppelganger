import { AdbDevice, readFullStreamIntoBuffer } from "%/adb/adb-device.ts";
import { Device } from "@prisma/client";
import * as Sentry from "@sentry/node";
import ApkReader, { ManifestObject } from "adbkit-apkreader";
// import { globStream } from "glob"; // glob doesn't webpack
import RobustClient from "%/adb/robust-client.ts";
import { BASE_ORIGIN } from "%/constants.ts";
import { resolveOrDefaultValue } from "%/utils/promise-utils.ts";
import AsyncLock from "async-lock";
import { findUpSync } from "find-up";
import { globby } from "globby";
import path from "path";

const apksDir = path.resolve(findUpSync("package.json")!, "../android"); // may be called from any directory

const PROTECTED_PACKAGES = [
  "xyz.regulad.pheidippides.locate",
  "xyz.regulad.pheidippides.notify",
  // "com.rom1v.sndcpy", // we don't want to lock this one, sndcpy handles its own installation/uninstallation externally
];

const thisProcessInstallLock = new AsyncLock();

async function getInstalledVersionOfPackageOnClient(
  adbClient: RobustClient,
  packageName: string,
): Promise<bigint> {
  const androidVersionRet = await adbClient
    .shell(`dumpsys package ${packageName} | grep versionCode`)
    .then(readFullStreamIntoBuffer)
    .then((output: Buffer) => output.toString().trim());
  //     versionCode=599311101 minSdk=24 targetSdk=34
  return BigInt(androidVersionRet.split("=")[1].split(" ")[0]);
}

/**
 * Performs special setup and starting for certain packages, mainly internal modules.
 * @param adbClient
 * @param packageName
 */
async function doSpecialSetupAndStarting(
  adbClient: RobustClient,
  packageName: string,
): Promise<void> {
  try {
    await adbClient.root();
  } catch (e: any) {
    // ignore; just try or we are already root
  }

  if (packageName === "xyz.regulad.pheidippides.notify") {
    await adbClient
      .shell(
        "cmd notification allow_listener xyz.regulad.pheidippides.notify/.NotificationRelayService",
      )
      .then(readFullStreamIntoBuffer);
    await adbClient
      .shell("am start xyz.regulad.pheidippides.notify/.MainActivity")
      .then(readFullStreamIntoBuffer);
  } else if (packageName === "xyz.regulad.pheidippides.locate") {
    // settings put global development_settings_enabled 1
    // settings put secure mock_location 1
    // appops set YOUR_PACKAGE_NAME android:mock_location allow
    // settings put secure mock_location_app ${packageName}
    await adbClient
      .shell("settings put global development_settings_enabled 1")
      .then(readFullStreamIntoBuffer);
    await adbClient
      .shell("settings put secure mock_location 1")
      .then(readFullStreamIntoBuffer);
    await adbClient
      .shell(`appops set ${packageName} android:mock_location allow`)
      .then(readFullStreamIntoBuffer);
    await adbClient
      .shell(`settings put secure mock_location_app ${packageName}`)
      .then(readFullStreamIntoBuffer);
  } else if (packageName === "xyz.regulad.pheidippides.administrate") {
    await adbClient
      .shell(
        "dpm set-device-owner xyz.regulad.pheidippides.administrate/.DeviceAdminReceiver",
      )
      .then(readFullStreamIntoBuffer)
      .then((output: Buffer) => output.toString().trim())
      .then((output) => {
        if (
          output.includes(
            "java.lang.IllegalStateException: Already has an owner",
          )
        ) {
          return; // a-ok
        } else if (output.includes("Error:")) {
          throw new Error(output);
        }
      });

    for (const packageName of PROTECTED_PACKAGES) {
      await lockPackageFromUninstall(adbClient, packageName);
    }
  }
}

/**
 * Locks a package from uninstallation.
 * @param adbClient
 * @param packageName
 */
async function lockPackageFromUninstall(
  adbClient: RobustClient,
  packageName: string,
): Promise<void> {
  const packageIsInstalled = await adbClient.isInstalled(packageName);
  const administrateIsInstalled = await adbClient.isInstalled(
    "xyz.regulad.pheidippides.administrate",
  );

  if (!packageIsInstalled || !administrateIsInstalled) {
    return;
  }

  await adbClient
    .shell(
      `am start -a xyz.regulad.pheidippides.administrate/.LOCK_APP -d package:${packageName}`,
    )
    .then(readFullStreamIntoBuffer);
}

/**
 * Unlocks a package from uninstallation.
 * @param adbClient
 * @param packageName
 */
async function unlockPackageFromUninstall(
  adbClient: RobustClient,
  packageName: string,
): Promise<void> {
  const packageIsInstalled = await adbClient.isInstalled(packageName);
  const administrateIsInstalled = await adbClient.isInstalled(
    "xyz.regulad.pheidippides.administrate",
  );

  if (!packageIsInstalled || !administrateIsInstalled) {
    return;
  }

  await adbClient
    .shell(
      `am start -a xyz.regulad.pheidippides.administrate/.UNLOCK_APP -d package:${packageName}`,
    )
    .then(readFullStreamIntoBuffer);
}

/**
 * Queries an ADB device to determine if a package was installed with Debug keys. With debug (self-signed) keys, the app must be uninstalled before a new update is installed or Android will return an error
 */
async function getIsPackageDebug(
  adbClient: RobustClient,
  packageName: string,
): Promise<boolean> {
  // debug dumpsys: https://gist.github.com/regulad/574f9bbcc6218ca7a4a36f35e086a5c6
  //     flags=[ DEBUGGABLE HAS_CODE ALLOW_CLEAR_USER_DATA TEST_ONLY ]
  // prod dympsys: https://gist.github.com/regulad/48c4e192a9ad065ae5c5db8e9b209141
  //     flags=[ HAS_CODE ALLOW_CLEAR_USER_DATA ALLOW_BACKUP ]

  if (
    packageName === "com.android.webview" ||
    packageName.startsWith("xyz.regulad.pheidippides")
  ) {
    // for systems that have webview, the default webview may be installed with debug keys if the aosp build is debuggable
    // we are writing the chrome webview over it, so we will need to uninstall the default webview
    return true;
  }

  const packageIsInstalled = await adbClient.isInstalled(packageName);
  if (!packageIsInstalled) {
    return false;
  }
  const rawFlagString = await adbClient
    .shell(`dumpsys package ${packageName} | grep "flags=\["`)
    .then(readFullStreamIntoBuffer)
    .then((output: Buffer) => output.toString().trim());

  return (
    !!rawFlagString &&
    (rawFlagString.includes("DEBUGGABLE") ||
      rawFlagString.includes("TEST_ONLY"))
  );
}

/**
 * Grants all permissions requested in the manifest of a package
 * @param adbClient
 * @param manifest
 */
async function grantAllPermissionsOfPackage(
  adbClient: RobustClient,
  manifest: ManifestObject,
): Promise<void> {
  const packageName = manifest.package;
  const requestedPermissions = manifest.usesPermissions
    .map((p) => p.name)
    .map(
      (p) =>
        adbClient
          .shell(`pm grant ${packageName} ${p}`)
          .then(readFullStreamIntoBuffer)
          .then((output: Buffer) => {}) // void out the buffer
          .catch((e: any) => {
            console.error("Failed to grant permission", p, e);
            Sentry.captureException(e);
          }), // errors in permission granting are not fatal
    );
  await Promise.all(requestedPermissions);
}

/**
 * Forfeits device ownership of the device. This is a special case for the administrate app, enabling it to be uninstalled.
 * @param adbClient
 */
async function forfeitDeviceOwnership(adbClient: RobustClient): Promise<void> {
  await adbClient
    .shell(
      "am start -n xyz.regulad.pheidippidies.administrate/.ForfeitAdminActivity",
    )
    .then(readFullStreamIntoBuffer);
}

/**
 * Determines if a package needs installation or installation by querying the device for the current installed version
 * @param adbClient
 * @param manifest
 */
async function determineIfPackageNeedsInstallation(
  adbClient: RobustClient,
  manifest: ManifestObject,
): Promise<boolean> {
  const newVersionCode = manifest.versionCode;
  const packageName = manifest.package;
  const packageIsInstalled = await adbClient.isInstalled(packageName);
  if (packageIsInstalled) {
    const installedVersionCode = await resolveOrDefaultValue(
      getInstalledVersionOfPackageOnClient(adbClient, packageName),
      -1n,
      false,
    );
    if (installedVersionCode >= newVersionCode) {
      return false;
    }
  }
  return true;
}

/**
 * Removes all safeguards for a package, such as device ownership or uninstall locks
 * @param adbClient
 * @param packageName
 */
async function removeSafeguards(
  adbClient: RobustClient,
  packageName: string,
): Promise<void> {
  if (packageName === "xyz.regulad.pheidippides.administrate") {
    await forfeitDeviceOwnership(adbClient).catch((e) => {
      console.error("Failed to forfeit device ownership, continuing", e);
      Sentry.captureException(e);
    });
  } else if (packageName in PROTECTED_PACKAGES) {
    await unlockPackageFromUninstall(adbClient, packageName).catch((e) => {
      console.error("Failed to unlock package, continuing", packageName, e);
      Sentry.captureException(e);
    });
  }
}

/**
 * Attempts to uninstall a package completely and clear any storage. If the package is not installed, this will fail silently.
 * @param adbClient
 * @param packageName
 */
async function uninstallPackageCompletely(
  adbClient: RobustClient,
  packageName: string,
): Promise<void> {
  const packageIsInstalled = await adbClient.isInstalled(packageName);
  if (packageIsInstalled) {
    return;
  }

  await removeSafeguards(adbClient, packageName);

  await adbClient.uninstall(packageName);
  await adbClient
    .shell(`pm uninstall ${packageName}`)
    .then(readFullStreamIntoBuffer); // wait for the duplex to close before moving on
}

async function installOrUpdateApkAndGrantAllPermissions(
  adbClient: RobustClient,
  apkPath: string,
): Promise<void> {
  // step 1: parse the apk to get the version, package name, and any requested permissions
  const apkReader = await ApkReader.open(apkPath);
  const manifest = await apkReader.readManifest();
  const packageName = manifest.package;

  const isOurPackage = packageName.startsWith("xyz.regulad.pheidippides");

  if (process.env.NODE_ENV !== "production" && !isOurPackage) {
    return; // if we are in dev, we only are going to install our own apks
  }

  // step 2: check if the apk is already installed or the same version
  const shouldInstall = await determineIfPackageNeedsInstallation(
    adbClient,
    manifest,
  );

  // step 3: if not, install the apk
  // step 4: grant all requested permissions
  if (shouldInstall) {
    // we use debug versions of the apps to enable logcat logging, so we need to uninstall to clear the keys
    // https://stackoverflow.com/questions/71872027/how-to-fix-signatures-do-not-match-previously-installed-version-error
    const appIsDebug = await getIsPackageDebug(adbClient, packageName).catch(
      (e) => {
        console.error(
          "Failed to check if package is debug, assuming it is and continuing",
          packageName,
          e,
        );
        Sentry.captureException(e);
        return true;
      },
    );

    if (appIsDebug) {
      await uninstallPackageCompletely(adbClient, packageName).catch((e) => {
        console.error(
          "Failed to uninstall package, continuing",
          packageName,
          e,
        );
        Sentry.captureException(e);
      });
    }

    await removeSafeguards(adbClient, packageName);

    // interesting node: without a stream, this will copy the app-debug.apk file to the device and then install it
    // now, there are multiple app-debug.apk files at the same time that will attempt to install at the same time
    // to prevent this, we will be using async-lock with the key of the apkPath and the device id
    const adbFileName = path.basename(apkPath);

    await thisProcessInstallLock.acquire(
      `${adbFileName}-${adbClient.serial}`,
      async () => {
        await adbClient.install(apkPath);
      },
    );

    await grantAllPermissionsOfPackage(adbClient, manifest);
  }

  // step 5: special cases
  await doSpecialSetupAndStarting(adbClient, packageName);
}

async function getAllApks(): Promise<string[]> {
  return await globby(apksDir + "/**/*.apk");
}

export async function getIsSetupComplete(device: Device): Promise<boolean> {
  const adbDevice = new AdbDevice(device);
  const adbClient = adbDevice.adbDeviceClient;
  const apks = await getAllApks();
  const isSetupCompleteArray = await Promise.all(
    apks.map(async (apkPath) => {
      const apkReader = await ApkReader.open(apkPath);
      const manifest = await apkReader.readManifest();
      const packageName = manifest.package;
      return resolveOrDefaultValue(adbClient.isInstalled(packageName), false); // if the package is not installed, it is not setup (probably?)
    }),
  );
  return isSetupCompleteArray.every((b) => b);
}

async function upsertSystemProperties(device: Device): Promise<void> {
  const adbDevice = new AdbDevice(device);
  const adbClient = adbDevice.adbDeviceClient;

  await adbClient.shell("setprop persist.sys.timezone America/New_York");
  await adbClient.shell("setprop persist.sys.locale en-US");
  await adbClient.shell("setprop persist.sys.language en");

  // old
  //       - "ro.doppelganger.origin={{ &doppelgangerOrigin }}"
  //       - "ro.doppelganger.secret={{ &doppelgangerSecret }}"
  //       - "ro.doppelganger.device={{ id }}"
  await adbClient.shell(`setprop persist.doppelganger.origin "${BASE_ORIGIN}"`);
  await adbClient.shell(
    `setprop persist.doppelganger.secret "${device.redroidSecret}"`,
  );
  await adbClient.shell(`setprop persist.doppelganger.device "${device.id}"`);
}

/**
 * Performs setup/update tasks for a device. This promise should be run in the background each time a device is connected.
 * @param device
 */
export default async function doInitialDeviceSetup(
  device: Device,
): Promise<void> {
  const adbDevice = new AdbDevice(device);
  // await adbDevice.connectRobust(600_000); // we do it lazily
  const adbClient = adbDevice.adbDeviceClient;

  await upsertSystemProperties(device);

  // glob the apks in absoluteApksDir
  const apks = await getAllApks();
  await Promise.all(
    apks.map(
      (apkPath) =>
        installOrUpdateApkAndGrantAllPermissions(adbClient, apkPath).catch(
          (e) => {
            console.error("Failed to install apk", apkPath, e);
            Sentry.captureException(e);
          },
        ), // don't propagate error
    ),
  );
}
