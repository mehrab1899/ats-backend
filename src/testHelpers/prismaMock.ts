import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
export const prismaMock = new PrismaClient();

prismaMock.admin.findUnique = jest.fn();
prismaMock.admin.create = jest.fn();
prismaMock.job.findMany = jest.fn();
prismaMock.applicant.findMany = jest.fn();
prismaMock.applicant.count = jest.fn();
prismaMock.job.count = jest.fn();


