export interface UserRecord {
    key: React.Key;
    name: string;
    email: string;
    role: string;
    department: string;
    status: "Hoạt động" | "Không hoạt động" | "Chờ xác thực";
    lastLogin: string;
    color: string;
}


export interface User {
    _id: string;
    username: string;
    fullName: string;
    email: string;
    phone: string;
    position: string;
    department: string;
    address: string;
    dateOfBirth: string;
    citizenId: string;
    roleId: string;
    status: string;
    image: string;
    imageKey: string;
    isTempPassword: boolean;
    issueCA?: boolean;
    issueCa?: boolean;
    signCa?: string;
    // Số cuộc bầu cử đang tham gia hiện tại (server trả về từ /elections/user-organizer)
    currentElectionCount?: number;

}

export interface User1 {
    fullName: string;
    email: string;
    position: string;
    address: string;
    citizenId: string;
}
