import { Card, Col, Row, Typography } from "antd";
import {
    FileDoneOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
    BellOutlined,
} from "@ant-design/icons";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const stats = [
    {
        icon: <FileDoneOutlined />,
        title: "Kỳ bầu cử sắp tới",
        value: 2,
        desc: "Bạn có thể tham gia bỏ phiếu",
        color: "#4A90E2",
        bg: "#E8F1FB",
    },
    {
        icon: <CheckCircleOutlined />,
        title: "Đã bỏ phiếu",
        value: 5,
        desc: "Trong tổng số 7 kỳ bầu cử",
        color: "#27AE60",
        bg: "#E8F8F2",
    },
    {
        icon: <BarChartOutlined />,
        title: "Tỷ lệ tham gia",
        value: "71.4%",
        desc: "Tham gia tích cực",
        color: "#F39C12",
        bg: "#FFF6E5",
    },
    {
        icon: <BellOutlined />,
        title: "Thông báo mới",
        value: 3,
        desc: "Cập nhật quan trọng",
        color: "#E74C3C",
        bg: "#FDECEC",
    },
];

const VoterStats = () => (
    <Row gutter={[16, 16]} className="voter-stats-container">
        {stats.map((item, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
                <Card
                    bordered={false}
                    className="voter-stat-card voter-stat-horizontal"
                    style={{ borderTop: `5px solid ${item.color}` }}
                >
                    <div className="voter-stat-inner">
                        <div
                            className="voter-stat-icon-box"
                            style={{ backgroundColor: item.bg, color: item.color }}
                        >
                            {item.icon}
                        </div>

                        <div className="voter-stat-text">
                            <Text strong className="voter-stat-value">
                                {item.value}
                            </Text>
                            <Text className="voter-stat-title">{item.title}</Text>
                            <p className="voter-stat-desc">{item.desc}</p>
                        </div>
                    </div>
                </Card>
            </Col>
        ))}
    </Row>
);

export default VoterStats;
