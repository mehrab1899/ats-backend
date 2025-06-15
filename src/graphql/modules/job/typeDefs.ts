import { gql } from 'apollo-server';

export const jobTypeDefs = gql`
  enum JobStatus {
    OPEN
    CLOSED
    DRAFT
  }

  type Job {
    id: Int!
    title: String!
    description: String!
    status: JobStatus!
    createdAt: String!
    applicantCount: Int!
  }

  type Query {
    jobs: [Job!]!
  }
`;
