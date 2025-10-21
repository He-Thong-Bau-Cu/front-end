import { Card } from "antd";
import {
    BarChartOutlined,
    TeamOutlined,
    AimOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import "../../../style/admin/Statistics.model.css";

const StatisticsStats = () => {
    const stats = [
        {
            icon: <BarChartOutlined style={{ fontSize: 36, color: "#2F80ED" }} />,
            title: "Tổng số bầu cử",
            value: "24",
            change: "+4 so với tháng trước",
            color: "#2F80ED",
            bgColor: "#EAF2FD",
        },
        {
            icon: <TeamOutlined style={{ fontSize: 36, color: "#27AE60" }} />,
            title: "Tỷ lệ tham gia TB",
            value: "87.3%",
            change: "+5.2% so với kỳ trước",
            color: "#27AE60",
            bgColor: "#E8F5E9",
        },
        {
            icon: <AimOutlined style={{ fontSize: 36, color: "#E53935" }} />,
            title: "Tổng số phiếu bầu",
            value: "25,678",
            change: "+3,421 tuần này",
            color: "#E53935",
            bgColor: "#FDECEC",
        },
        {
            icon: <CheckCircleOutlined style={{ fontSize: 36, color: "#F39C12" }} />,
            title: "Tỷ lệ hoàn thành",
            value: "92%",
            change: "+8% so với trước",
            color: "#F39C12",
            bgColor: "#FFF8E5",
        },
    ];

    return (
        <div className="statistics-stats">
            {stats.map((s, i) => (
                <Card
                    key={i}
                    className="statistics-card"
                    style={{
                        borderTop: `5px solid ${s.color}`,
                        gap: "24px",
                    }}
                    bodyStyle={{ padding: 0 }}
                    hoverable
                >
                    <div className="statistics-card-body">
                        <div
                            className="statistics-icon-box"
                            style={{ backgroundColor: s.bgColor }}
                        >
                            {s.icon}
                        </div>

                        <div className="statistics-content">
                            <p className="statistics-value">{s.value}</p>
                            <p className="statistics-title">{s.title}</p>
                            <p
                                className="statistics-change"
                                style={{ color: s.color }}
                            >
                                {s.change}
                            </p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default StatisticsStats;
