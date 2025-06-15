export interface JobWithApplicantCount {
    id: number;
    title: string;
    description: string;
    status: 'OPEN' | 'CLOSED' | 'DRAFT';
    createdAt: string;
    applicantCount: number;
    skillsRequired: any;
    benefits: any;
}
