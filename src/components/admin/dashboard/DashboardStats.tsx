import { Card } from "antd";
import {
    BarChartOutlined,
    UserOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import "../../../style/admin/Dashboard.model.css";
import { JSX } from "react";

export interface Stats {
    icon: JSX.Element;
    title: string;
    value: number;
    color: string;
}

interface DashboardStatsProps {
  stats?: Stats[]; // có thể undefined
}

const DashboardStats = ({stats = []}: DashboardStatsProps) => {
    return (
        <div className="dashboard-stats">
            {stats.map((s, i) => (
                <Card
                    key={i}
                    className="dashboard-card"
                    style={{
                        borderTop: `5px solid ${s.color}`,
                        gap: "20px"
                    }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                >
                    <div className="dashboard-card-body">
                        <div className="dashboard-icon-box">{s.icon}</div>

                        <div className="dashboard-content">
                            <p className="dashboard-value">{s.value}</p>
                            <p className="dashboard-title">{s.title}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;
