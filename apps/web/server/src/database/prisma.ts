import { PrismaClient } from "@prisma/client";
import Redis from "ioredis";
import { createPrismaRedisCache } from "prisma-redis-middleware";

interface CustomNodeJsGlobal {
  prisma: PrismaClient;
}

declare const global: CustomNodeJsGlobal;

function createPrisma() {
  // to save on reads, we use this middleware to attach a cache https://www.npmjs.com/package/prisma-redis-middleware
  const prisma = new PrismaClient();

  if (process.env.NODE_ENV === "production") {
    const redis = new Redis({
      host: "redis",
      port: 6379,
    });

    const redisMiddleware = createPrismaRedisCache({
      storage: {
        type: "redis",
        options: {
          client:
            redis as any /* built against a different version of Redis but compatible */,
          invalidation: {
            referencesTTL: 60, // same cache time
          },
        },
      },
      excludeMethods: ["findMany"],
      cacheTime: 60,
    });

    // middlewares are depreciated, but the client extension version of this (https://www.npmjs.com/package/@yxx4c/prisma-redis-cache) is pretty new and not stable yet
    prisma.$use(redisMiddleware);
  }

  return prisma;
}

// this is actually created during the build process; luckily the prisma client is more or less stateless
// this prevents multiple instances of Prisma Client in development
const prisma = global.prisma || createPrisma();

// if (process.env.NODE_ENV === 'development') global.prisma = prisma;
global.prisma = prisma; // we don't care in our case

export default prisma;
