import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { authTypeDefs } from './auth/typeDefs';
import { authResolvers } from './auth/resolvers';

import { jobTypeDefs } from './job/typeDefs';
import { jobResolvers } from './job/resolvers';

export const typeDefs = mergeTypeDefs([authTypeDefs, jobTypeDefs]);
export const resolvers = mergeResolvers([authResolvers, jobResolvers]);
