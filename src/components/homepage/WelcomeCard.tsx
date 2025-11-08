import React from "react";
import { Card, Typography, Row, Col, Statistic } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

interface WelcomeCardProps {
    userName: string;
    stats: any;
}

const WelcomeCard: React.FC<WelcomeCardProps> = ({ userName, stats }) => {

    return (
        <Card
            style={{
                borderRadius: 16,
                border: "1px solid rgba(230, 242, 234, 0.8)",
                boxShadow: "0 4px 24px rgba(18, 77, 45, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                overflow: "hidden",
                position: "relative",
            }}
            bodyStyle={{
                padding: "24px",
            }}
        >
            {/* Decorative elements */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "120px",
                    height: "120px",
                    background: "radial-gradient(circle, rgba(76, 175, 80, 0.1) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(30%, -30%)",
                    pointerEvents: "none",
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "80px",
                    height: "80px",
                    background: "radial-gradient(circle, rgba(18, 77, 45, 0.08) 0%, transparent 70%)",
                    borderRadius: "50%",
                    transform: "translate(-30%, 30%)",
                    pointerEvents: "none",
                }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
                <Title
                    level={5}
                    style={{
                        marginTop: 0,
                        marginBottom: 16,
                        color: "#124d2d",
                        fontWeight: 600,
                        fontSize: 20,
                        letterSpacing: "0.3px",
                    }}
                >
                    Xin chào, {userName}! 👋
                </Title>
                <Text
                    style={{
                        color: "#4e6b55",
                        fontSize: 14,
                        lineHeight: 1.6,
                        display: "block",
                        marginBottom: 20,
                    }}
                >
                    Đây là trang tổng quan bầu cử của bạn. Xem nhanh các cuộc bầu cử đã/đang
                    diễn ra và vai trò của bạn trong từng cuộc họp.
                </Text>

                {/* Statistics */}
                <div
                    style={{
                        marginTop: 20,
                        paddingTop: 20,
                        borderTop: "1px solid rgba(230, 242, 234, 0.6)",
                    }}
                >
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Statistic
                                    title={
                                        <Text style={{ color: "#666", fontSize: 12 }}>
                                            Tổng số cuộc bầu cử
                                        </Text>
                                    }
                                    value={stats.totalElections}
                                    prefix={<UserOutlined style={{ color: "#4caf50" }} />}
                                    valueStyle={{
                                        color: "#124d2d",
                                        fontWeight: 600,
                                        fontSize: 24,
                                    }}
                                />
                            </motion.div>
                        </Col>
                        <Col span={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Statistic
                                    title={
                                        <Text style={{ color: "#666", fontSize: 12 }}>
                                            Sắp diễn ra
                                        </Text>
                                    }
                                    value={stats.upcomingElections}
                                    prefix={<ClockCircleOutlined style={{ color: "#d48806" }} />}
                                    valueStyle={{
                                        color: "#d48806",
                                        fontWeight: 600,
                                        fontSize: 20,
                                    }}
                                />
                            </motion.div>
                        </Col>
                        <Col span={12}>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <Statistic
                                    title={
                                        <Text style={{ color: "#666", fontSize: 12 }}>
                                            Đã hoàn thành
                                        </Text>
                                    }
                                    value={stats.completedElections}
                                    prefix={<CheckCircleOutlined style={{ color: "#1677ff" }} />}
                                    valueStyle={{
                                        color: "#1677ff",
                                        fontWeight: 600,
                                        fontSize: 20,
                                    }}
                                />
                            </motion.div>
                        </Col>
                    </Row>
                </div>
            </div>
        </Card>
    );
};

export default WelcomeCard;
