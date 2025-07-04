import { Prisma, PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'graphql-upload';
import 'dotenv/config';
import fs from 'fs';
import { buildSearchFilters } from '../../../utils/searchFilters';
import { Context } from '@/types/context';
import { ApplicantsArgs } from '@/types/applicant';

const VALID_STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'HIRED', 'REJECTED'];


export const applicantResolvers = {
    Upload: GraphQLUpload,

    Query: {
        applicants: async (_: unknown, args: ApplicantsArgs, { prisma }: Context) => {
            const { search = '', stage, first = 10, after } = args;

            const filters: Prisma.ApplicantWhereInput = { ...buildSearchFilters(search, stage) };

            // Convert after cursor to offset
            let cursorFilter = undefined;
            if (after) {
                const cursorId = Buffer.from(after, 'base64').toString('ascii').replace(/^applicant-/, '');
                cursorFilter = { id: cursorId };
            }
            console.log('filters found in applicants query', filters)
            const applicants = await prisma.applicant.findMany({
                where: filters,
                include: {
                    job: { select: { title: true } },
                },
                take: first,
                skip: cursorFilter ? 1 : 0,
                ...(cursorFilter && { cursor: cursorFilter }),
                orderBy: { appliedAt: 'desc' }
            });

            console.log('applicants found', applicants)

            return {
                edges: applicants.map(app => ({
                    cursor: Buffer.from(`applicant-${app.id}`).toString('base64'),
                    node: {
                        id: `applicant-${app.id}`,
                        firstName: app.firstName,
                        lastName: app.lastName,
                        email: app.email,
                        stage: app.stage,
                        appliedAt: app.appliedAt.toISOString(),
                        job: {
                            id: `job-${app.jobId}`,
                            title: app.job.title,
                        },
                    }
                })),
                pageInfo: {
                    hasNextPage: applicants.length === first,
                    hasPreviousPage: !!cursorFilter,
                    startCursor: applicants.length
                        ? Buffer.from(`applicant-${applicants[0].id}`).toString('base64')
                        : null,
                    endCursor: applicants.length
                        ? Buffer.from(`applicant-${applicants[applicants.length - 1].id}`).toString('base64')
                        : null,
                }
            };

        },

        getApplicantById: async (
            _: unknown,
            { id }: { id: string },
            { prisma, admin }: { prisma: PrismaClient; admin?: { adminId: string } }
        ) => {
            if (!admin) throw new AuthenticationError('Only Admin can Access');

            const applicantId = id.replace(/^applicant-/, '');

            const applicant = await prisma.applicant.findUnique({
                where: { id: applicantId },
                include: {
                    job: true
                }
            });

            if (!applicant) {
                throw new UserInputError('Applicant not found');
            }

            return {
                __typename: 'Applicant',
                id: `applicant-${applicant.id}`,
                firstName: applicant.firstName,
                lastName: applicant.lastName,
                email: applicant.email,
                phone: applicant.phone,
                stage: applicant.stage,
                job: applicant.job,
                cv: applicant.cv,
                coverLetter: applicant.coverLetter,
                appliedAt: applicant.appliedAt.toISOString(),
            };
        }
    },


    Mutation: {
        submitApplicationText: async (
            _: unknown,
            {
                input,
                cv,
                coverLetter
            }: {
                input: {
                    firstName: string;
                    lastName: string;
                    email: string;
                    phone: string;
                    jobId: string;
                    message?: string;
                };
                cv: Promise<FileUpload>;
                coverLetter: Promise<FileUpload>;
            },
            { prisma }: { prisma: PrismaClient }
        ) => {
            const jobIdTrimmed = input.jobId.replace(/^job-|^admin-job-/, '');  // Strip prefix

            const job = await prisma.job.findUnique({ where: { id: jobIdTrimmed } });
            if (!job) throw new UserInputError('Job not found');

            const existing = await prisma.applicant.findUnique({ where: { email: input.email } });
            if (existing) throw new UserInputError('You have already applied with this email');

            const saveFile = async (upload: Promise<FileUpload>, prefix: string) => {
                const { createReadStream, filename } = await upload;
                const stream = createReadStream();
                const uniqueName = `${prefix}-${uuidv4()}${path.extname(filename)}`;
                const uploadPath = path.join(process.cwd(), 'uploads');
                const filePath = path.join(uploadPath, uniqueName);

                // Ensure uploads folder exists (optional but safe)
                await fs.promises.mkdir(uploadPath, { recursive: true });

                await new Promise((resolve, reject) => {
                    const writeStream = createWriteStream(filePath);
                    stream.pipe(writeStream);
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                const baseUrl = process.env.APP_BASE_URL || 'http://localhost:4000';
                return `${baseUrl}/uploads/${uniqueName}`;
            };


            const cvPath = await saveFile(cv, 'cv');
            const coverLetterPath = await saveFile(coverLetter, 'cover');

            const applicant = await prisma.applicant.create({
                data: {
                    ...input,
                    jobId: jobIdTrimmed,
                    cv: cvPath,
                    coverLetter: coverLetterPath
                }
            });

            return applicant;
        },
        updateApplicantStage: async (
            _: unknown,
            args: { id: string; stage: string },
            { prisma }: { prisma: PrismaClient }
        ) => {
            const VALID_STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'HIRED', 'REJECTED'];

            if (!VALID_STAGES.includes(args.stage)) {
                throw new UserInputError('Invalid stage value');
            }
            const applicantId = args.id.replace(/^applicant-/, '');
            console.log('app id', applicantId)
            const updated = await prisma.applicant.update({
                where: { id: applicantId },
                data: { stage: args.stage }
            });

            return {
                id: `applicant-${updated.id}`,
                stage: updated.stage
            };
        }

    }
};
