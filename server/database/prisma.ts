import { PrismaClient } from "@prisma/client";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

// this prevents multiple instances of Prisma Client in development
const prisma = global.prisma || new PrismaClient();

// if (process.env.NODE_ENV === 'development') global.prisma = prisma;
global.prisma = prisma; // we don't care in our case

export default prisma;
