import { AdbDevice } from "%/adb/adb-device.ts";
import { DeviceClient } from "@devicefarmer/adbkit";
import Util from "@devicefarmer/adbkit/dist/src/adb/util";
import { Device } from "@prisma/client";
import ApkReader from "adbkit-apkreader";
// import { globStream } from "glob"; // glob doesn't webpack
import { globby } from "globby";
import path from "path";

const apksDir =
  process.env.NODE_ENV === "production" ? "../../android" : "../../../android";
const absoluteApksDir = path.resolve(__dirname, apksDir);

async function installOrUpdateApkAndGrantAllPermissions(
  adbClient: DeviceClient,
  apkPath: string,
): Promise<void> {
  // step 1: parse the apk to get the version, package name, and any requested permissions
  const apkReader = await ApkReader.open(apkPath);
  const manifest = await apkReader.readManifest();

  const newVersionCode = manifest.versionCode;
  const packageName = manifest.package;
  const requestedPermissions = manifest.usesPermissions.map((p) => p.name);

  const isOurPackage = packageName.startsWith("xyz.regulad.pheidippides");

  if (process.env.NODE_ENV !== "production" && !isOurPackage) {
    return; // if we are in dev, we only are going to install our own apks
  }

  // step 2: check if the apk is already installed or the same version
  let shouldInstall = true;
  const packageIsInstalled = await adbClient.isInstalled(packageName);
  if (packageIsInstalled) {
    const androidVersionRet: string = await adbClient
      .shell(`dumpsys package ${packageName} | grep versionCode`)
      .then(Util.readAll)
      .then((output: Buffer) => output.toString().trim());
    //     versionCode=599311101 minSdk=24 targetSdk=34
    const installedVersionCode = BigInt(
      androidVersionRet.split("=")[1].split(" ")[0],
    );
    if (installedVersionCode >= newVersionCode) {
      shouldInstall = false;
    }
  }

  // step 3: if not, install the apk
  if (shouldInstall) {
    if (isOurPackage) {
      // we use debug versions of the apps to enable logcat logging, so we need to uninstall to clear the
      await adbClient.uninstall(packageName);
      await adbClient.shell(`pm uninstall ${packageName}`); // https://stackoverflow.com/questions/71872027/how-to-fix-signatures-do-not-match-previously-installed-version-error
    }
    await adbClient.install(apkPath);
  }

  // step 4: grant all requested permissions
  if (shouldInstall) {
    const grantPromises: Promise<void>[] = [];
    for (const permission of requestedPermissions) {
      grantPromises.push(
        adbClient
          .shell(`pm grant ${packageName} ${permission}`)
          .then(Util.readAll)
          .then(() => {}),
      );
    }
    await Promise.all(grantPromises);
  }

  // step 5: special cases
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
 * Performs setup/update tasks for a device. This promise should be run in the background each time a device is connected.
 * @param device
 */
export default async function doInitialDeviceSetup(
  device: Device,
): Promise<void> {
  const adbDevice = new AdbDevice(device);
  await adbDevice.connect(); // if we are already connected, this will be a no-op
  const adbClient = adbDevice.adbClient;

  // glob the apks in absoluteApksDir
  const apks = await globby(absoluteApksDir + "/*.apk");
  await Promise.all(
    apks.map((apkPath) =>
      installOrUpdateApkAndGrantAllPermissions(adbClient, apkPath),
    ),
  );
}
