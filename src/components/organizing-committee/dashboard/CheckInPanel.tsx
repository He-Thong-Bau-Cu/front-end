import { Card, Button } from "antd";
import { QrcodeOutlined, ScanOutlined } from "@ant-design/icons";
import QRScannerPanel from "../checkin/QRScannerPanel";
import { useNavigate } from "react-router-dom";

const CheckInPanel: React.FC = () => {
    const navigate = useNavigate(); // 👈 hook điều hướng

    const handleStartScan = () => {
    navigate("/organizing-committee/checkin");
  };
    return (
        <Card
            title={
                <span className="checkin-title">
                    <QrcodeOutlined className="checkin-icon" />
                    Tác vụ Check-in
                </span>
            }
            className="checkin-card">
            {/* Vùng quét QR */}
            <div className="qr-area">
                <div className="qr-placeholder">
                    <div className="qr-icon">🧾</div>
                    <p>Hướng camera của thiết bị vào mã QR trên thẻ</p>
                </div>
            </div>

            {/* Nút bắt đầu quét */}
            <div className="scan-btn-container">
                <Button type="primary" icon={<ScanOutlined />} className="scan-btn" onClick={handleStartScan}>
                    Bắt đầu Quét QR
                </Button>
            </div>
        </Card>
    );
};

export default CheckInPanel;
