import { beforeAll, afterAll, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Override the env var immediately before any imports resolve prisma
process.env.DATABASE_URL = 'file:./test.db';

const prisma = new PrismaClient();

beforeAll(() => {
  // Push prisma schema to test.db
  execSync('npx prisma db push --accept-data-loss --skip-generate', {
    env: { ...process.env, DATABASE_URL: 'file:./test.db' },
    stdio: 'ignore'
  });
});

beforeEach(async () => {
  // Clear the database tables before each test block for isolation
  await prisma.transaction.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
