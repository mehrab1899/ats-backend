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

  type PublicJob {
    id: ID!
    title: String!
    description: String!
    status: JobStatus!
    skillsRequired: JSON!
    benefits: JSON!
    createdAt: String!
    context: String
  }

  type AdminJob {
    id: ID!
    title: String!
    description: String!
    status: JobStatus!
    type: JobType!
    applicants: Int!
    createdAt: String!
    context:String
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    status: JobStatus!
    type: JobType!
    skillsRequired: JSON!
    benefits: JSON!
    createdAt: String!
    applicants: Int!
    context:String
  }

  type JobsResponse {
    jobs: [AdminJob!]!
    totalJobsCount: Int!
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
    publicJobs: [PublicJob!]!
    jobs(
      search: String
      status: JobStatus
      skip: Int = 0
      take: Int = 10
    ): JobsResponse!
    getJobById(id: ID!): Job! 

  }

  type Mutation {
    createJob(input: JobInput!): AdminJob!
    updateJob(id: ID!, input: JobInput!): AdminJob!
    updateJobStatus(id: ID!, status: JobStatus!): AdminJob!
  }
`;
