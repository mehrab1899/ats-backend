import { PrismaClient } from '@prisma/client';
import { UserInputError } from 'apollo-server-errors';
import { GraphQLUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileUpload } from 'graphql-upload';

export const applicantResolvers = {
    Upload: GraphQLUpload,

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
            const job = await prisma.job.findUnique({ where: { id: input.jobId } });
            if (!job) throw new UserInputError('Job not found');

            const existing = await prisma.applicant.findUnique({ where: { email: input.email } });
            if (existing) throw new UserInputError('You have already applied with this email');

            const saveFile = async (upload: Promise<FileUpload>, prefix: string) => {
                const { createReadStream, filename } = await upload;
                const stream = createReadStream();
                const uniqueName = `${prefix}-${uuidv4()}${path.extname(filename)}`;
                const uploadPath = path.join(__dirname, '../../../uploads');
                const filePath = path.join(uploadPath, uniqueName);

                await new Promise((resolve, reject) => {
                    const writeStream = createWriteStream(filePath);
                    stream.pipe(writeStream);
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });

                return `/uploads/${uniqueName}`;
            };

            const cvPath = await saveFile(cv, 'cv');
            const coverLetterPath = await saveFile(coverLetter, 'cover');

            const applicant = await prisma.applicant.create({
                data: {
                    ...input,
                    cv: cvPath,
                    coverLetter: coverLetterPath
                }
            });

            return applicant;
        }
    }
};