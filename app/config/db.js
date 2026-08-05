import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "/home/uyai/Documents/coding-everything/projects/portfolio-projects/incident-hub/generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
