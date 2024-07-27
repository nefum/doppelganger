import { PrismaClient } from "@prisma/client";

// ⚠️ DO NOT IMPORT THIS FROM RUNTIME CODE ⚠️
// ⚠️       THIS IS ONLY FOR SEEDING       ⚠️
// ⚠️        SEE server/prisma.ts          ⚠️
const prisma = new PrismaClient();

export default prisma;
