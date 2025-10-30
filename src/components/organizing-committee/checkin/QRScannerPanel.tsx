import { Card } from "antd";
import { QrcodeOutlined } from "@ant-design/icons";

const QRScannerPanel: React.FC = () => {
    return (
        <div className="qr-panel">
            <div className="qr-frame">
                <Card bordered={false} className="qr-card">
                    <div className="qr-box">
                        <QrcodeOutlined className="qr-icon" />
                    </div>
                    <div className="qr-text">
                        <h4>Đưa mã QR của đại biểu vào khung hình</h4>
                        <p>Hệ thống sẽ tự động quét và xác thực</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default QRScannerPanel;
