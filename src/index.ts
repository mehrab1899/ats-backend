import { ApolloServer } from 'apollo-server';
import { typeDefs } from '../src/graphql/schema';
import { resolvers } from '../src/graphql/schema';
import { context } from './context';

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});
