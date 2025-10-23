import { Card, Col, Row, Typography } from "antd";
const { Title, Text } = Typography;

const stats = [
    { label: "Tổng số lần bỏ phiếu", value: "12" },
    { label: "Năm nay", value: "5" },
    { label: "Tỷ lệ tham gia", value: "95%" },
    { label: "Lần gần nhất", value: "15/09/2024" },
];

const VotingHeader = () => (
    <Card className="voting-header-card">
        <div className="voting-header-top">
            <div>
                <Title level={3} style={{ marginBottom: 0, marginTop: 0 }}>
                    Lịch sử Bỏ phiếu
                </Title>
                <Text type="secondary">Xem lại tất cả các cuộc bầu cử bạn đã tham gia</Text>
            </div>
        </div>

        <Row gutter={16} className="voting-stats-row">
            {stats.map((s, i) => (
                <Col xs={24} sm={12} md={6} key={i}>
                    <Card bordered className="voting-stat-card">
                        <Text className="voting-stat-value">{s.value}</Text>
                        <p className="voting-stat-label">{s.label}</p>
                    </Card>
                </Col>
            ))}
        </Row>
    </Card>
);

export default VotingHeader;
