export function getBaseDir(): string {
  return process.env.ANDROID_RUNTIME_BASEDIR ?? "./";
}

export function getDockerComposeFileDirectory(id: string): string {
  return `${getBaseDir()}/${id}`;
}

export function getDockerComposePathInFolder(stackFolder: string): string {
  return `${stackFolder}/docker-compose.yml`;
}

export function getDockerComposeFilePath(id: string): string {
  return getDockerComposePathInFolder(getDockerComposeFileDirectory(id));
}

export function getDataDirOfDevice(
  deviceId: string,
): `${string}/${string}-diff` {
  return `${getBaseDir()}/${deviceId}-diff`; // from ./template/docker-compose.1.9.yml
}

export function getFoldersOfDevice(deviceId: string): string[] {
  return [
    getDockerComposeFileDirectory(deviceId),
    getDataDirOfDevice(deviceId),
  ];
}
