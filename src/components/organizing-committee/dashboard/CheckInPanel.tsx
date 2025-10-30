import { Card, Button } from "antd";
import { CameraOutlined, QrcodeOutlined } from "@ant-design/icons";

const CheckInPanel: React.FC = () => {
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
                <Button type="primary" icon={<CameraOutlined />} className="scan-btn">
                    Bắt đầu Quét QR
                </Button>
            </div>

            {/* Kết quả Check-in */}
            <Card size="small" className="valid-card">
                <p className="valid-title">HỢP LỆ</p>
                <p className="valid-name">Nguyễn Thị Lan Anh</p>
                <small className="valid-code">Mã ĐB: NV0078</small>
            </Card>
        </Card>
    );
};

export default CheckInPanel;
