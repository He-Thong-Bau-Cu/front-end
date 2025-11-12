export interface Report {
    _id: string;
    type: string;
    summary?: string;
    description?: string;
    createdAt: string;
    reviewedAt?: string;
    updatedAt?: string;
    fileUrl?: string;
    status?: string;
    severity?: string;
    createdBy?: {
        _id: string;
        username: string;
        fullName: string;
        email: string;
        position?: string;
    };
    reviewedBy?: string | null;
    signedBy?: {
        _id?: string;
        fullName?: string;
        username?: string;
    } | null;
    electionId?: {
        _id: string;
        title?: string;
        decisionNumber?: string;
        decisionName?: string;
        status?: string;
        statusData?: string;
        startDate?: string | null;
        endDate?: string | null;
        delegationStart?: string | null;
        delegationEnd?: string | null;
        createdAt?: string;
        updatedAt?: string;
    };
}
