import { User } from "./User.interface";

export interface ElectionEntitiesMetaData {
    type: "project" | "person" | "other";
    projectName?: string;
    fullName: string;
    age: number;
    department: string;
    position: string;
    experience: string;
    achievements: string;
    imageUrl: string;
}


export interface ElectionEntities {
    _id: string;
    title: string;
    description: string;
    metaData: ElectionEntitiesMetaData;
    fileUrl: string;
    status: string;

    // thêm đúng từ API  
    electionId: any;
    electionTypeId: {
        _id: string;
        typeName: string;
        typeCode: string;
    };
    proposerId: User;
}
