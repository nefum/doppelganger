import prisma from "./prisma.ts";

// https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/querying-the-database-typescript-postgresql
async function main() {
  // this is from https://github.com/regulad/test-scrcpy
  try {
    await prisma.device.deleteMany({
      where: {
        id: {
          endsWith: "staging",
        },
      },
    });
  } catch (e) {
    // we don't care if its not there
  }

  await prisma.device.create({
    data: {
      id: "staging",
      name: "debug/staging",
      ownerId: "4d7a801f-130a-438f-b013-31e738693fad",
      adbHostname: "doppelganger.tail11540.ts.net", // my tailscale node (hello scrapers!)
      scrcpyHostname: "doppelganger.tail11540.ts.net", // my tailscale node (hello scrapers!)
      redroidImage: "abing7k/redroid:a11_gapps_arm",
      redroidFps: 30,
      redroidDpi: 230,
      redroidWidth: 590,
      redroidHeight: 1140,
      redroidSecret: "tee/hee",
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
