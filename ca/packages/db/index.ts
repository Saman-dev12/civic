import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from './generated/prisma';

// Load environment variables from the workspace root
config({ path: resolve(__dirname, '../../.env') });

// Export Prisma types for better TypeScript support
export type * from './generated/prisma';

// Ensure DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('Available environment variables:', Object.keys(process.env).filter(key => key.includes('DATABASE')));
  throw new Error('DATABASE_URL environment variable is not set. Please check your .env file.');
}

// Create and export the Prisma client instance
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export { prisma };
// export default prisma;