import { gql } from 'apollo-server';

export const authTypeDefs = gql`
  type AuthPayload {
    token: String!
  }

  type Mutation {
    signup(
      email: String!
      password: String!
      firstName: String
      lastName: String
    ): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
  }
`;
