import { Card, Col, Row, Typography } from "antd";

const { Title, Text } = Typography;

const stats = [
    { label: "Bầu cử đang hoạt động", value: 3 },
    { label: "Tổng số cử tri", value: 1250 },
    { label: "Yêu cầu chờ duyệt", value: 2 },
    { label: "Tổng số ứng viên", value: 18 },
];

const SecretaryStats = () => (
    <Row style={{ padding: '10px 32px' }} gutter={[16, 16]}>
        {stats.map((s, i) => (
            <Col xs={12} md={6} key={i}>
                <Card bordered={false} className="stat-card">
                    <Title level={3} className="stat-value">
                        {s.value}
                    </Title>
                    <Text className="stat-label">{s.label}</Text>
                </Card>
            </Col>
        ))}
    </Row>
);

export default SecretaryStats;
