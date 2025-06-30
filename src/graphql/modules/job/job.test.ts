import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import request from 'supertest';
import { prismaMock } from '../../../testHelpers/prismaMock'; // Mock Prisma
import { jobResolvers } from './resolvers';
import { jobTypeDefs } from './typeDefs';

jest.mock('../../../auth/auth', () => ({
    comparePasswords: jest.fn(), // Mock comparePasswords function
    hashPassword: jest.fn(),     // Mock hashPassword function
    generateToken: jest.fn()     // Mock generateToken function
}));

const app = express();
const server = new ApolloServer({
    typeDefs: jobTypeDefs,
    resolvers: jobResolvers,
    context: () => ({
        prisma: prismaMock,
        admin: { adminId: 'mock-admin-id' }  // Mock admin context here
    })
});

beforeAll(async () => {
    await server.start();
    server.applyMiddleware({ app });
});

describe('Job Module Tests', () => {

    it('should successfully create a job', async () => {
        const CREATE_JOB = `
      mutation CreateJob($input: JobInput!) {
        createJob(input: $input) {
          id
          title
          description
        }
      }
    `;

        // Mock the behavior for job creation
        prismaMock.job.create = jest.fn().mockResolvedValue({
            id: 'new-job-id',
            title: 'New Job',
            description: 'Job description',
            status: 'OPEN',
            type: 'FULL_TIME',
            skillsRequired: ['React', 'Node'],
            benefits: ['Health insurance'],
            createdAt: new Date()
        });

        const res = await request(app)
            .post('/graphql')
            .send({
                query: CREATE_JOB,
                variables: {
                    input: {
                        title: 'New Job',
                        description: 'Job description',
                        status: 'OPEN',
                        type: 'FULL_TIME',
                        skillsRequired: ['React', 'Node'],
                        benefits: ['Health insurance']
                    }
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.data.createJob.title).toBe('New Job');
        expect(res.body.data.createJob.id).toBeDefined();
    });

    it('should fetch jobs with search and status filter', async () => {
        const GET_JOBS = `
      query GetJobs($search: String, $status: JobStatus) {
        jobs(search: $search, status: $status) {
          jobs {
            id
            title
            status
          }
        }
      }
    `;

        // Mock the behavior for fetching jobs
        prismaMock.job.findMany = jest.fn().mockResolvedValue([
            {
                id: '1',
                title: 'Job 1',
                description: 'Job description 1',
                status: 'OPEN',
                type: 'FULL_TIME',
                skillsRequired: ['React'],
                benefits: ['Health insurance'],
                createdAt: new Date(),
                applicants: []
            }
        ]);

        prismaMock.job.count = jest.fn().mockResolvedValue(1);

        const res = await request(app)
            .post('/graphql')
            .send({
                query: GET_JOBS,
                variables: {
                    search: 'Job',
                    status: 'OPEN'
                }
            });

        expect(res.status).toBe(200);
        expect(res.body.data.jobs.jobs).toHaveLength(1);
        expect(res.body.data.jobs.jobs[0].status).toBe('OPEN');
    });

    it('should get a job by ID', async () => {
        const GET_JOB_BY_ID = `
      query GetJobById($id: ID!) {
        getJobById(id: $id) {
          id
          title
        }
      }
    `;

        // Mock the behavior for fetching a job by ID
        prismaMock.job.findUnique = jest.fn().mockResolvedValue({
            id: '1',
            title: 'Job 1',
            description: 'Job description 1',
            status: 'OPEN',
            type: 'FULL_TIME',
            skillsRequired: ['React'],
            benefits: ['Health insurance'],
            createdAt: new Date(),
            applicants: []
        });

        const res = await request(app)
            .post('/graphql')
            .send({
                query: GET_JOB_BY_ID,
                variables: { id: '1' }
            });
        expect(res.status).toBe(200);
        expect(res.body.data.getJobById.title).toBe('Job 1');
    });

    it('should update job status', async () => {
        const UPDATE_JOB_STATUS = `
      mutation UpdateJobStatus($id: ID!, $status: JobStatus!) {
        updateJobStatus(id: $id, status: $status) {
          id
          status
        }
      }
    `;

        // Mock the behavior for updating job status
        prismaMock.job.update = jest.fn().mockResolvedValue({
            id: '1',
            title: 'Job 1',
            description: 'Job description 1',
            status: 'CLOSED',
            type: 'FULL_TIME',
            skillsRequired: ['React'],
            benefits: ['Health insurance'],
            createdAt: new Date(),
            applicants: []
        });

        const res = await request(app)
            .post('/graphql')
            .send({
                query: UPDATE_JOB_STATUS,
                variables: { id: '1', status: 'CLOSED' }
            });

        console.log('res of status update job', res.body);

        expect(res.status).toBe(200);
        expect(res.body.data.updateJobStatus.status).toBe('CLOSED');
    });
});
