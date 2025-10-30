import { Card } from "antd";
import {
    FileTextOutlined,
    TeamOutlined,
    BarChartOutlined,
    BellOutlined,
    UserSwitchOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";
import { JSX } from "react";

interface Action {
    icon: JSX.Element;
    label: string;
}

const actions: Action[] = [
    { icon: <FileTextOutlined />, label: "Tạo quyết định" },
    { icon: <UserSwitchOutlined />, label: "Quản lý ủy viên" },
    { icon: <TeamOutlined />, label: "Quản lý bầu cử" },
    { icon: <BarChartOutlined />, label: "Báo cáo thống kê" },
    { icon: <BellOutlined />, label: "Gửi thông báo" },
];

const QuickActions: React.FC = () => {
    return (
        <Card
            className="quick-card"
            title={
                <span className="quick-title">
                    <ThunderboltOutlined className="quick-title-icon" /> Thao tác nhanh
                </span>
            }
        >
            <div className="quick-grid">
                {actions.map((action, index) => (
                    <div key={index} className="quick-item">
                        <div className="quick-icon">{action.icon}</div>
                        <span className="quick-label">{action.label}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default QuickActions;
