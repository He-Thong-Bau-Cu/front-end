import { Card, Row, Col, Typography } from "antd";
import "../../../style/admin/Statistics.model.css";

const { Text } = Typography;

const RealTimeData = () => {
    const data = [
        { value: "1,247", label: "Người đang hoạt động", desc: "Cập nhật 5 giây trước" },
        { value: "342", label: "Đang bỏ phiếu", desc: "Cập nhật 3 giây trước" },
        { value: "68%", label: "Tiến độ hiện tại", desc: "Cập nhật 8 giây trước" },
        { value: "156", label: "Phiếu trong 1h", desc: "Cập nhật 5 giây trước" },
    ];

    return (
        <Card
            title={<Text strong className="realtime-title">⚡ Dữ liệu thời gian thực</Text>}
            className="realtime-card"
        >
            <Row gutter={16}>
                {data.map((item, i) => (
                    <Col xs={24} sm={12} md={6} key={i}>
                        <Card bordered className="realtime-item-card">
                            <Text className="realtime-item-value">{item.value}</Text>
                            <div className="realtime-item-label">{item.label}</div>
                            <div className="realtime-item-desc">{item.desc}</div>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Card>
    );
};

export default RealTimeData;
