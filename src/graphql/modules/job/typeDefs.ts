import { gql } from 'apollo-server';

export const jobTypeDefs = gql`
  scalar JSON

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
    skillsRequired: JSON!
    benefits: JSON!
    createdAt: String!
    applicantCount: Int!
  }

  input JobInput {
    title: String!
    description: String!
    status: JobStatus
    skillsRequired: JSON!
    benefits: JSON!
  }

  type Query {
    jobs: [Job!]!
  }

  type Mutation {
    createJob(input: JobInput!): Job!
  }
`;
