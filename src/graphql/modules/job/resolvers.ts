import { Prisma } from '@prisma/client';

export const jobResolvers = {
    Query: {
        jobs: async (_: any, __: any, { prisma }: any) => {
            const jobs = await prisma.job.findMany({
                include: {
                    applicants: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return jobs.map((job: Prisma.JobGetPayload<{ include: { applicants: true } }>) => ({
                ...job,
                applicantCount: job.applicants.length
            }));
        }
    },
    Mutation: {}
};
