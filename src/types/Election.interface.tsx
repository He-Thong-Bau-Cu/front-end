export interface Election {
    _id: string;
    title: string;
    electionType: string;
    votingMethod: string;
    startDate: string;
    endDate: string;
    status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
    createdBy: number;
    companyType: string;
    createdAt: string;
    updatedAt: string;
}
