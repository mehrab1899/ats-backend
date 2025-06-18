import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import { typeDefs, resolvers } from './graphql/schema';
import { PrismaClient } from '@prisma/client';
import { getAdminFromRequest } from './auth/middleware';

const prisma = new PrismaClient();
const app = express();

// ✅ CORS setup to allow frontend dev server access
app.use(
    cors({
        origin: 'http://localhost:3000', // your frontend origin
        credentials: true
    })
);

// ✅ File upload middleware (must come before Apollo middleware)
app.use(graphqlUploadExpress({ maxFileSize: 10_000_000, maxFiles: 2 }));

// ✅ Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// ✅ Apollo Server setup
const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        const admin = getAdminFromRequest(req);
        return { prisma, admin };
    }
});

// ✅ Bootstrap function
async function startServer() {
    await server.start();
    server.applyMiddleware({ app });

    const httpServer = http.createServer(app);
    httpServer.listen({ port: 4000 }, () => {
        console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
    });
}

startServer();
