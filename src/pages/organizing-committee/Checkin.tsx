import { Row, Col } from "antd";
import QRScannerPanel from "@/components/organizing-committee/checkin/QRScannerPanel";
import CheckinSidebar from "@/components/organizing-committee/checkin/CheckinSidebar";
import '../../style/organizing-committee/Checkin.model.css'

const Checkin: React.FC = () => {
    return (
        <div className="checkin-container">
            <Row gutter={[24, 0]}>
                <Col xs={24} lg={16}>
                    <QRScannerPanel />
                </Col>

                <Col xs={24} lg={8}>
                    <CheckinSidebar />
                </Col>
            </Row>
        </div>
    );
};

export default Checkin;
