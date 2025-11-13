import { useLoading } from "@/contexts/LoadingContext";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Typography } from "antd";
import { useEffect, useState } from "react";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const WelcomeCard = () => {
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

    // const formatVoterCode = (userId: string) => {
    //     if (!userId) return "N/A";
    //     // Tạo mã cử tri từ _id (ví dụ: lấy 8 ký tự cuối)
    //     const shortId = userId.slice(-8).toUpperCase();
    //     return `CT-${shortId}`;
    // };


    return (
        <Card className="voter-welcome-card">
            <Text strong className="voter-welcome-title">👋 Chào mừng trở lại!</Text>
            <p className="voter-welcome-subtitle">
                Công thông tin bầu cử điện tử
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
                    {/* <div className="voter-user-info">
                        Mã cử tri: {user ? formatVoterCode(user._id) : "N/A"} |
                        Khu vực: {user?.address || "Chưa cập nhật"}
                    </div> */}
                </div>
            </div>
        </Card>
    );
};

export default WelcomeCard;
