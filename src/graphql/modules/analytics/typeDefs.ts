import { gql } from 'apollo-server';

export const analyticsTypeDefs = gql`
  type DashboardStats {
    activeJobs: Int!
    totalApplicants: Int!
    topJob: String!
    shortlistedCount: Int!
  }

  type MonthlyStats {
    month: String!
    jobs: Int!
    applicants: Int!
    hired: Int!
  }

  extend type Query {
    dashboardStats: DashboardStats!
    monthlyTrends: [MonthlyStats!]!
  }
`;
