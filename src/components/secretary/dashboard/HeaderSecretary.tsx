import { useLoading } from "@/contexts/LoadingContext";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Typography } from "antd";
import { useEffect, useState } from "react";
import "../../../style/voter/Dashboard.model.css";
const { Text } = Typography;

const HeaderSecretary = () => {
    const [user, setUser] = useState<User | null>(null);
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {

        const fetchUserData = async () => {
            try {
                showLoading();
                const userId = localStorage.getItem("userId");
                if (userId) {
                    const userData = await getUserLogin();
                    setUser(userData);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                hideLoading();
            }
        };

        fetchUserData();
    }, []);

    return (
        <Card className="voter-welcome-card">
            <Text strong className="voter-welcome-title">👋 Chào mừng trở lại!</Text>
            <p className="voter-welcome-subtitle">
                Công thông tin bầu cử điện tử của thư ký chủ tọa
            </p>
            <div className="voter-welcome-user">
                <Avatar
                    size={70}
                    src={user?.image}
                    icon={user?.image ? undefined : <UserOutlined />}
                />
                <div>
                    <Text strong className="voter-user-name">
                        {user?.fullName || "Người dùng"}
                    </Text>
                </div>
            </div>
        </Card>
    );
};

export default HeaderSecretary;
