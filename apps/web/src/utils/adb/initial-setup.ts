import { AdbDevice, readStreamIntoBufferAndClose } from "%/adb/adb-device.ts";
import { Device } from "@prisma/client";
import * as Sentry from "@sentry/node";
import ApkReader, { ManifestObject } from "adbkit-apkreader";
// import { globStream } from "glob"; // glob doesn't webpack
import RobustClient from "%/adb/robust-client.ts";
import { resolveOrDefaultValue } from "%/utils/promise-utils.ts";
import { BASE_ORIGIN } from "@/constants.ts";
import { findUpSync } from "find-up";
import { globby } from "globby";
import path from "path";

const apksDir = path.resolve(findUpSync("package.json")!, "../android"); // may be called from any directory

async function getInstalledVersionOfPackageOnClient(
  adbClient: RobustClient,
  packageName: string,
): Promise<bigint> {
  const androidVersionRet = await adbClient
    .shell(`dumpsys package ${packageName} | grep versionCode`)
    .then(readStreamIntoBufferAndClose)
    .then((output: Buffer) => output.toString().trim());
  //     versionCode=599311101 minSdk=24 targetSdk=34
  return BigInt(androidVersionRet.split("=")[1].split(" ")[0]);
}

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
    await adbClient.shell(
      "cmd notification allow_listener xyz.regulad.pheidippides.notify/.NotificationRelayService",
    );
    await adbClient.shell(
      "am start xyz.regulad.pheidippides.notify/.MainActivity",
    );
  }
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

  if (packageName === "com.android.webview") {
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
    .then(readStreamIntoBufferAndClose)
    .then((output: Buffer) => output.toString().trim());

  return (
    !!rawFlagString &&
    (rawFlagString.includes("DEBUGGABLE") ||
      rawFlagString.includes("TEST_ONLY"))
  );
}

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
          .then(readStreamIntoBufferAndClose)
          .then((output: Buffer) => {}) // void out the buffer
          .catch((e: any) => {
            console.error("Failed to grant permission", p, e);
            Sentry.captureException(e);
          }), // errors in permission granting are not fatal
    );
  await Promise.all(requestedPermissions);
}

// NOTE: if we want to protect a Phedippides module from uninstallation, we need to either have some app installed as a device manager or set it as a manager.
// TODO: best solution: create a device manager app that is installed on the device and can manage the other apps

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
    );
    if (installedVersionCode >= newVersionCode) {
      return false;
    }
  }
  return true;
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
  await adbClient.uninstall(packageName);
  await adbClient
    .shell(`pm uninstall ${packageName}`)
    .then(readStreamIntoBufferAndClose); // wait for the duplex to close before moving on
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
    if (appIsDebug)
      await uninstallPackageCompletely(adbClient, packageName).catch((e) => {
        console.error(
          "Failed to uninstall package, continuing",
          packageName,
          e,
        );
        Sentry.captureException(e);
      });
    await adbClient.install(apkPath);
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
