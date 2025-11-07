import ElectionList from "@/components/homepage/ElectionList";
import HomeHeader from "@/components/homepage/HomeHeader";
import QuickActions from "@/components/homepage/QuickActions";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import StatisticsDashboard from "@/components/homepage/StatisticsDashboard";
import CountdownTimer from "@/components/homepage/CountdownTimer";
import ActivityTimeline from "@/components/homepage/ActivityTimeline";
import { Col, Layout, Row, Space } from "antd";
import { motion } from "framer-motion";
import React from "react";
import "../style/HomePage.model.css";

const { Content } = Layout;

const HomePage: React.FC = () => {
    const userName = "Nguyễn Văn Bảnh";

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
            },
        },
    };

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #fafcfb 100%)",
                minWidth: "100vw",
                paddingBottom: "32px",
                position: "relative",
            }}
        >
            {/* Decorative background elements */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "40%",
                    height: "40%",
                    background: "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "30%",
                    height: "30%",
                    background: "radial-gradient(circle, rgba(18, 77, 45, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <HomeHeader />
            <Content
                className="homepage-content"
                style={{
                    position: "relative",
                    zIndex: 1,
                }}
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
               

                    {/* Statistics Dashboard */}
                    <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
                        <StatisticsDashboard />
                    </motion.div>

                    {/* Main Content Row */}
                    <Row gutter={[32, 32]}>
                        {/* Left Column - Main Content */}
                        <Col xs={24} lg={16}>
                            <Space direction="vertical" size={24} style={{ width: "100%" }}>
                                {/* Countdown Timer */}
                                <motion.div variants={itemVariants}>
                                    <CountdownTimer
                                        targetDate="2025-11-15T00:00:00"
                                        electionTitle="Bầu cử nghị quyết số 30"
                                    />
                                </motion.div>

                                {/* Election List */}
                                <motion.div variants={itemVariants}>
                                    <ElectionList />
                                </motion.div>
                            </Space>
                        </Col>

                        {/* Right Column - Sidebar */}
                        <Col xs={24} lg={8}>
                            <Space
                                direction="vertical"
                                style={{ width: "100%" }}
                                size={24}
                            >
                                <motion.div variants={itemVariants}>
                                    <WelcomeCard userName={userName} />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <QuickActions />
                                </motion.div>
                                <motion.div variants={itemVariants}>
                                    <ActivityTimeline />
                                </motion.div>
                            </Space>
                        </Col>
                    </Row>
                </motion.div>
            </Content>
        </Layout>
    );
};

export default HomePage;
