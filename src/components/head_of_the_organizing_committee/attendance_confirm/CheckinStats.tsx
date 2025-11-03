import React from "react";
import { Card } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

const CheckinStats: React.FC = () => {
    const stats = [
        {
            label: "Đã Check-in",
            value: 98,
            color: "#16a34a",
            bg: "#ecfdf5",
            icon: <CheckCircleOutlined />,
        },
        {
            label: "Chưa Check-in",
            value: 52,
            color: "#eab308",
            bg: "#fefce8",
            icon: <ClockCircleOutlined />,
        },
        {
            label: "Lỗi Check-in",
            value: 3,
            color: "#dc2626",
            bg: "#fef2f2",
            icon: <CloseCircleOutlined />,
        },
        {
            label: "Tốc độ",
            value: "-25/phút",
            color: "#2563eb",
            bg: "#eff6ff",
            icon: <ThunderboltOutlined />,
        },
    ];

    return (
        <Card bordered={false} className="checkin-stats-grid">
            <div className="checkin-stats-container">
                {stats.map((item, i) => (
                    <div className="checkin-stat-box" style={{ backgroundColor: item.bg }} key={i}>
                        <div className="checkin-stat-icon" style={{ color: item.color }}>
                            {item.icon}
                        </div>
                        <div className="checkin-stat-info">
                            <h3 style={{ color: item.color }}>{item.value}</h3>
                            <p>{item.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

export default CheckinStats;
