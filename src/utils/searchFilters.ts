export function buildSearchFilters(search?: string, stage?: string) {
    const filters: any = {};
    const orConditions: any[] = [];

    const normalizedSearch = search?.trim();
    const normalizedStage = stage?.toUpperCase();

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

    if (normalizedStage && ['APPLIED', 'SHORTLISTED', 'INTERVIEWED', 'HIRED', 'REJECTED'].includes(normalizedStage)) {
        filters.stage = normalizedStage;
    }

    return filters;
}
