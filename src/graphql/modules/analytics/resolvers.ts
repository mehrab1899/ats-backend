import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const prisma = new PrismaClient();

export const analyticsResolvers = {
    Query: {
        dashboardStats: async () => {
            const activeJobs = await prisma.job.count({ where: { status: 'OPEN' } });

            const totalApplicants = await prisma.applicant.count();

            const shortlistedCount = await prisma.applicant.count({
                where: { stage: 'SHORTLISTED' },
            });

            const top = await prisma.applicant.groupBy({
                by: ['jobId'],
                _count: { jobId: true },
                orderBy: { _count: { jobId: 'desc' } },
                take: 1,
            });

            let topJobStr = 'N/A';
            if (top.length > 0) {
                const job = await prisma.job.findUnique({ where: { id: top[0].jobId } });
                topJobStr = `${job?.title || 'Unknown'} – ${top[0]._count.jobId} Applications`;
            }

            return {
                activeJobs,
                totalApplicants,
                shortlistedCount,
                topJob: topJobStr,
            };
        },

        monthlyTrends: async () => {
            const now = new Date();
            const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));

            const result = await Promise.all(
                months.map(async (date) => {
                    const start = startOfMonth(date);
                    const end = endOfMonth(date);
                    const month = format(date, 'MMM');

                    const jobs = await prisma.job.count({
                        where: {
                            createdAt: { gte: start, lte: end },
                        },
                    });

                    const applicants = await prisma.applicant.count({
                        where: {
                            appliedAt: { gte: start, lte: end },
                        },
                    });

                    const hired = await prisma.applicant.count({
                        where: {
                            appliedAt: { gte: start, lte: end },
                            stage: 'HIRED',
                        },
                    });

                    return { month, jobs, applicants, hired };
                })
            );

            return result;
        },
    },
};
