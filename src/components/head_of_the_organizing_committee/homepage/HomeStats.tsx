import { Card, Row, Col, Typography } from "antd";
import {
    CalendarOutlined,
    LineChartOutlined,
    ClockCircleOutlined,
    TeamOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const stats = [
    {
        title: "Tổng cuộc họp",
        value: 3,
        icon: <CalendarOutlined style={{ color: "#1677ff" }} />,
        color: "#1677ff",
    },
    {
        title: "Đang hoạt động",
        value: 1,
        icon: <LineChartOutlined style={{ color: "#16a34a" }} />,
        color: "#16a34a",
    },
    {
        title: "Sắp diễn ra",
        value: 1,
        icon: <ClockCircleOutlined style={{ color: "#3b82f6" }} />,
        color: "#3b82f6",
    },
    {
        title: "Đã kết thúc",
        value: 1,
        icon: <TeamOutlined style={{ color: "#6b7280" }} />,
        color: "#6b7280",
    },
];

const HomeStats: React.FC = () => (
    <Row gutter={[16, 16]} className="home-stats">
        {stats.map((item, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
                <Card className="home-stat-card" bordered={false}>
                    <div className="home-stat-content">
                        <div>
                            <Text type="secondary">{item.title}</Text>
                            <Title level={3} style={{ margin: 0, color: item.color }}>
                                {item.value}
                            </Title>
                        </div>
                        <div className="home-stat-icon">{item.icon}</div>
                    </div>
                </Card>
            </Col>
        ))}
    </Row>
);

export default HomeStats;
