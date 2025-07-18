import { PrismaClient } from '@prisma/client';
import { AuthenticationError, UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'graphql-upload';
import 'dotenv/config';
import fs from 'fs';

const VALID_STAGES = ['APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'HIRED', 'REJECTED'];

export const applicantResolvers = {
  Upload: GraphQLUpload,

  Query: {
    applicants: async (
      _: unknown,
      args: { search?: string; stage?: string; skip?: number; take?: number },
      { prisma }: { prisma: PrismaClient }
    ) => {
      const { search = '', stage, skip = 0, take = 10 } = args;

      const normalizedSearch = search.trim();
      const normalizedStage = stage?.toUpperCase();

      const filters: any = {};
      const orConditions: any[] = [];

      if (normalizedSearch) {
        orConditions.push(
          { firstName: { contains: normalizedSearch } },
          { lastName: { contains: normalizedSearch } },
          { email: { contains: normalizedSearch } },
          { phone: { contains: normalizedSearch } },
          {
            job: {
              title: { contains: normalizedSearch }
            }
          }
        );

        if (orConditions.length) {
          filters.OR = orConditions;
        }
      }

      if (normalizedStage && VALID_STAGES.includes(normalizedStage)) {
        filters.stage = normalizedStage as Stage;
      }

      try {
        const applicants = await prisma.applicant.findMany({
          where: filters,
          include: {
            job: { select: { title: true } }
          },
          orderBy: { appliedAt: 'desc' },
          skip,
          take
        });

        const totalApplicantsCount = await prisma.applicant.count({
          where: filters,
        });

        return {
          applicants: applicants.map((app) => ({
            __typename: 'Applicant',
            id: `applicant-${app.id}`,
            firstName: app.firstName,
            lastName: app.lastName,
            name: `${app.firstName} ${app.lastName}`,
            email: app.email,
            phone: '', // Not needed in list view, keep empty
            stage: app.stage,
            jobId: app.jobId,
            job: { id: `job-${app.jobId}`, title: app.job.title },
            position: app.job.title,
            cv: '',
            coverLetter: '',
            message: '',
            appliedAt: app.appliedAt.toISOString(),
          })),
          totalApplicantsCount
        };
      } catch (error) {
        console.error('Error fetching applicants:', error);
        throw new Error('Internal Server Error');
      }
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
        name: `${applicant.firstName} ${applicant.lastName}`,
        email: applicant.email,
        phone: applicant.phone,
        stage: applicant.stage,
        jobId: applicant.jobId,
        job: { id: `job-${applicant.jobId}`, title: applicant.job.title },
        position: applicant.job.title,
        cv: applicant.cv,
        coverLetter: applicant.coverLetter,
        message: applicant.message,
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
      const jobIdTrimmed = input.jobId.replace(/^job-|^admin-job-/, '');

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
        },
        include: {
          job: true
        }
      });

      return {
        __typename: 'Applicant',
        id: `applicant-${applicant.id}`,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        name: `${applicant.firstName} ${applicant.lastName}`,
        email: applicant.email,
        phone: applicant.phone,
        stage: applicant.stage,
        jobId: applicant.jobId,
        job: { id: `job-${applicant.jobId}`, title: applicant.job.title },
        position: applicant.job.title,
        cv: applicant.cv,
        coverLetter: applicant.coverLetter,
        message: applicant.message,
        appliedAt: applicant.appliedAt.toISOString(),
      };
    },

    updateApplicantStage: async (
      _: unknown,
      args: { id: string; stage: string },
      { prisma }: { prisma: PrismaClient }
    ) => {
      if (!VALID_STAGES.includes(args.stage)) {
        throw new UserInputError('Invalid stage value');
      }

      const applicantId = args.id.replace(/^applicant-/, '');

      const updated = await prisma.applicant.update({
        where: { id: applicantId },
        data: { stage: args.stage },
        include: { job: true }
      });

      return {
        __typename: 'Applicant',
        id: `applicant-${updated.id}`,
        firstName: updated.firstName,
        lastName: updated.lastName,
        name: `${updated.firstName} ${updated.lastName}`,
        email: updated.email,
        phone: updated.phone,
        stage: updated.stage,
        jobId: updated.jobId,
        job: { id: `job-${updated.jobId}`, title: updated.job.title },
        position: updated.job.title,
        cv: updated.cv,
        coverLetter: updated.coverLetter,
        message: updated.message,
        appliedAt: updated.appliedAt.toISOString(),
      };
    }
  }
};
