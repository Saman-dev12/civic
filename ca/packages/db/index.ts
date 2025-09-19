import { PrismaClient } from './generated/prisma';

// Export Prisma types for better TypeScript support
export type * from './generated/prisma';

// Create and export the Prisma client instance
const prisma = new PrismaClient();

export { prisma };
// export default prisma;