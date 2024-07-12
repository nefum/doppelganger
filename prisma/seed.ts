import prisma from "./prisma.ts";

// https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases/querying-the-database-typescript-postgresql
async function main() {
  // this is from https://github.com/regulad/test-scrcpy
  try {
    await prisma.device.delete({
      where: {
        id: "staging",
      },
    });
  } catch (e) {
    console.error(e);
  }

  await prisma.device.create({
    data: {
      id: "staging",
      name: "staging",
      ownerId: "4d7a801f-130a-438f-b013-31e738693fad",
      adbHostname: "doppelganger.tail11540.ts.net",
      redroidImage: "redroid/redroid:14.0.0-latest",
      redroidFps: 30,
      redroidDpi: 230,
      redroidWidth: 590,
      redroidHeight: 1140,
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
