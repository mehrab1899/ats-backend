// src/graphql/resolvers/auth.ts
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePasswords, generateToken } from '../../auth/auth';

const prisma = new PrismaClient();

export const authResolvers = {
    Mutation: {
        signup: async (_: any, { username, password }: any) => {
            const existingAdmin = await prisma.admin.findUnique({ where: { username } });
            if (existingAdmin) throw new Error('Username already exists');

            const hashedPassword = await hashPassword(password);
            const newAdmin = await prisma.admin.create({
                data: { username, password: hashedPassword },
            });

            const token = generateToken(newAdmin.id);
            return { token };
        },

        login: async (_: any, { username, password }: any) => {
            const admin = await prisma.admin.findUnique({ where: { username } });
            if (!admin) throw new Error('Invalid credentials');

            const isValid = await comparePasswords(password, admin.password);
            if (!isValid) throw new Error('Invalid credentials');

            const token = generateToken(admin.id);
            return { token };
        },
    },
};
