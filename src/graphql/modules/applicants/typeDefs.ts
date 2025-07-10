import { gql } from 'apollo-server';

export const applicantTypeDefs = gql`
  scalar Upload

  enum Stage {
    APPLIED
    SHORTLISTED
    INTERVIEWED
    HIRED
    REJECTED
  }

  type ApplicantRow {
    id: ID!
    name: String!
    email: String!
    stage: Stage!
    position: String!
    appliedAt: String!
  }

  type ApplicantsResponse {
    applicants: [ApplicantRow!]!
    totalApplicantsCount: Int!
  }

  type ApplicantEdge {
   node: ApplicantRow!
   cursor: String!
 }

 type ApplicantConnection {
  edges: [ApplicantEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
 }

 type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
 }

  type JobRef {
  id: ID!
  title: String!
  }

  type Applicant {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    jobId: ID!
    job: JobRef!   
    stage: Stage!
    cv: String!
    coverLetter: String!
    message: String
    appliedAt: String!
  }

  input ApplicantTextInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    jobId: ID!
    message: String
  }

  extend type Query {
    applicants(
    search: String
    stage: Stage
    first: Int
    after: String
    last: Int
    before: String
  ): ApplicantConnection!
    getApplicantById(id: ID!): Applicant!

  }

  extend type Mutation {
    submitApplicationText(input: ApplicantTextInput!, cv: Upload!, coverLetter: Upload!): Applicant!
    updateApplicantStage(id: ID!, stage: Stage!): ApplicantRow!

  }
`;
