import { gql } from 'apollo-server';

export const authTypeDefs = gql`
  type AuthPayload {
    token: String!
  }
  
  type Query {
    _: Boolean  # This is just a dummy query to satisfy Apollo's requirement
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
