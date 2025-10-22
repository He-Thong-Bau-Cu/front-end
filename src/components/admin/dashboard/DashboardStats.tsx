import { Card } from "antd";
import {
    BarChartOutlined,
    UserOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import "../../../style/admin/Dashboard.model.css";

const DashboardStats = () => {
    const stats = [
        {
            icon: <BarChartOutlined style={{ fontSize: 36, color: "#124d2d" }} />,
            title: "Tổng số bầu cử",
            value: 12,
            change: "+2 so với tháng trước",
            color: "#27AE60",
        },
        {
            icon: <UserOutlined style={{ fontSize: 36, color: "#124d2d" }} />,
            title: "Tổng số cử tri",
            value: 1234,
            change: "+45 cử tri mới",
            color: "#1d4dc4",
        },
        {
            icon: <PieChartOutlined style={{ fontSize: 36, color: "#124d2d" }} />,
            title: "Tỷ lệ tham gia",
            value: "87%",
            change: "+5% so với trước",
            color: "#c41d1d",
        },
        {
            icon: <CheckCircleOutlined style={{ fontSize: 36, color: "#124d2d" }} />,
            title: "Hoàn thành",
            value: 7,
            change: "+1 tuần này",
            color: "#f39c12",
        },
    ];

    return (
        <div className="dashboard-stats">
            {stats.map((s, i) => (
                <Card
                    key={i}
                    className="dashboard-card"
                    style={{
                        borderTop: `5px solid ${s.color}`,
                        gap: "24px"
                    }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                >
                    <div className="dashboard-card-body">
                        <div className="dashboard-icon-box">{s.icon}</div>

                        <div className="dashboard-content">
                            <p className="dashboard-value">{s.value}</p>
                            <p className="dashboard-title">{s.title}</p>
                            <p className="dashboard-change">{s.change}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;
