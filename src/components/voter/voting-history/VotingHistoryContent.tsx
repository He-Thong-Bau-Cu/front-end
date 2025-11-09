import { Card, Row, Col, Typography, Button, Tag, Descriptions, Divider, message } from "antd";
import {
    CalendarOutlined,
    EnvironmentOutlined,
    UserOutlined,
    FileTextOutlined,
    CopyOutlined,
    PrinterOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SafetyOutlined,
} from "@ant-design/icons";
import "../../../style/voter/VotingHistory.model.css";

const { Text, Title } = Typography;

const voteHistory = {
    electionTitle: "Bầu cử Đại biểu Quốc hội Khóa XVI",
    ballotCode: "#VT2024-001",
    status: "Đã hoàn thành",
    issuedAt: "15 tháng 9, 2024 - 08:00 AM",
    castAt: "15 tháng 9, 2024 - 09:30 AM",
    method: "Trực tiếp",
    location: "Quận 1, TP.HCM",
    otpCode: "A7B9C2",
    signature: "0x3f5a8b2c...",
    voteValue: "Ứng viên Nguyễn Văn A",
    entityName: "Đại biểu Quốc hội",
};

const VotingHistoryContent = () => {
    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(voteHistory.ballotCode);
            message.success("Đã sao chép mã phiếu!");
        } catch {
            message.error("Không thể sao chép mã phiếu");
        }
    };

    const handleCopyOTP = async () => {
        try {
            await navigator.clipboard.writeText(voteHistory.otpCode);
            message.success("Đã sao chép mã OTP!");
        } catch {
            message.error("Không thể sao chép mã OTP");
        }
    };

    return (
        <div className="voting-history-content">
            <Card className="voting-single-card">
                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={4} style={{ marginBottom: 6, marginTop: 0, color: "#124d2d" }}>
                            Chi tiết lịch sử bỏ phiếu
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                            {voteHistory.electionTitle}
                        </Text>
                    </Col>
                    <Col>
                        <Tag
                            color={voteHistory.status === "Đã hoàn thành" ? "green" : "blue"}
                            icon={<CheckCircleOutlined />}
                            style={{ borderRadius: 16, fontWeight: 500, fontSize: 14, padding: "6px 16px" }}
                        >
                            {voteHistory.status}
                        </Tag>
                    </Col>
                </Row>

                <Divider style={{ margin: "16px 0", borderColor: "#f0f0f0" }} />

                {/* Thông tin phiếu bầu */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Thông tin phiếu bầu
                    </Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={8}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <FileTextOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Mã phiếu</Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.ballotCode}</strong>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <SafetyOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Mã OTP</Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.otpCode}</strong>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <UserOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Phương thức</Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.method}</strong>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Thông tin thời gian */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Thời gian
                    </Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <ClockCircleOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Thời gian phát hành</Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.issuedAt}</strong>
                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <CalendarOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>Thời gian bỏ phiếu</Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.castAt}</strong>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Thông tin lựa chọn */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Lựa chọn đã bỏ phiếu
                    </Title>
                    <Card 
                        size="small" 
                        style={{ 
                            background: "#f6ffed", 
                            border: "none",
                            borderRadius: 12,
                            boxShadow: "none"
                        }}
                    >
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Đối tượng bầu cử">
                                <Text strong>{voteHistory.entityName}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Lựa chọn">
                                <Text strong style={{ color: "#52c41a" }}>{voteHistory.voteValue}</Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </div>

                {/* Thông tin địa điểm */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Địa điểm bỏ phiếu
                    </Title>
                    <div className="voting-info-item">
                        <div className="voting-info-item-icon">
                            <EnvironmentOutlined style={{ color: '#A8E678', fontSize: 20 }} />
                        </div>
                        <div>
                            <Text type="secondary" style={{ fontSize: 13 }}>Địa điểm</Text>
                            <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{voteHistory.location}</strong>
                        </div>
                    </div>
                </div>

                {/* Nút hành động */}
                <Row gutter={12} className="voting-buttons" style={{ marginTop: 20 }}>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<CopyOutlined />} 
                            size="large"
                            onClick={handleCopyCode}
                        >
                            Sao chép mã phiếu
                        </Button>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<CopyOutlined />} 
                            size="large"
                            onClick={handleCopyOTP}
                        >
                            Sao chép mã OTP
                        </Button>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Button 
                            block 
                            icon={<PrinterOutlined />} 
                            size="large"
                        >
                            In xác nhận
                        </Button>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default VotingHistoryContent;



