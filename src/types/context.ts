import { PrismaClient } from '@prisma/client';

export interface Context {
    prisma: PrismaClient;
    admin: {
        adminId: number;
        role: 'ADMIN';
    } | null;
}
