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
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: number } }
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
        }
    }
};
