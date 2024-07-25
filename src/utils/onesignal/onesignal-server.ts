import * as OneSignal from "@onesignal/node-onesignal";

// get the environment variables at runtime as opposed to build time
export default function getOneSignalClient() {
  const oneSignalConfiguration = OneSignal.createConfiguration({
    userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY!,
    restApiKey: process.env.ONESIGNAL_API_KEY!,
  });

  return new OneSignal.DefaultApi(oneSignalConfiguration);
}
