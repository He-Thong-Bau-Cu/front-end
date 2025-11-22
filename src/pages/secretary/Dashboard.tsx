import HeaderSecretary from "@/components/secretary/dashboard/HeaderSecretary";
import SecretaryStats from "@/components/secretary/dashboard/SecretaryStats";
import '../../style/secretary/Dashboard.model.css'
import { Col, Row } from "antd";
import DelegationRequests from "@/components/secretary/dashboard/DelegationRequests";
import ElectionOverview from "@/components/secretary/dashboard/ElectionOverview";
import QuickActions from "@/components/secretary/dashboard/QuickActions";
import RecentActivities from "@/components/secretary/dashboard/RecentActivities";

const Dashboard = () => {
    return (
        <div>
            <HeaderSecretary />
            <SecretaryStats />

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <DelegationRequests />
                    <ElectionOverview />
                </Col>

                <Col xs={24} lg={8}>
                    <RecentActivities />
                    <QuickActions />

                </Col>
            </Row>


        </div>
    );
};

export default Dashboard;

