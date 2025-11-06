import ElectionList from "@/components/homepage/ElectionList";
import HomeHeader from "@/components/homepage/HomeHeader";
import QuickActions from "@/components/homepage/QuickActions";
import WelcomeCard from "@/components/homepage/WelcomeCard";
import { Col, Layout, Row, Space } from "antd";
import React from "react";
import "../style/HomePage.model.css";


const { Content } = Layout;

const HomePage: React.FC = () => {


    const userName = "Nguyễn Văn Bảnh";

    return (
        <Layout
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #ecf4e9 0%, #f7faf7 100%)",
                minWidth: "100vw",
                paddingBottom: "32px",
            }}
        >
            <HomeHeader />
            <Content style={{ padding: "40px 48px" }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <ElectionList />
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
