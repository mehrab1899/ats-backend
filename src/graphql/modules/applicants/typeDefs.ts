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

  type ApplicantsResponse {
    applicants: [Applicant!]!
    totalApplicantsCount: Int!
  }

  type Job {
  id: ID!
  title: String!
  }

  type Applicant {
    id: ID!
    firstName: String!
    lastName: String!
    name: String!       
    email: String!
    phone: String!
    jobId: ID!
    job: Job!
    position: String!      
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
    applicants(search: String, stage: Stage, skip: Int, take: Int): ApplicantsResponse!
    getApplicantById(id: ID!): Applicant!

  }

  extend type Mutation {
    submitApplicationText(input: ApplicantTextInput!, cv: Upload!, coverLetter: Upload!): Applicant!
    updateApplicantStage(id: ID!, stage: Stage!): Applicant!

  }
`;
