import React, { useState, useEffect } from "react";
import { Card, Typography, Space, Progress } from "antd";
import { ClockCircleOutlined, FireOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

interface CountdownTimerProps {
    targetDate: string; // Format: "2025-11-15T00:00:00"
    electionTitle: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, electionTitle }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const difference = target - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({
                    days,
                    hours,
                    minutes,
                    seconds,
                    totalSeconds: Math.floor(difference / 1000),
                });
            } else {
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    totalSeconds: 0,
                });
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    const timeUnits = [
        { label: "Ngày", value: timeLeft.days, color: "#4caf50" },
        { label: "Giờ", value: timeLeft.hours, color: "#66bb6a" },
        { label: "Phút", value: timeLeft.minutes, color: "#81c784" },
        { label: "Giây", value: timeLeft.seconds, color: "#a5d6a7" },
    ];

    // Calculate progress (assuming 30 days total countdown)
    const totalDays = 30;
    const daysRemaining = timeLeft.days;
    const progress = ((totalDays - daysRemaining) / totalDays) * 100;

    return (
        <Card
            style={{
                borderRadius: 16,
                border: "1px solid rgba(230, 242, 234, 0.8)",
                boxShadow: "0 4px 24px rgba(18, 77, 45, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 255, 248, 0.95) 100%)",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
                position: "relative",
            }}
            bodyStyle={{ padding: "24px" }}
        >
            {/* Decorative gradient */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "150px",
                    height: "150px",
                    background: "radial-gradient(circle, rgba(76, 175, 80, 0.15) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FireOutlined style={{ color: "#ff4d4f", fontSize: 20 }} />
                        <Text strong style={{ fontSize: 16, color: "#124d2d" }}>
                            Cuộc bầu cử sắp tới
                        </Text>
                    </div>

                    <Text style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
                        {electionTitle}
                    </Text>

                    {/* Progress bar */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <Text style={{ fontSize: 12, color: "#999" }}>Thời gian còn lại</Text>
                            <Text style={{ fontSize: 12, color: "#4caf50", fontWeight: 500 }}>
                                {daysRemaining} ngày
                            </Text>
                        </div>
                        <Progress
                            percent={progress}
                            strokeColor={{
                                "0%": "#a5d6a7",
                                "100%": "#4caf50",
                            }}
                            showInfo={false}
                            style={{ marginBottom: 20 }}
                        />
                    </div>

                    {/* Countdown */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                        {timeUnits.map((unit, index) => (
                            <motion.div
                                key={unit.label}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                style={{
                                    textAlign: "center",
                                    padding: "16px 8px",
                                    background: "rgba(255, 255, 255, 0.8)",
                                    borderRadius: 12,
                                    border: `1px solid ${unit.color}33`,
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "scale(1.05)";
                                    e.currentTarget.style.boxShadow = `0 4px 12px ${unit.color}40`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <motion.div
                                    key={unit.value}
                                    initial={{ scale: 1.2 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Title
                                        level={2}
                                        style={{
                                            margin: 0,
                                            color: unit.color,
                                            fontSize: 28,
                                            fontWeight: 700,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {unit.value.toString().padStart(2, "0")}
                                    </Title>
                                </motion.div>
                                <Text style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>
                                    {unit.label}
                                </Text>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: "center", marginTop: 8 }}>
                        <Text style={{ fontSize: 12, color: "#999" }}>
                            <ClockCircleOutlined style={{ marginRight: 4 }} />
                            Cập nhật theo thời gian thực
                        </Text>
                    </div>
                </Space>
            </div>
        </Card>
    );
};

export default CountdownTimer;

