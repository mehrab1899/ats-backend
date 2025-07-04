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

  type JobRef {
    id: ID!
    title: String!
  }

  # Summary view used for table display
  type ApplicantRow {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    stage: Stage!
    appliedAt: String!
    job: JobRef!
  }

  # Relay pagination types
  type ApplicantEdge {
    node: ApplicantRow!
    cursor: String!
  }

  type ApplicantConnection {
    edges: [ApplicantEdge!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
     hasNextPage: Boolean!
     hasPreviousPage: Boolean!
     startCursor: String
     endCursor: String
  }

  # Full applicant profile
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
    # Now fully Relay-compatible
    applicants(search: String, stage: Stage, first: Int, after: String): ApplicantConnection!
    getApplicantById(id: ID!): Applicant!
  }

  extend type Mutation {
    submitApplicationText(input: ApplicantTextInput!, cv: Upload!, coverLetter: Upload!): Applicant!
    updateApplicantStage(id: ID!, stage: Stage!): ApplicantRow!
  }
`;
