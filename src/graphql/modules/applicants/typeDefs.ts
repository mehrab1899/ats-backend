// src/modules/applicants/typeDefs.ts
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

  type Applicant {
    id: String!
    firstName: String!
    lastName: String!
    email: String!
    phone: String!
    jobId: String!
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
    jobId: String!
    message: String
  }

  extend type Mutation {
    submitApplicationText(input: ApplicantTextInput!, cv: Upload!, coverLetter: Upload!): Applicant!
  }
`;
