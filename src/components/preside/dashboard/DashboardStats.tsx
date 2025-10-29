import { Card, Row, Col, Typography } from "antd";
import {
    PieChartOutlined,
    TeamOutlined,
    FileTextOutlined,
    BarChartOutlined,
    AlertOutlined,
    ThunderboltOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const stats = [
    { title: "Tổng số kỳ bầu cử", value: 12, icon: <PieChartOutlined /> },
    { title: "Tổng số cử tri", value: "2.8M", icon: <TeamOutlined /> },
    { title: "Quyết định chờ duyệt", value: 8, icon: <FileTextOutlined /> },
    { title: "Tỷ lệ tham gia", value: "87.3%", icon: <BarChartOutlined /> },
    { title: "Cảnh báo hệ thống", value: 3, icon: <AlertOutlined /> },
    { title: "Hoạt động trong tháng", value: 15, icon: <ThunderboltOutlined /> },
];

const DashboardStats = () => (
    <Row gutter={[16, 16]} className="dashboard-stats-row">
        {stats.map((s, i) => (
            <Col xs={24} sm={12} md={8} lg={4} key={i}>
                <Card bordered={false} hoverable className="dashboard-stat-card">
                    <div className="dashboard-stat-icon">{s.icon}</div>
                    <Text strong className="dashboard-stat-value">
                        {s.value}
                    </Text>
                    <p className="dashboard-stat-label">{s.title}</p>
                </Card>
            </Col>
        ))}
    </Row>
);

export default DashboardStats;
