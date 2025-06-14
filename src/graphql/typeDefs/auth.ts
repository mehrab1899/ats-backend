import { gql } from 'apollo-server';

export const authTypeDefs = gql`
  type AuthPayload {
    token: String!
  }

  type Mutation {
    signup(username: String!, password: String!): AuthPayload!
    login(username: String!, password: String!): AuthPayload!
  }
`;
