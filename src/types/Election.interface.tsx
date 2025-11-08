export interface Election {
    _id: string;
    title: string;
    electionType: string;
    votingMethod: string;
    start_date: string;
    end_date: string;
    status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
    createdBy: number;
    companyType: string;
    createdAt: string;
    updatedAt: string;
}
