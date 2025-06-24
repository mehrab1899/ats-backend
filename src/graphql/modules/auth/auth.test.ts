import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import request from 'supertest'; // Import Supertest for integration tests
import { prismaMock } from '../../../testHelpers/prismaMock'; // Mock Prisma
import { authResolvers } from './resolvers';
import { authTypeDefs } from './typeDefs';

// Mock the comparePasswords and hashPassword functions from auth.ts
jest.mock('../../../auth/auth', () => ({
    comparePasswords: jest.fn(), // Mock comparePasswords function
    hashPassword: jest.fn(),     // Mock hashPassword function
    generateToken: jest.fn()     // Mock generateToken function
}));

const { comparePasswords, hashPassword, generateToken } = require('../../../auth/auth'); // Import mocked functions

const app = express();  // Create an Express instance for testing
const server = new ApolloServer({
    typeDefs: authTypeDefs,
    resolvers: authResolvers,
    context: () => ({ prisma: prismaMock }) // Mock context
});

// Start the server before applying middleware
beforeAll(async () => {
    await server.start();
    server.applyMiddleware({ app }); // Apply Apollo server middleware to Express
});

describe('Authentication Module Tests', () => {

    it('should successfully sign up a new admin', async () => {
        const SIGNUP = `
      mutation Signup($email: String!, $password: String!) {
        signup(email: $email, password: $password) {
          token
        }
      }
    `;

        // Mock the behavior for creating a new admin
        prismaMock.admin.findUnique = jest.fn().mockResolvedValue(null); // No admin exists with the email
        prismaMock.admin.create = jest.fn().mockResolvedValue({
            id: 'new-admin-id',
            email: 'newAdmin3@test.com',
            password: 'hashed-password'
        });

        hashPassword.mockResolvedValue('hashed-password'); // Mock the hashed password
        generateToken.mockResolvedValue('fake-jwt-token'); // Mock the JWT generation

        const res = await request(app)
            .post('/graphql') // Send POST request to /graphql
            .send({
                query: SIGNUP,
                variables: {
                    email: 'newAdmin3@test.com',
                    password: 'password123'
                }
            });

        console.log(res.body); // Debug the response

        expect(res.status).toBe(200);
        expect(res.body.data.signup.token).toBe('fake-jwt-token'); // Ensure the token is returned
        expect(res.body.errors).toBeUndefined(); // Ensure no errors
    });

    it('should throw an error if the email is already taken', async () => {
        const SIGNUP = `
      mutation Signup($email: String!, $password: String!) {
        signup(email: $email, password: $password) {
          token
        }
      }
    `;

        // Mock the existing admin in the database
        prismaMock.admin.findUnique = jest.fn().mockResolvedValue({
            id: 'existing-admin-id',
            email: 'newAdmin@test.com',
            password: 'hashed-password'
        });

        const res = await request(app)
            .post('/graphql')
            .send({
                query: SIGNUP,
                variables: {
                    email: 'newAdmin@test.com',
                    password: 'password123'
                }
            });

        expect(res.body.errors).toBeDefined(); // Ensure errors are in the response
        expect(res.body.errors[0].message).toBe('Email already exists'); // Ensure the error message matches
    });

    it('should successfully login an existing admin', async () => {
        const LOGIN = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `;

        // Mock the admin in the database
        prismaMock.admin.findUnique = jest.fn().mockResolvedValue({
            id: 'admin-id',
            email: 'newAdmin@test.com',
            password: 'hashed-password'
        });

        comparePasswords.mockResolvedValue(true); // Mock password comparison (valid)

        generateToken.mockResolvedValue('fake-jwt-token'); // Mock the JWT generation

        const res = await request(app)
            .post('/graphql')
            .send({
                query: LOGIN,
                variables: {
                    email: 'newAdmin@test.com',
                    password: 'password123'
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.data.login.token).toBe('fake-jwt-token'); // Ensure token is returned
        expect(res.body.errors).toBeUndefined(); // Ensure no errors
    });

    it('should throw an error for invalid login credentials', async () => {
        const LOGIN = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
        }
      }
    `;

        // Mock the admin in the database
        prismaMock.admin.findUnique = jest.fn().mockResolvedValue({
            id: 'admin-id',
            email: 'newAdmin@test.com',
            password: 'hashed-password'
        });

        comparePasswords.mockResolvedValue(false); // Mock password comparison (invalid)

        const res = await request(app)
            .post('/graphql')
            .send({
                query: LOGIN,
                variables: {
                    email: 'newAdmin@test.com',
                    password: 'wrongpassword'
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.errors[0].message).toBe('Invalid credentials');
    });
});
