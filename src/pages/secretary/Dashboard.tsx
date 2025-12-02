import HeaderSecretary from "@/components/secretary/dashboard/HeaderSecretary";
import SecretaryStats from "@/components/secretary/dashboard/SecretaryStats";
import '../../style/secretary/Dashboard.model.css'
import { Col, Row } from "antd";
import DelegationRequests from "@/components/secretary/dashboard/DelegationRequests";

const Dashboard = () => {
    return (
        <div>
            <HeaderSecretary />
            <div style={{
                marginLeft: 32,
                marginRight: 32,
                marginTop: 0,
                marginBottom: 0,
                width: 'calc(100% - 64px)',
                boxSizing: 'border-box',
                paddingLeft: 0,
                paddingRight: 0
            }}>
                <SecretaryStats />
            </div>

            <Row gutter={[24, 24]} >
                <Col xs={24} lg={24}>
                    <DelegationRequests />
                </Col>

            </Row>
        </div>
    );
};

export default Dashboard;

