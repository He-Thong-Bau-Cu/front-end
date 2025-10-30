import { Card, Input, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";

const VerificationPanel: React.FC = () => {
    return (
        <Card
            className="verification-card"
            title={
                <span className="verification-title">
                    <UserOutlined className="verification-icon" />
                    Xác thực & Hỗ trợ
                </span>
            }
            bordered={false}
        >
            <label className="verification-label">Tìm kiếm đại biểu</label>
            <Input
                prefix={<UserOutlined />}
                placeholder="Nhập tên hoặc mã định danh..."
                className="verification-input"
            />
            <Button
                block
                icon={<UserOutlined />}
                className="verification-button"
            >
                Xác thực Check-in Thủ công
            </Button>
        </Card>
    );
};

export default VerificationPanel;
