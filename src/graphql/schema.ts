// src/graphql/schema.ts
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { jobTypeDefs } from './typeDefs/job';
import { authTypeDefs } from './typeDefs/auth';

import { jobResolvers } from './resolvers/job';
import { authResolvers } from './resolvers/auth';

export const typeDefs = mergeTypeDefs([jobTypeDefs, authTypeDefs]);
export const resolvers = mergeResolvers([jobResolvers, authResolvers]);
