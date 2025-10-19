import { Card } from "antd";
import {
    BarChartOutlined,
    UserOutlined,
    PieChartOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";

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
        <div
            style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: "24px",
                margin: "20px auto",
                padding: "0 32px",
                boxSizing: "border-box",
            }}
        >
            {stats.map((s, i) => (
                <Card
                    key={i}
                    style={{
                        flex: "1 1 calc(25% - 24px)",
                        minWidth: "250px",
                        height: "160px",
                        border: "1px solid #eee",
                        borderRadius: "16px",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        width: "400px",
                        borderTop: `5px solid ${s.color}`,
                        transition: "transform 0.2s ease",
                    }}
                    bodyStyle={{
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        padding: "20px 24px",
                    }}
                    hoverable
                >
                    <div
                        style={{
                            height: 90,
                            width: 90,
                            backgroundColor: "#ECF4E9",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            borderRadius: "12px",
                        }}
                    >
                        {s.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "38px", fontWeight: 600, margin: "0" }}>
                            {s.value}
                        </p>
                        <p style={{ color: "#666", margin: "0" }}>{s.title}</p>
                        <p
                            style={{
                                color: "#27AE60",
                                fontWeight: "bold",
                                margin: "0",
                                fontSize: "14px",
                            }}
                        >
                            {s.change}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default DashboardStats;
