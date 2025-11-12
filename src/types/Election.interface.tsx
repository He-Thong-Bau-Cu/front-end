export interface Election {
    _id: string;
    title: string;
    typeId: {
        _id: string;
        typeName: string;
        typeCode: string;
        description: string;
        status: string;
        updatedAt: string;
        createdAt: string;
    };
    votingMethodId: {
        _id: string;
        methodName: string;
        methodCode: string;
        description: string;
        status: string;
        updatedAt: string;
        createdAt: string;
    };

    thresholdId: {
        _id: string;
        thresholdName: string;
        thresholdCode: string;
        thresholdType: string;
        value: number;
        description: string;
        status: string;
        updatedAt: string;
        createdAt: string;
    };
    startDate: string;
    endDate: string;
    status: "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";
    createdBy: number;
    companyType: string;
    createdAt: string;
    updatedAt: string;
}
