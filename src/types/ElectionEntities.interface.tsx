export interface ElectionEntitiesMetaData {
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
}
