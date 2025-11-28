import { Row, Col } from "antd";
import QRScannerPanel from "@/components/organizing-committee/checkin/QRScannerPanel";
import CheckinSidebar from "@/components/organizing-committee/checkin/CheckinSidebar";
import '../../style/organizing-committee/Checkin.model.css'

const Checkin: React.FC = () => {
    return (
        <div
            style={{
                padding: "24px 32px",
                minHeight: "calc(100vh - 64px)",
                backgroundColor: "#f5f5f5",
            }}
        >
            <Row gutter={[24, 24]}>
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
