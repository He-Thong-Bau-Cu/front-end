import { Card, Col, Row, Typography } from "antd";
const { Title, Text } = Typography;
const stats = [
    { label: "Tổng số phiếu", value: "12" },
    { label: "Tổng số phiếu đã bỏ", value: "5" },
    { label: "Tổng số phiếu chưa bỏ", value: "7" },
];

const VotingHeader = () => (
    <Card className="voting-header-card">
        <div className="voting-header-top">
            <div style={{ display: 'flex' }}>

                <Title level={5} style={{ marginBottom: 0, marginTop: 0 }}>
                    📊 Xem thống kê tất cả số phiếu trong cuộc bầu cử
                </Title>
            </div>
        </div>

        <Row gutter={16} className="voting-stats-row">
            {stats.map((s, i) => (
                <Col xs={24} sm={12} md={8} key={i}>
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
