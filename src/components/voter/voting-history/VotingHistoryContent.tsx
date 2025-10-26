import { Card, Row, Col, Typography, Button, Tag, Input } from "antd";
import {
    SearchOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    FileTextOutlined,
    CopyOutlined,
    PrinterOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import "../../../style/voter/VotingHistory.model.css";

const { Text } = Typography;


const elections = [
    {
        title: "Bầu cử Đại biểu Quốc hội Khóa XVI",
        date: "15 tháng 9, 2024 - 09:30 AM",
        method: "Trực tiếp",
        location: "Quận 1, TP.HCM",
        code: "#VT2024-001",
        status: "Đã hoàn thành",
    },
    {
        title: "Bầu cử Hội đồng Nhân dân Thành phố",
        date: "28 tháng 6, 2024 - 02:15 PM",
        method: "Trực tuyến",
        location: "Quận 1, TP.HCM",
        code: "#VT2024-002",
        status: "Đã xác thực",
    },
];
const VotingHistoryContent = () => {
    return (
        <div className="voting-history-content">

            {/* Search */}
            <Card className="voting-search-card">
                <Input
                    prefix={<SearchOutlined />}
                    placeholder="Tìm kiếm cuộc bầu cử..."
                    className="voting-search-input"
                />
            </Card>

            {/* List history */}
            <div className="voting-timeline">
                {elections.map((e, i) => (
                    <Card key={i} className="voting-timeline-card">
                        <Row justify="space-between" align="middle">
                            <Col>
                                <Text strong className="voting-title">{e.title}</Text>
                                <div className="voting-date">
                                    <CalendarOutlined />
                                    <Text type="secondary">{e.date}</Text>
                                </div>
                            </Col>
                            <Col>
                                <Tag
                                    color={e.status === "Đã hoàn thành" ? "green" : "blue"}
                                    style={{ borderRadius: 16, fontWeight: 500 }}
                                >
                                    {e.status}
                                </Tag>
                            </Col>
                        </Row>

                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col xs={24} md={8}>
                                <span className="voting-info-item">
                                    <div className="voting-info-item-icon" >
                                        <UserOutlined style={{ color: '#A8E678', fontSize: 18 }} />
                                    </div>
                                    <div>
                                        <Text>Phương thức</Text>
                                        <strong style={{ display: "block" }}>{e.method}</strong>
                                    </div>
                                </span>
                            </Col>
                            <Col xs={24} md={8}>
                                <span className="voting-info-item">
                                    <div className="voting-info-item-icon" >
                                        <EnvironmentOutlined style={{ color: '#A8E678', fontSize: 18 }} />
                                    </div>
                                    <div>
                                        <Text>Địa điểm</Text> <strong style={{ display: "block" }}>{e.location}</strong>
                                    </div>
                                </span>
                            </Col>
                            <Col xs={24} md={8}>
                                <span className="voting-info-item">
                                    <div className="voting-info-item-icon" >
                                        <FileTextOutlined style={{ color: '#A8E678', fontSize: 18 }} />
                                    </div>
                                    <div>
                                        <Text>Mã phiếu</Text> <strong style={{ display: 'block' }}>{e.code}</strong>

                                    </div>
                                </span>
                            </Col>
                        </Row>

                        <Row gutter={12} className="voting-buttons">
                            <Col xs={24} md={8}>
                                <Button block icon={<EyeOutlined />}>Xem chi tiết</Button>
                            </Col>
                            <Col xs={24} md={8}>
                                <Button block icon={<PrinterOutlined />}>In xác nhận</Button>
                            </Col>
                            <Col xs={24} md={8}>
                                <Button block icon={<CopyOutlined />}>Sao chép mã</Button>
                            </Col>
                        </Row>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default VotingHistoryContent;



