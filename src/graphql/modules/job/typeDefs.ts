import { gql } from 'apollo-server';

export const jobTypeDefs = gql`
  scalar JSON

  enum JobStatus {
    OPEN
    CLOSED
    DRAFT
  }

  enum JobType {
    FULL_TIME
    PART_TIME
    CONTRACT
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    status: JobStatus!
    type: JobType!
    applicants: Int!
    skillsRequired: JSON!
    benefits: JSON!
    createdAt: String!
    context: String
  }

  type JobsResponse {
    jobs: [Job!]!
    totalJobsCount: Int!
  }

  type JobEdge {
   cursor: String!
   node: Job!
  }

  type JobConnection {
    edges: [JobEdge!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }

  input JobInput {
    title: String!
    description: String!
    status: JobStatus
    type: JobType
    skillsRequired: JSON!
    benefits: JSON!
  }

  type Query {
    publicJobs(first: Int, after: String): JobConnection!
    jobs(
      search: String
      status: JobStatus
      skip: Int = 0
      take: Int = 10
    ): JobsResponse!
    getJobById(id: ID!): Job!
  }

  type Mutation {
    createJob(input: JobInput!): Job!
    updateJob(id: ID!, input: JobInput!): Job!
    updateJobStatus(id: ID!, status: JobStatus!): Job!
  }
`;
