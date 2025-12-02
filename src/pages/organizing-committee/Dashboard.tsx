import CheckInPanel from "@/components/organizing-committee/dashboard/CheckInPanel";
import CommitteeInfo from "@/components/organizing-committee/dashboard/CommitteeInfo";
import VerificationPanel from "@/components/organizing-committee/dashboard/VerificationPanel";
import StatisticsPanel from "@/components/organizing-committee/dashboard/StatisticsPanel";
import { Row, Col } from "antd";
import '../../style/organizing-committee/Dashboard.model.css'


const Dashboard: React.FC = () => {
    return (
        <div >
            <div style={{
                marginLeft: 32,
                marginRight: 32,
                marginBottom: 20,
                width: 'calc(100% - 64px)',
                boxSizing: 'border-box'
            }}>
                <CommitteeInfo />
            </div>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <CheckInPanel />
                </Col>
                <Col xs={24} lg={8}>
                    <StatisticsPanel />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
