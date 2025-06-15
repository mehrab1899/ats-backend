import { ApolloServer } from 'apollo-server';
import { typeDefs, resolvers } from './graphql/schema';
import { PrismaClient } from '@prisma/client';
import { getAdminFromRequest } from './auth/middleware';

const prisma = new PrismaClient();

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const admin = getAdminFromRequest(req);
        return { prisma, admin };
      }
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
