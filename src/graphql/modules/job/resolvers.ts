export const jobResolvers = {
    Query: {
        jobs: async (_: any, __: any, { prisma }: any) => {
            return prisma.job.findMany();
        },
    },
};
