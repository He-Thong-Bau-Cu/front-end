import ElectionOverview from "@/components/voter/dashboard/ElectionOverview";
import QuickActions from "@/components/voter/dashboard/QuickActions";
import VoterStats from "@/components/voter/dashboard/VoterStats";
import WelcomeCard from "@/components/voter/dashboard/WelcomeCard";
import { Col, Row } from "antd";

const DashboardVoter = () => {
    return (
        <div style={{ padding: "30px 32px" }}>
            <WelcomeCard />
            <VoterStats />

            <Row gutter={24}>
                <Col xs={24} lg={16}>
                    <ElectionOverview />
                </Col>
                <Col xs={24} lg={8}>
                    <QuickActions />
                </Col>
            </Row>
        </div>
    )
}

export default DashboardVoter;