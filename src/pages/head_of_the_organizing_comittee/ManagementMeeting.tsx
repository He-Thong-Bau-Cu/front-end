import React from "react";
import { Layout, Row, Col } from "antd";
import EventStatusCard from "@/components/head_of_the_organizing_committee/management-meeting/EventStatusCard";
import EventStageControl from "@/components/head_of_the_organizing_committee/management-meeting/EventStageControl";
import AnnouncementCard from "@/components/head_of_the_organizing_committee/management-meeting/AnnouncementCard";
import '../../style/head-of-the-organizing-committee/ManagementMeeting.model.css'


const ManagementMeeting: React.FC = () => {
    return (
        <Layout
            style={{
                background: "#F3F8F3",
                minHeight: "100vh",
                padding: "24px 40px",
            }}
        >
            {/* HEADER */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ color: "#124D2D", marginBottom: 4 }}>Điều hành Sự kiện: Bầu cử Hội đồng Quản trị 2025</h2>

            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} md={7}>
                    <EventStatusCard />
                </Col>

                <Col xs={24} md={10}>
                    <EventStageControl />
                </Col>

                <Col xs={24} md={7}>
                    <AnnouncementCard />
                </Col>
            </Row>
        </Layout>
    );
};

export default ManagementMeeting;
