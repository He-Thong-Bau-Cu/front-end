import { Card, Input, Button } from "antd";
import { QrcodeOutlined, SearchOutlined } from "@ant-design/icons";

const CheckinTools = () => (
    <Card
        title="🧰 Công cụ"
        bordered={false}
        className="checkin-tools-card"
    >
        <Input
            placeholder="Nhập mã QR hoặc ID đại biểu..."
            prefix={<QrcodeOutlined style={{ color: "#888" }} />}
            className="checkin-tools-input"
        />

        <Input
            placeholder="Tìm kiếm Đại biểu..."
            prefix={<SearchOutlined style={{ color: "#888" }} />}
            className="checkin-tools-input"
        />

        <Button type="primary" block className="checkin-tools-btn">
            ✅ Xác nhận Check-in
        </Button>
    </Card>
);

export default CheckinTools;
