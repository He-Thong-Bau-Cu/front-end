import CheckInPanel from "@/components/organizing-committee/dashboard/CheckInPanel";
import CommitteeInfo from "@/components/organizing-committee/dashboard/CommitteeInfo";
import DelegateManagement from "@/components/organizing-committee/dashboard/DelegateManagement";
import VerificationPanel from "@/components/organizing-committee/dashboard/VerificationPanel";
import { Row, Col } from "antd";
import '../../style/organizing-committee/Dashboard.model.css'


const Dashboard: React.FC = () => {
    return (
        <div >
            <CommitteeInfo />

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <CheckInPanel />
                </Col>
                <Col xs={24} lg={8}>
                    <VerificationPanel />
                    <DelegateManagement />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
