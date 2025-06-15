import { gql } from 'apollo-server';

export const jobTypeDefs = gql`
  type Job {
    id: Int!
    title: String!
    description: String!
  }

  type Query {
    jobs: [Job!]!
  }
`;
