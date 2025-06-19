import { PrismaClient, JobStatus, JobType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLJSON } from 'graphql-type-json';

type JobWithApplicants = Prisma.JobGetPayload<{ include: { applicants: true } }>;

export const jobResolvers = {
    JSON: GraphQLJSON,

    Query: {
        // 🔓 Public (Homepage)
        publicJobs: async (_: unknown, __: unknown, { prisma }: { prisma: PrismaClient }) => {
            return prisma.job.findMany({
                where: { status: 'OPEN' },
                orderBy: { createdAt: 'desc' }
            });
        },

        // 🔒 Protected (Admin Panel)
        jobs: async (
            _: unknown,
            args: {
                search?: string;
                status?: JobStatus;
                skip?: number;
                take?: number;
            },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Admin only');

            const { search, status, skip = 0, take = 10 } = args;

            let filters: Prisma.JobWhereInput = {};

            // 🔍 Build OR search filter
            const orFilters: Prisma.JobWhereInput[] = [];

            if (search) {
                orFilters.push(
                    { title: { contains: search } },
                    { description: { contains: search } }
                );

                // Conditionally add status/type if `search` string exactly matches an enum
                if (Object.values(JobStatus).includes(search as JobStatus)) {
                    orFilters.push({ status: { equals: search as JobStatus } });
                }

                if (Object.values(JobType).includes(search as JobType)) {
                    orFilters.push({ type: { equals: search as JobType } });
                }

                filters.OR = orFilters;
            }

            if (status) {
                filters = {
                    AND: [
                        ...(filters.OR ? [{ OR: filters.OR }] : []),
                        { status }
                    ]
                };
            }

            const jobs = await prisma.job.findMany({
                where: filters,
                include: { applicants: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });

            return jobs.map((job) => ({
                id: job.id,
                title: job.title,
                description: job.description,
                status: job.status,
                type: job.type,
                applicants: job.applicants.length,
                createdAt: job.createdAt.toISOString()
            }));
        }

    },

    Mutation: {
        createJob: async (
            _: unknown,
            {
                input
            }: {
                input: {
                    title: string;
                    description: string;
                    status?: JobStatus;
                    type?: JobType;
                    skillsRequired: any;
                    benefits: any;
                };
            },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Only admins can create jobs');

            const job = await prisma.job.create({
                data: {
                    title: input.title,
                    description: input.description,
                    status: input.status ?? JobStatus.OPEN,
                    type: input.type ?? JobType.FULL_TIME,
                    skillsRequired: input.skillsRequired,
                    benefits: input.benefits
                }
            });

            return {
                id: job.id,
                title: job.title,
                description: job.description,
                status: job.status,
                type: job.type,
                applicants: 0,
                createdAt: job.createdAt.toISOString()
            };
        },

        updateJob: async (
            _: unknown,
            {
                id,
                input
            }: {
                id: string;
                input: Partial<{
                    title: string;
                    description: string;
                    status: JobStatus;
                    type: JobType;
                    skillsRequired: any;
                    benefits: any;
                }>;
            },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Only admins can update jobs');

            const existingJob = await prisma.job.findUnique({
                where: { id },
                include: { applicants: true }
            });

            if (!existingJob) throw new UserInputError(`Job with ID ${id} not found`);

            const updated = await prisma.job.update({
                where: { id },
                data: {
                    title: input.title ?? existingJob.title,
                    description: input.description ?? existingJob.description,
                    status: input.status ?? existingJob.status,
                    type: input.type ?? existingJob.type,
                    skillsRequired: input.skillsRequired ?? existingJob.skillsRequired,
                    benefits: input.benefits ?? existingJob.benefits
                }
            });

            return {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                status: updated.status,
                type: updated.type,
                applicants: existingJob.applicants.length,
                createdAt: updated.createdAt.toISOString()
            };
        },

        updateJobStatus: async (
            _: unknown,
            { id, status }: { id: string; status: JobStatus },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Only admins can update job status');

            const existing = await prisma.job.findUnique({
                where: { id },
                include: { applicants: true }
            });

            if (!existing) throw new UserInputError(`Job with ID ${id} not found`);

            const updated = await prisma.job.update({
                where: { id },
                data: { status }
            });

            return {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                status: updated.status,
                type: updated.type,
                applicants: existing.applicants.length,
                createdAt: updated.createdAt.toISOString()
            };
        }
    }
};
