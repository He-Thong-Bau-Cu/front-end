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
