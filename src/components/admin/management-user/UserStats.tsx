import { Card } from "antd";
import {
    UsergroupAddOutlined,
    CheckOutlined,
    CloseOutlined,
    PlusSquareOutlined,
} from "@ant-design/icons";
import "../../../style/admin/ManagementUser.model.css";
import { stat } from "fs";

interface UserStatsProps {
  statsData?: any
}

const UserStats = ({ statsData }: UserStatsProps) => {
    const stats = [
        {
            icon: <UsergroupAddOutlined style={{ fontSize: 36, color: "#1d4dc4" }} />,
            title: "Tổng người dùng",
            value: statsData.totalUsers || 0,
            color: "#1d4dc4",
        },
        {
            icon: <CheckOutlined style={{ fontSize: 36, color: "#27AE60" }} />,
            title: "Đang hoạt động",
            value: statsData.activeUsers || 0,
            color: "#27AE60",
        },
        {
            icon: <CloseOutlined style={{ fontSize: 36, color: "#c41d1d" }} />,
            title: "Không hoạt động",
            value: statsData.inactiveUsers || 0,
            color: "#c41d1d",
        },
        {
            icon: <PlusSquareOutlined style={{ fontSize: 36, color: "#f39c12" }} />,
            title: "Người dùng mới",
            value: statsData.newUsers || 0,
            color: "#f39c12",
        },
    ];

    return (
        <div className="user-stats-container">
            {stats.map((s, i) => (
                <Card
                    key={i}
                    className="user-card"
                    style={{ borderTop: `5px solid ${s.color}` }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                >
                    <div className="user-card-body">
                        <div className="user-icon-box">{s.icon}</div>

                        <div className="user-card-content">
                            <p className="user-value">{s.value}</p>
                            <p className="user-title">{s.title}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default UserStats;

