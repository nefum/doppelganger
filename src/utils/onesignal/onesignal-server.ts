import * as OneSignal from "@onesignal/node-onesignal";

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID!;
const ONESIGNAL_USER_AUTH_KEY = process.env.ONESIGNAL_USER_AUTH_KEY!;
export const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY!;

if (!ONESIGNAL_API_KEY || !ONESIGNAL_APP_ID || !ONESIGNAL_USER_AUTH_KEY) {
  throw new Error("OneSignal environment variables not found");
}

const oneSignalConfiguration = OneSignal.createConfiguration({
  userAuthKey: ONESIGNAL_USER_AUTH_KEY,
  restApiKey: ONESIGNAL_API_KEY,
});

export const oneSignalClient = new OneSignal.DefaultApi(oneSignalConfiguration);
