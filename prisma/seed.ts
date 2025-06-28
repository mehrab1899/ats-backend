import { PrismaClient, JobStatus, JobType, Stage, Prisma } from '@prisma/client';
import { hashPassword } from '../src/auth/auth';

const prisma = new PrismaClient();

async function main() {
    // 🔐 Admin
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: await hashPassword('password123'),
            firstName: 'Super',
            lastName: 'Admin',
        },
    });

    console.log('✅ Admin created:', admin.email);

    // 📌 Jobs
    const jobData: Prisma.JobCreateManyInput[] = [
        {
            title: 'Frontend Developer',
            description: 'React + TypeScript developer needed.',
            skillsRequired: ['React', 'TypeScript', 'CSS Modules'],
            benefits: ['Health Insurance', 'Remote Work'],
            status: JobStatus.OPEN,
            type: JobType.FULL_TIME,
        },
        {
            title: 'Backend Engineer',
            description: 'Experienced in Node.js and GraphQL.',
            skillsRequired: ['Node.js', 'GraphQL', 'Prisma'],
            benefits: ['401k', 'Gym Membership'],
            status: JobStatus.OPEN,
            type: JobType.CONTRACT,
        },
        {
            title: 'DevOps Engineer',
            description: 'AWS, CI/CD expert required.',
            skillsRequired: ['AWS', 'Terraform', 'Docker'],
            benefits: ['Stock Options', 'Remote Work'],
            status: JobStatus.CLOSED, // CHANGED FROM ARCHIVED
            type: JobType.FULL_TIME,
        },
        {
            title: 'Mobile Developer',
            description: 'React Native experience is a must.',
            skillsRequired: ['React Native', 'Redux', 'TypeScript'],
            benefits: ['Health Insurance', 'Annual Retreat'],
            status: JobStatus.OPEN,
            type: JobType.PART_TIME,
        },
        {
            title: 'Data Scientist',
            description: 'Work with ML models and data pipelines.',
            skillsRequired: ['Python', 'Pandas', 'Scikit-Learn'],
            benefits: ['Research Budget', 'Remote'],
            status: JobStatus.OPEN,
            type: JobType.CONTRACT,
        },
        {
            title: 'QA Engineer',
            description: 'Test automation and manual QA.',
            skillsRequired: ['Selenium', 'Cypress', 'Jest'],
            benefits: ['Bonus', 'Remote Work'],
            status: JobStatus.CLOSED,
            type: JobType.FULL_TIME,
        },
        {
            title: 'UI/UX Designer',
            description: 'Crafting seamless user interfaces.',
            skillsRequired: ['Figma', 'Sketch', 'User Research'],
            benefits: ['Flexible Hours', 'Health Insurance'],
            status: JobStatus.OPEN,
            type: JobType.CONTRACT,
        },
        {
            title: 'Tech Support Engineer',
            description: 'Customer-oriented, problem-solver.',
            skillsRequired: ['Communication', 'Linux', 'Networking'],
            benefits: ['401k', 'Health Plan'],
            status: JobStatus.OPEN,
            type: JobType.FULL_TIME,
        },
        {
            title: 'Project Manager',
            description: 'Scrum experience preferred.',
            skillsRequired: ['Agile', 'Jira', 'Confluence'],
            benefits: ['Leadership Bonus', 'Remote Option'],
            status: JobStatus.DRAFT, // CHANGED FROM ARCHIVED
            type: JobType.FULL_TIME,
        },
        {
            title: 'AI Researcher',
            description: 'Deep learning specialist for R&D.',
            skillsRequired: ['TensorFlow', 'PyTorch', 'LLMs'],
            benefits: ['Publication Bonus', 'Work from Anywhere'],
            status: JobStatus.OPEN,
            type: JobType.CONTRACT,
        },
    ];

    await prisma.job.createMany({ data: jobData });

    const jobs = await prisma.job.findMany();
    console.log('✅ Jobs created:', jobs.map((j) => j.title));

    // 👤 Applicants (2 per job, total 20)
    const applicantData: Prisma.ApplicantCreateManyInput[] = [];

    const stages = Object.values(Stage);
    const sampleMessages = [
        'Looking forward to this opportunity.',
        'Excited to contribute!',
        'Strong background in related tech.',
        'Ready to bring value to your team.',
        'Passionate about this domain.',
    ];

    for (let i = 0; i < 20; i++) {
        const job = jobs[i % jobs.length];
        applicantData.push({
            firstName: `Candidate${i + 1}`,
            lastName: `Last${i + 1}`,
            email: `candidate${i + 1}@example.com`,
            phone: `555000${100 + i}`,
            stage: stages[i % stages.length],
            jobId: job.id,
            cv: `http://localhost:4000/uploads/cv${i + 1}.pdf`,
            coverLetter: `http://localhost:4000/uploads/cover${i + 1}.pdf`,
            message: sampleMessages[i % sampleMessages.length],
        });
    }

    for (const ap of applicantData) {
        await prisma.applicant.upsert({
            where: { email: ap.email },
            update: ap,
            create: ap,
        });
    }

    console.log('✅ Applicants created:', applicantData.length);
}

main()
    .then(() => console.log('🎉 Seeding completed.'))
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
