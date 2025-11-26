import React, { useEffect, useState } from "react";
import { Card } from "antd";
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    UserOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

interface CheckinStatsProps {
    checkedInCount: number;
    notCheckedInCount: number;
    totalAttendees: number;
}

const CheckinStats: React.FC<CheckinStatsProps> = ({
    checkedInCount,
    notCheckedInCount,
    totalAttendees,
}) => {
    const [checkinRate, setCheckinRate] = useState<string>("0/phút");

    useEffect(() => {
        // Tính tốc độ check-in (giả sử trong 1 phút gần nhất)
        // Có thể cải thiện bằng cách lưu timestamp và tính toán thực tế
        const calculateRate = () => {
            // Đây là logic đơn giản, có thể cải thiện bằng cách track thời gian thực
            if (checkedInCount > 0 && totalAttendees > 0) {
                const rate = Math.round((checkedInCount / totalAttendees) * 100);
                setCheckinRate(`${rate}%`);
            } else {
                setCheckinRate("0%");
            }
        };
        calculateRate();
    }, [checkedInCount, totalAttendees]);

    const stats = [
        {
            label: "Đã Check-in",
            value: checkedInCount,
            color: "#16a34a",
            bg: "#ecfdf5",
            icon: <CheckCircleOutlined />,
        },
        {
            label: "Chưa Check-in",
            value: notCheckedInCount,
            color: "#eab308",
            bg: "#fefce8",
            icon: <ClockCircleOutlined />,
        },
        {
            label: "Tổng Đại biểu",
            value: totalAttendees,
            color: "#2563eb",
            bg: "#eff6ff",
            icon: <UserOutlined />,
        },
        {
            label: "Tỷ lệ",
            value: checkinRate,
            color: "#7c3aed",
            bg: "#f5f3ff",
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
