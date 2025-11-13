
import { Card, Button, Typography, Avatar, message } from "antd";
import { FileTextOutlined, BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import CreateDecisionModal from "@/components/preside/management-decision/CreateDecisionModal"; // 📂 import component modal mới
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DecisionService from "@/services/DecisionService";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
const { Text } = Typography;

const HeaderSecretary = () => {
    const [open, setOpen] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await getUserLogin();
                setUser(userData as User);
            } catch (error) {
                message.error("Không thể tải thông tin người dùng!");
            }
        };
        fetchUser();
    }, []);
   
    return (
        <Card className="dashboard-header-card">
            <div className="dashboard-header-content">
                <div className="dashboard-header-left">
                    <Text strong className="dashboard-header-title">Thư ký chủ tọa</Text>
                    <p className="dashboard-header-subtitle">
                        Hỗ trợ chủ tịch các công việc trong bầu cử
                    </p>
                    <div className="dashboard-header-user">
                        <Avatar size={64} src={user?.imageKey || undefined}  icon={<UserOutlined />} className="dashboard-avatar" />
                        <div className="dashboard-user-info">
                            <Text strong className="dashboard-user-name">{user?.fullName}</Text>
                            <p className="dashboard-user-role">Thư ký Chủ tọa Hội đồng Bầu cử</p>
                        </div>
                    </div>
                </div>
                {/* <div className="dashboard-header-actions">
                    <Button
                        icon={<FileTextOutlined />}
                        className="btn-create-decision"
                        type="primary"
                        onClick={() => setOpen(true)} // 👈 khi click sẽ mở modal
                    >
                        Tạo quyết định
                    </Button>
                </div> */}
            </div>

            {/* 🧩 Modal nhập thông tin nghị quyết */}
        
        </Card>
    );
};

export default HeaderSecretary;
