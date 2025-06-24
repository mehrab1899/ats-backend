import { PrismaClient } from '@prisma/client';

// Mock the Prisma client
export const prismaMock = new PrismaClient();

// Mock methods for the job model
prismaMock.job.findUnique = jest.fn() as jest.Mock;
prismaMock.job.create = jest.fn() as jest.Mock;
prismaMock.job.update = jest.fn() as jest.Mock;
prismaMock.job.findMany = jest.fn() as jest.Mock;
prismaMock.job.count = jest.fn() as jest.Mock;

// Mock methods for the admin model
prismaMock.admin.findUnique = jest.fn() as jest.Mock;
prismaMock.admin.create = jest.fn() as jest.Mock;

// Mock Prisma methods for applicant
prismaMock.applicant.findMany = jest.fn() as jest.Mock;
prismaMock.applicant.count = jest.fn() as jest.Mock;
