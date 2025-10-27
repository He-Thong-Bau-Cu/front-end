import { Card, Row, Col, Typography } from "antd";

const { Text } = Typography;

const stats = [
    { label: "Tổng quyết định", value: 38, color: "#A8E678" },
    { label: "Đang nhập dữ liệu", value: 8, color: "#f1c40f" },
    { label: "Đã phê duyệt", value: 25, color: "#27ae60" },
    { label: "Từ chối", value: 2, color: "#e74c3c" },
    { label: "Bản nháp", value: 3, color: "#95a5a6" },
];

const DecisionStats = () => (
    <Row gutter={[20, 20]} className="decision-stats-row">
        {stats.map((item, i) => (
            <Col key={i} flex="1">
                <Card style={{
                    borderLeft: `6px solid ${item.color}`,
                }} className="decision-stat-card">
                    <Text
                        className="decision-stat-value"
                        style={{ color: item.color }}
                    >
                        {item.value}
                    </Text>
                    <div className="decision-stat-label">{item.label}</div>
                </Card>
            </Col>
        ))}
    </Row>
);

export default DecisionStats;
