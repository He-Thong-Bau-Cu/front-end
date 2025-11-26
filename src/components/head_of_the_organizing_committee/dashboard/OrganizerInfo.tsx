import { useEffect, useState } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Typography } from "antd";
import { getUserLogin } from "@/utils/auth";
import { User } from "@/types/User.interface";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Text } = Typography;

const OrganizerInfo = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserLogin();
                setUser(userData);
            } catch (error) {
                console.error("Error loading user:", error);
            }
        };
        fetchUser();
    }, []);

    return (
        <Card className="dashboard-header-card">
            <div className="dashboard-header-content">
                <div className="dashboard-header-left">
                    <Text strong className="dashboard-header-title">Trưởng ban tổ chức</Text>
                    <p className="dashboard-header-subtitle">
                        Điều hành và quản lý các cuộc họp
                    </p>

                    <div className="dashboard-header-user">
                        <Avatar
                            size={64}
                            src={user?.imageKey}
                            icon={<UserOutlined />}
                            className="dashboard-avatar"
                        />
                        <div className="dashboard-user-info">
                            <Text strong className="dashboard-user-name">
                                {user?.fullName || user?.username || "Người dùng"}
                            </Text>
                            <p className="dashboard-user-role">
                                {user?.position || "Trưởng ban tổ chức"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default OrganizerInfo;

