import prisma from "./prisma.ts";
import { DeviceState } from "@prisma/client";

// https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/querying-the-database-typescript-postgresql
async function main() {
  // this is from https://github.com/regulad/test-scrcpy
  await prisma.device.delete({
    where: {
      id: "staging",
    },
  });

  await prisma.device.create({
    data: {
      id: "staging",
      name: "staging",
      ownerEmail: "parkeredwardwahle2017@gmail.com",
      adbHostname: "doppelganger.tail11540.ts.net",
      scrcpyHostname: "doppelganger.tail11540.ts.net",
      redroidImage: "redroid/redroid:14.0.0-latest",
      redroidFps: 30,
      redroidDpi: 230,
      redroidWidth: 590,
      redroidHeight: 1140,
      basicAuthUsername: "kasm_user",
      basicAuthPassword: "ihopethisworks",
      lastState: DeviceState.ON,
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
