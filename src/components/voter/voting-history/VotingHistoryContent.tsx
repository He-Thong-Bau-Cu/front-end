import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { BallotCast } from "@/types/Ballot.interface";
import {
    AuditOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CopyOutlined,
    FileTextOutlined,
    InboxOutlined,
    PrinterOutlined,
    RightOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, Row, Tag, Typography } from "antd";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../style/voter/VotingHistory.model.css";
dayjs.locale("vi");


const { Text, Title } = Typography;

const VotingHistoryContent = () => {
    const [ballot, setBallot] = useState<BallotCast | null>(null);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();
    const navigate = useNavigate();

    const voterId = localStorage.getItem("voterId") || "";


    useEffect(() => {
        const fetchBallot = async () => {
            try {
                showLoading();
                const data = await BallotService.getBallotStatusCastByVoterId(voterId);
                setBallot(data[0]);
            } catch {
                notify("Không thể tải dữ liệu phiếu bầu", "error");
            } finally {
                hideLoading();
            }
        };
        fetchBallot();
    }, []);

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            notify(`Đã sao chép ${label}!`, "success");
        } catch {
            notify(`Không thể sao chép ${label}`, "error");
        }
    };


    // Hiển thị thông báo khi chưa có dữ liệu (chưa bỏ phiếu)
    if (!ballot?._id) {
        return (
            <div className="voting-history-content">
                <Card className="voting-single-card no-voting-card">
                    <div className="no-voting-container">
                        <div className="no-voting-icon">
                            <InboxOutlined />
                        </div>
                        <Title level={4} className="no-voting-title">
                            Bạn chưa bỏ phiếu
                        </Title>
                        <Text type="secondary" className="no-voting-description">
                            Hiện tại bạn chưa có lịch sử bỏ phiếu nào. Vui lòng thực hiện bỏ phiếu để xem thông tin chi tiết tại đây.
                        </Text>
                        <Button
                            type="primary"
                            size="large"
                            icon={<RightOutlined />}
                            className="no-voting-button"
                            onClick={() => navigate("/voter/ballots")}
                        >
                            Đi đến bỏ phiếu
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }


    const electionTitle = ballot.voterId?.userId?.fullName
        ? `Phiếu bầu của ${ballot.voterId.userId.fullName}`
        : "Thông tin phiếu bầu";

    const status = ballot.status === "CAST" ? "Đã hoàn thành" : "Chưa bỏ phiếu";
    const methodCode = ballot.electionId?.votingMethodId?.methodCode;

    // Hàm convert voteValue → text cho YES/NO/ABSTAIN
    const convertYesNo = (value: number) => {
        if (value === 1) return "Đồng ý";
        if (value === 0) return "Không đồng ý";
        return "Không xác định";
    };

    return (
        <div className="voting-history-content">
            <Card className="voting-single-card">
                {/* Header */}
                <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
                    <Col>
                        <Title level={5} style={{ marginBottom: 6, marginTop: 0, color: "#124d2d" }}>
                            🗳️ Chi tiết lịch sử bỏ phiếu của bạn
                        </Title>
                        <Text type="secondary" style={{ fontSize: 14 }}>
                            {electionTitle}
                        </Text>
                    </Col>
                    <Col>
                        <Tag
                            color={status === "Đã hoàn thành" ? "green" : "blue"}
                            icon={<CheckCircleOutlined />}
                            style={{ borderRadius: 16, fontWeight: 500, fontSize: 14, padding: "6px 16px" }}
                        >
                            {status}
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
                        <Col xs={24} sm={12} md={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <FileTextOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Mã phiếu
                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{ballot._id}</strong>
                                </div>
                            </div>
                        </Col>
                        {/* <Col xs={24} sm={12} md={8}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <SafetyOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Mã OTP
                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>{otpCode}</strong>
                                </div>
                            </div>
                        </Col> */}
                        <Col xs={24} sm={12} md={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <UserOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Người bỏ phiếu
                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>
                                        {ballot.voterId.userId.fullName}
                                    </strong>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>


                {/* Thông tin thời gian */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Thông tin bầu cử
                    </Title>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <AuditOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Tên cuộc bầu cử                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>
                                        {ballot.electionId.title}
                                    </strong>
                                </div>
                            </div>
                        </Col>
                        {/* <Col xs={24} sm={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <CalendarOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Địa điểm                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>
                                        {ballot.electionId.decisionName}
                                    </strong>
                                </div>
                            </div>
                        </Col> */}
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
                                    <ClockCircleOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Phát hành
                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>
                                        {ballot.issuedAt ? dayjs(ballot.issuedAt).format("DD/MM/YYYY - HH:mm:ss") : "Chưa có"}
                                    </strong>

                                </div>
                            </div>
                        </Col>
                        <Col xs={24} sm={12}>
                            <div className="voting-info-item">
                                <div className="voting-info-item-icon">
                                    <CalendarOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                </div>
                                <div>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        Bỏ phiếu
                                    </Text>
                                    <strong style={{ display: "block", fontSize: 15, marginTop: 2 }}>
                                        {ballot.castAt ? dayjs(ballot.castAt).format("DD/MM/YYYY - HH:mm:ss") : "Chưa bỏ"}
                                    </strong>

                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Lựa chọn */}
                <div style={{ marginBottom: 20 }}>
                    <Title level={5} style={{ marginBottom: 12, color: "#124d2d" }}>
                        Lựa chọn đã bỏ phiếu
                    </Title>
                    <Card
                        size="small"
                        style={{
                            border: "none",
                            borderRadius: 12,
                            boxShadow: "none",
                        }}
                    >
                        <Descriptions column={1} size="small">

                            {/* 👉 CUMULATIVE: hiển thị nguyên như cũ */}
                            {methodCode === "CUMULATIVE" &&
                                ballot.allocations.map((a, i) => (
                                    <Descriptions.Item key={i} label={`Đối tượng ${i + 1}`}>
                                        <Text strong style={{ color: "#52c41a" }}>
                                            {a.entityId?.title} - Số phiếu: {a.voteValue}
                                        </Text>
                                    </Descriptions.Item>
                                ))
                            }

                            {/* 👉 YES_NO_ABSTAIN: chỉ hiển thị 1 kết quả */}
                            {methodCode === "YES_NO_ABSTAIN" && ballot.allocations.length > 0 && (
                                <Descriptions.Item>
                                    <Text strong style={{ color: "#52c41a" }}>
                                        {ballot.allocations[0].entityId.title} - {convertYesNo(ballot.allocations[0].voteValue)}
                                    </Text>
                                </Descriptions.Item>
                            )}

                        </Descriptions>




                    </Card>
                </div>





                {/* Nút hành động */}
                <Row gutter={12} className="voting-buttons" style={{ marginTop: 20 }}>
                    <Col xs={24} sm={12}>
                        <Button block icon={<CopyOutlined />} size="large" onClick={() => handleCopy(ballot._id, "mã phiếu")}>
                            Sao chép mã phiếu
                        </Button>
                    </Col>

                    <Col xs={24} sm={12}>
                        <Button block icon={<PrinterOutlined />} size="large">
                            In xác nhận
                        </Button>
                    </Col>
                </Row>
            </Card>


        </div>
    );
};

export default VotingHistoryContent;
