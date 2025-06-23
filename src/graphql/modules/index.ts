import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { authTypeDefs } from './auth/typeDefs';
import { authResolvers } from './auth/resolvers';

import { jobTypeDefs } from './job/typeDefs';
import { jobResolvers } from './job/resolvers';

import { applicantTypeDefs } from './applicants/typeDefs';
import { applicantResolvers } from './applicants/resolvers';

import { analyticsTypeDefs } from './analytics/typeDefs';
import { analyticsResolvers } from './analytics/resolvers';

export const typeDefs = mergeTypeDefs([authTypeDefs, jobTypeDefs, applicantTypeDefs, analyticsTypeDefs]);
export const resolvers = mergeResolvers([authResolvers, jobResolvers, applicantResolvers, analyticsResolvers]);
