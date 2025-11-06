import React, { useState } from "react";
import { Layout, Row, Col, Space } from "antd";
import HomeHeader from "@/components/homepage/HomeHeader";
import ElectionList from "@/components/homepage/ElectionList";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import QuickActions from "@/components/homepage/QuickActions";
import "../style/HomePage.model.css"


const { Content } = Layout;

const HomePage: React.FC = () => {
    const [elections] = useState<ElectionItem[]>([
        {
            id: 1,
            title: "Đại hội cổ đông thường niên 2025",
            startDate: "15/03/2025",
            endDate: "16/03/2025",
            status: "active",
            role: "Chủ tọa",
        },
        {
            id: 2,
            title: "Bầu ban kiểm soát nhiệm kỳ 2025-2030",
            startDate: "20/04/2025",
            endDate: "21/04/2025",
            status: "upcoming",
            role: "Đại biểu",
        },
    ]);

    const userName = "Nguyễn Văn Bảnh";
    const userRoleCode = "ADMIN";

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #ecf4e9 0%, #f7faf7 100%)",
                minWidth: "100vw",
                paddingBottom: "32px",
            }}
        >
            <HomeHeader userName={userName} userRoleCode={userRoleCode} />
            <Content style={{ padding: "40px 48px" }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <ElectionList elections={elections} />
                    </Col>
                    <Col xs={24} lg={8}>
                        <Space direction="vertical" style={{ width: "100%" }} size={24}>
                            <WelcomeCard userName={userName} />
                            <QuickActions />
                        </Space>
                    </Col>
                </Row>
            </Content>
        </Layout>
    );
};

export default HomePage;
