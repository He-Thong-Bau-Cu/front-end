import React from "react";
import { Card, Col, Row, Typography } from "antd";

const { Text } = Typography;

interface StatItem {
    label: string;
    value: number;
}

const stats: StatItem[] = [
    { label: "Tổng số cuộc", value: 38 },
    { label: "Đang chờ duyệt", value: 8 },
    { label: "Đã phê duyệt", value: 25 },
    { label: "Đã từ chối", value: 5 },
];

const AuthorizationStats: React.FC = () => (
    <Row gutter={[16, 16]} style={{ margin: "20px 32px" }}>
        {stats.map((s, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
                <Card className="authorization-stat-card">
                    <Text className="authorization-stat-value">{s.value}</Text>
                    <p className="authorization-stat-label">{s.label}</p>
                </Card>
            </Col>
        ))}
    </Row>
);

export default AuthorizationStats;
