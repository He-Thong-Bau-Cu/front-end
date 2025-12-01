import HeaderSecretary from "@/components/secretary/dashboard/HeaderSecretary";
import SecretaryStats from "@/components/secretary/dashboard/SecretaryStats";
import '../../style/secretary/Dashboard.model.css'
import { Col, Row } from "antd";
import DelegationRequests from "@/components/secretary/dashboard/DelegationRequests";

const Dashboard = () => {
    return (
        <div>
            <HeaderSecretary />
            <SecretaryStats />

            <Row gutter={[24, 24]} >
                <Col xs={24} lg={24}>
                    <DelegationRequests />
                </Col>

            </Row>
        </div>
    );
};

export default Dashboard;

