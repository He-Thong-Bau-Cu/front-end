import React from "react";
import { Card, Row, Col, Statistic, Typography, Divider } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, BarChartOutlined } from "@ant-design/icons";
import { Line } from "@ant-design/plots";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

const StatisticsDashboard: React.FC = () => {
    // Mock data for chart
    const chartData = [
        { month: "Tháng 7", value: 12 },
        { month: "Tháng 8", value: 18 },
        { month: "Tháng 9", value: 15 },
        { month: "Tháng 10", value: 22 },
        { month: "Tháng 11", value: 28 },
    ];

    const chartConfig = {
        data: chartData,
        xField: "month",
        yField: "value",
        smooth: true,
        color: "#4caf50",
        lineStyle: {
            lineWidth: 3,
            shadowColor: "rgba(76, 175, 80, 0.25)",
            shadowBlur: 8,
        },
        point: {
            size: 4,
            shape: "circle",
            style: {
                fill: "#fff",
                stroke: "#4caf50",
                lineWidth: 2,
            },
        },
        area: {
            style: {
                fill: "l(270) 0:#b7eb8f 1:#ffffff",
                fillOpacity: 0.35,
            },
        },
        xAxis: {
            line: {
                style: { stroke: "#e6f2ea", lineWidth: 1 },
            },
            tickLine: { style: { stroke: "#e6f2ea" } },
            label: { style: { fontSize: 13, fill: "#666", fontWeight: 500 } },
        },
        yAxis: {
            grid: { line: { style: { stroke: "#f0f0f0", lineWidth: 1, lineDash: [4, 4] } } },
            line: { style: { stroke: "#e6f2ea", lineWidth: 1 } },
            label: { style: { fontSize: 12, fill: "#999" } },
        },
        tooltip: {
            shared: true,
            showCrosshairs: true,
            crosshairs: { type: "x" as const, line: { style: { stroke: "#a5d6a7", lineWidth: 1 } } },
            domStyles: {
                "g2-tooltip": {
                    background: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    border: "1px solid rgba(230, 242, 234, 0.8)",
                },
            },
            formatter: (datum: { value: number; month: string }) => ({
                name: "Số cuộc bầu cử",
                value: `${datum.value} cuộc`,
            }),
        },
        animation: {
            appear: { animation: "path-in", duration: 1000, easing: "ease-out" },
            update: { animation: "path-in", duration: 400 },
        },
    };

    const stats = [
        {
            title: "Tổng số cuộc bầu cử",
            value: 28,
            prefix: <FileTextOutlined />,
            suffix: "",
            valueStyle: { color: "#124d2d" },
            trend: "up" as const,
            trendValue: 12,
            bgGradient: "linear-gradient(135deg, rgba(232, 245, 233, 0.8) 0%, rgba(200, 230, 201, 0.6) 100%)",
            borderColor: "rgba(76, 175, 80, 0.3)",
            iconBg: "rgba(76, 175, 80, 0.15)",
        },
        {
            title: "Tỷ lệ tham gia",
            value: 87.5,
            prefix: <UserOutlined />,
            suffix: "%",
            valueStyle: { color: "#4caf50" },
            trend: "up" as const,
            trendValue: 5.2,
            bgGradient: "linear-gradient(135deg, rgba(237, 247, 237, 0.8) 0%, rgba(200, 230, 201, 0.6) 100%)",
            borderColor: "rgba(82, 196, 26, 0.3)",
            iconBg: "rgba(82, 196, 26, 0.15)",
        },
        {
            title: "Đã hoàn thành",
            value: 24,
            prefix: <CheckCircleOutlined />,
            suffix: "",
            valueStyle: { color: "#1677ff" },
            trend: "up" as const,
            trendValue: 8,
            bgGradient: "linear-gradient(135deg, rgba(230, 244, 255, 0.8) 0%, rgba(186, 224, 255, 0.6) 100%)",
            borderColor: "rgba(22, 119, 255, 0.3)",
            iconBg: "rgba(22, 119, 255, 0.15)",
        },
        {
            title: "Đang chờ",
            value: 4,
            prefix: <ClockCircleOutlined />,
            suffix: "",
            valueStyle: { color: "#d48806" },
            trend: "down" as const,
            trendValue: 2,
            bgGradient: "linear-gradient(135deg, rgba(255, 247, 230, 0.8) 0%, rgba(255, 231, 186, 0.6) 100%)",
            borderColor: "rgba(250, 173, 20, 0.3)",
            iconBg: "rgba(250, 173, 20, 0.15)",
        },
    ];

    return (
        <Card
            className="statistics-dashboard"
            style={{
                borderRadius: 20,
                border: "1px solid rgba(230, 242, 234, 0.8)",
                boxShadow: "0 8px 32px rgba(18, 77, 45, 0.1), 0 4px 16px rgba(0, 0, 0, 0.06)",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                overflow: "hidden",
                position: "relative",
            }}
            headStyle={{
                borderBottom: "1px solid rgba(230, 242, 234, 0.6)",
                padding: "24px 32px",
                background: "transparent",
            }}
            bodyStyle={{ padding: "32px" }}
            title={
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div
                        style={{
                            width: 5,
                            height: 32,
                            background: "linear-gradient(180deg, #4caf50 0%, #81c784 100%)",
                            borderRadius: 4,
                            boxShadow: "0 2px 8px rgba(76, 175, 80, 0.3)",
                        }}
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 10,
                                background: "linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(129, 199, 132, 0.1) 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <BarChartOutlined style={{ fontSize: 20, color: "#4caf50" }} />
                        </div>
                        <Title level={4} style={{ margin: 0, color: "#124d2d", fontSize: 20, fontWeight: 600, letterSpacing: "0.3px" }}>
                            Thống kê tổng quan
                        </Title>
                    </div>
                </div>
            }
        >
            <Row gutter={[20, 20]} style={{ marginBottom: 32 }}>
                {stats.map((stat, index) => (
                    <Col xs={24} sm={12} md={6} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
                            style={{ height: "100%" }}
                        >
                            <Card
                                style={{
                                    borderRadius: 16,
                                    border: `1px solid ${stat.borderColor}`,
                                    background: stat.bgGradient,
                                    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                                    height: "100%",
                                    position: "relative",
                                    overflow: "hidden",
                                }}
                                bodyStyle={{ padding: "20px" }}
                                hoverable
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px) scale(1.02)";
                                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(18, 77, 45, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {/* Decorative circle */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: -20,
                                        right: -20,
                                        width: 80,
                                        height: 80,
                                        borderRadius: "50%",
                                        background: stat.iconBg,
                                        opacity: 0.5,
                                        pointerEvents: "none",
                                    }}
                                />
                                
                                <div style={{ position: "relative", zIndex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                                        <div
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                background: stat.iconBg,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                                            }}
                                        >
                                            <span style={{ color: stat.valueStyle.color, fontSize: 24 }}>
                                                {stat.prefix}
                                            </span>
                                        </div>
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 4,
                                                padding: "4px 8px",
                                                borderRadius: 8,
                                                background: stat.trend === "up" ? "rgba(82, 196, 26, 0.1)" : "rgba(255, 77, 79, 0.1)",
                                            }}
                                        >
                                            {stat.trend === "up" ? (
                                                <ArrowUpOutlined style={{ color: "#52c41a", fontSize: 14 }} />
                                            ) : (
                                                <ArrowDownOutlined style={{ color: "#ff4d4f", fontSize: 14 }} />
                                            )}
                                            <Text style={{ fontSize: 12, color: stat.trend === "up" ? "#52c41a" : "#ff4d4f", fontWeight: 600 }}>
                                                {stat.trendValue}%
                                            </Text>
                                        </div>
                                    </div>

                                    <Statistic
                                        title={
                                            <Text style={{ color: "#666", fontSize: 13, fontWeight: 500, letterSpacing: "0.2px" }}>
                                                {stat.title}
                                            </Text>
                                        }
                                        value={stat.value}
                                        suffix={
                                            <span style={{ fontSize: 20, fontWeight: 600 }}>
                                                {stat.suffix}
                                            </span>
                                        }
                                        valueStyle={{
                                            ...stat.valueStyle,
                                            fontWeight: 700,
                                            fontSize: 32,
                                            lineHeight: 1.2,
                                            marginTop: 8,
                                        }}
                                    />
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Divider style={{ margin: "32px 0", borderColor: "rgba(230, 242, 234, 0.6)" }} />
            
            <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div>
                        <Title level={5} style={{ margin: 0, color: "#124d2d", fontSize: 18, fontWeight: 600, letterSpacing: "0.3px" }}>
                            Xu hướng bầu cử theo tháng
                        </Title>
                        <Text style={{ fontSize: 13, color: "#999", marginTop: 4, display: "block" }}>
                            Thống kê số lượng cuộc bầu cử trong 5 tháng gần nhất
                        </Text>
                    </div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                    style={{
                        background: "linear-gradient(135deg, rgba(248, 255, 248, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)",
                        borderRadius: 16,
                        padding: "24px",
                        border: "1px solid rgba(230, 242, 234, 0.6)",
                    }}
                >
                    <Line {...chartConfig} height={260} />
                </motion.div>
            </div>
        </Card>
    );
};

export default StatisticsDashboard;

