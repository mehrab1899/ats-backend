import { PrismaClient, JobStatus } from '@prisma/client';
import type { Prisma } from '@prisma/client'; // ✅ ACTUALLY IMPORT THE TYPES
import { AuthenticationError } from 'apollo-server-errors';
import { GraphQLJSON } from 'graphql-type-json';
import { JobWithApplicantCount } from '../../../types/job';

type JobWithApplicants = Prisma.JobGetPayload<{
    include: { applicants: true };
}>;

export const jobResolvers = {
    JSON: GraphQLJSON,

    Query: {
        jobs: async (
            _: unknown,
            __: unknown,
            { prisma }: { prisma: PrismaClient }
        ): Promise<JobWithApplicantCount[]> => {
            const jobs = await prisma.job.findMany({
                include: { applicants: true },
                orderBy: { createdAt: 'desc' }
            });

            return jobs.map((job: JobWithApplicants) => ({
                id: job.id,
                title: job.title,
                description: job.description,
                status: job.status,
                createdAt: job.createdAt.toISOString(),
                applicantCount: job.applicants.length,
                skillsRequired: job.skillsRequired,
                benefits: job.benefits
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
                    skillsRequired: any;
                    benefits: any;
                };
            },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ): Promise<JobWithApplicantCount> => {
            if (!admin) {
                throw new AuthenticationError('Only admins can create jobs');
            }

            const job = await prisma.job.create({
                data: {
                    title: input.title,
                    description: input.description,
                    status: input.status ?? JobStatus.OPEN,
                    skillsRequired: input.skillsRequired,
                    benefits: input.benefits
                }
            });

            return {
                id: job.id,
                title: job.title,
                description: job.description,
                status: job.status,
                createdAt: job.createdAt.toISOString(),
                applicantCount: 0,
                skillsRequired: job.skillsRequired,
                benefits: job.benefits
            };
        },
        updateJob: async (
            _: unknown,
            {
                id,
                input
            }: {
                id: number;
                input: Partial<{
                    title: string;
                    description: string;
                    status: Prisma.JobStatus;
                    skillsRequired: Prisma.InputJsonValue;
                    benefits: Prisma.InputJsonValue;
                }>;
            },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ): Promise<JobWithApplicantCount> => {
            if (!admin) throw new AuthenticationError('Only admins can update jobs');

            const existingJob = await prisma.job.findUnique({
                where: { id },
                include: { applicants: true }
            });

            if (!existingJob) throw new UserInputError(`Job with ID ${id} not found`);

            const updatedJob = await prisma.job.update({
                where: { id },
                data: {
                    title: input.title ?? existingJob.title,
                    description: input.description ?? existingJob.description,
                    status: input.status ?? existingJob.status,
                    skillsRequired: input.skillsRequired ?? existingJob.skillsRequired,
                    benefits: input.benefits ?? existingJob.benefits
                }
            });

            return {
                id: updatedJob.id,
                title: updatedJob.title,
                description: updatedJob.description,
                status: updatedJob.status,
                createdAt: updatedJob.createdAt.toISOString(),
                applicantCount: existingJob.applicants.length,
                skillsRequired: updatedJob.skillsRequired,
                benefits: updatedJob.benefits
            };
        },
        updateJobStatus: async (
            _: unknown,
            { id, status }: { id: string; status: JobStatus },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ): Promise<JobWithApplicantCount> => {
            if (!admin) {
                throw new AuthenticationError('Only admins can update job status');
            }

            const existing = await prisma.job.findUnique({
                where: { id },
                include: { applicants: true }
            });

            if (!existing) {
                throw new UserInputError(`Job with ID ${id} not found`);
            }

            const updated = await prisma.job.update({
                where: { id },
                data: { status }
            });

            return {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                status: updated.status,
                createdAt: updated.createdAt.toISOString(),
                applicantCount: existing.applicants.length,
                skillsRequired: updated.skillsRequired,
                benefits: updated.benefits
            };
        }
    }
};
