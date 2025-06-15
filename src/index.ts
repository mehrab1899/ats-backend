import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from './graphql/schema';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        // Attach Prisma and user context (after verifying JWT if needed)
        return { prisma };
    },
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
