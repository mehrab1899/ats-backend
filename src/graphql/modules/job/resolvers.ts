import { PrismaClient, JobStatus, JobType } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLJSON } from 'graphql-type-json';
import { fromGlobalId, toGlobalId } from 'graphql-relay';


type JobWithApplicants = Prisma.JobGetPayload<{ include: { applicants: true } }>;

export const jobResolvers = {
    JSON: GraphQLJSON,

    Query: {
        publicJobs: async (_: unknown, args: { first?: number; after?: string }, { prisma }: { prisma: PrismaClient }) => {
            const take = args.first ?? 6;
            const afterCursor = args.after ? fromGlobalId(args.after).id : null;


            const jobs = await prisma.job.findMany({
                where: { status: 'OPEN' },
                orderBy: { createdAt: 'desc' },
                take: take + 1,
                skip: afterCursor ? 1 : 0,
                cursor: afterCursor ? { id: afterCursor } : undefined,
                include: { applicants: true },
            });

            const hasNextPage = jobs.length > take;
            const slicedJobs = hasNextPage ? jobs.slice(0, take) : jobs;

            const edges = slicedJobs.map((job) => ({
                cursor: toGlobalId('Job', job.id.toString()),
                node: {
                    id: `job-${job.id}`,
                    title: job.title,
                    description: job.description,
                    status: job.status,
                    type: job.type,
                    applicants: job.applicants.length,
                    skillsRequired: job.skillsRequired,
                    benefits: job.benefits,
                    createdAt: job.createdAt.toISOString(),
                    context: null,
                },
            }));

            const startCursor = edges.length > 0 ? edges[0].cursor : null;
            const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

            return {
                edges,
                pageInfo: {
                    hasNextPage,
                    hasPreviousPage: false,
                    startCursor,
                    endCursor,
                },
            };
        },

        jobs: async (
            _: unknown,
            args: { search?: string; status?: JobStatus; skip?: number; take?: number },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Admin only');

            const { search, status, skip = 0, take = 10 } = args;
            let filters: Prisma.JobWhereInput = {};
            const orFilters: Prisma.JobWhereInput[] = [];

            if (search) {
                orFilters.push(
                    { title: { contains: search } },
                    { description: { contains: search } }
                );

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
                    AND: [...(filters.OR ? [{ OR: filters.OR }] : []), { status }]
                };
            }

            const jobs = await prisma.job.findMany({
                where: filters,
                include: { applicants: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            });

            const totalJobsCount = await prisma.job.count({ where: filters });

            return {
                jobs: jobs.map((job) => ({
                    id: `job-${job.id}`,
                    title: job.title,
                    description: job.description,
                    status: job.status,
                    type: job.type,
                    applicants: job.applicants.length,
                    skillsRequired: job.skillsRequired,
                    benefits: job.benefits,
                    createdAt: job.createdAt.toISOString(),
                    context: null
                })),
                totalJobsCount
            };
        },

        getJobById: async (_: unknown, { id }: { id: string }, { prisma }: { prisma: PrismaClient }) => {
            const jobId = id.replace(/^job-/, '');
            const job = await prisma.job.findUnique({
                where: { id: jobId },
                include: { applicants: true }
            });

            if (!job) throw new UserInputError(`Job with ID ${id} not found`);

            return {
                id: `job-${job.id}`,
                title: job.title,
                description: job.description,
                status: job.status,
                type: job.type,
                applicants: job.applicants.length,
                skillsRequired: job.skillsRequired,
                benefits: job.benefits,
                createdAt: job.createdAt.toISOString(),
                context: null
            };
        }
    },

    Mutation: {
        createJob: async (_: unknown, { input }: any, { prisma, admin }: any) => {
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
                id: `job-${job.id}`,
                title: job.title,
                description: job.description,
                status: job.status,
                type: job.type,
                applicants: 0,
                skillsRequired: job.skillsRequired,
                benefits: job.benefits,
                createdAt: job.createdAt.toISOString(),
                context: null
            };
        },

        updateJob: async (_: unknown, { id, input }: any, { prisma, admin }: any) => {
            if (!admin) throw new AuthenticationError('Only admins can update jobs');
            const jobId = id.replace(/^job-/, '');

            const existingJob = await prisma.job.findUnique({
                where: { id: jobId },
                include: { applicants: true }
            });

            if (!existingJob) throw new UserInputError(`Job with ID ${id} not found`);

            const updated = await prisma.job.update({
                where: { id: jobId },
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
                id: `job-${updated.id}`,
                title: updated.title,
                description: updated.description,
                status: updated.status,
                type: updated.type,
                applicants: existingJob.applicants.length,
                skillsRequired: updated.skillsRequired,
                benefits: updated.benefits,
                createdAt: updated.createdAt.toISOString(),
                context: null
            };
        },

        updateJobStatus: async (_: unknown, { id, status }: any, { prisma, admin }: any) => {
            if (!admin) throw new AuthenticationError('Only admins can update job status');

            const jobId = id.replace(/^job-/, '');
            const existing = await prisma.job.findUnique({
                where: { id: jobId },
                include: { applicants: true }
            });

            if (!existing) throw new UserInputError(`Job with ID ${id} not found`);

            const updated = await prisma.job.update({
                where: { id: jobId },
                data: { status }
            });

            return {
                id: `job-${updated.id}`,
                title: updated.title,
                description: updated.description,
                status: updated.status,
                type: updated.type,
                applicants: existing.applicants.length,
                skillsRequired: updated.skillsRequired,
                benefits: updated.benefits,
                createdAt: updated.createdAt.toISOString(),
                context: null
            };
        }
    }
};
