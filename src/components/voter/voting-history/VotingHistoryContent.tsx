import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { BallotCast } from "@/types/Ballot.interface";
import {
    AuditOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    InboxOutlined,
    RightOutlined,
    UserOutlined
} from "@ant-design/icons";
import { Button, Card, Col, Descriptions, Divider, Row, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../style/voter/VotingHistory.model.css";
import { formatDate } from "@/utils/format";


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

                <Divider style={{ margin: "12px 0", borderColor: "#f0f0f0" }} />

                <Row gutter={[24, 12]}>
                    {/* Cột trái - Thông tin */}
                    <Col xs={24} lg={14}>
                        {/* Thông tin phiếu bầu */}
                        <div style={{ marginBottom: 8 }}>
                            <Title level={5} style={{ marginBottom: 6, color: "#124d2d" }}>
                                Thông tin phiếu bầu
                            </Title>
                            <Row gutter={[0, 4]}>
                                <Col xs={24}>
                                    <div className="voting-info-item">
                                        <div className="voting-info-item-icon">
                                            <FileTextOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                                                Mã phiếu:
                                            </Text>
                                            <strong style={{ fontSize: 15 }}>{ballot._id}</strong>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24}>
                                    <div className="voting-info-item">
                                        <div className="voting-info-item-icon">
                                            <UserOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                                                Người bỏ phiếu:
                                            </Text>
                                            <strong style={{ fontSize: 15 }}>
                                                {ballot.voterId.userId.fullName}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Thông tin bầu cử */}
                        <div style={{ marginBottom: 8 }}>
                            <Row gutter={[0, 4]}>
                                <Col xs={24}>
                                    <div className="voting-info-item">
                                        <div className="voting-info-item-icon">
                                            <AuditOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                                                Tên cuộc bầu cử:
                                            </Text>
                                            <strong style={{ fontSize: 15 }}>
                                                {ballot.electionId.title}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>

                        {/* Thông tin thời gian */}
                        <div style={{ marginBottom: 8 }}>
                            <Row gutter={[0, 4]}>
                                <Col xs={24}>
                                    <div className="voting-info-item">
                                        <div className="voting-info-item-icon">
                                            <ClockCircleOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                                                Phát hành:
                                            </Text>
                                            <strong style={{ fontSize: 15 }}>
                                                {ballot.issuedAt ? formatDate(new Date(ballot.issuedAt)) : "Chưa có"}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={24}>
                                    <div className="voting-info-item">
                                        <div className="voting-info-item-icon">
                                            <CalendarOutlined style={{ color: "#A8E678", fontSize: 20 }} />
                                        </div>
                                        <div>
                                            <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                                                Bỏ phiếu:
                                            </Text>
                                            <strong style={{ fontSize: 15 }}>
                                                {ballot.castAt ? formatDate(new Date(ballot.castAt)) : "Chưa bỏ"}
                                            </strong>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Col>

                    {/* Cột phải - Lựa chọn đã bỏ phiếu */}
                    <Col xs={24} lg={10}>
                        <div className="voting-choice-card">
                            <Title level={5} style={{ marginBottom: 8, color: "#124d2d" }}>
                                Lựa chọn đã bỏ phiếu
                            </Title>
                            <Card
                                size="small"
                                style={{
                                    border: "none",
                                    borderRadius: 12,
                                    backgroundColor: "transparent",
                                    boxShadow: "none",
                                    padding: 0,
                                }}
                            >
                                <Descriptions column={1} size="small">

                                    {/* ---- CUMULATIVE ---- */}
                                    {methodCode === "CUMULATIVE" && (() => {

                                        // 1️⃣ allocations = null → phiếu trắng
                                        if (!ballot.allocations) {
                                            return (
                                                <Descriptions.Item>
                                                    <Text strong type="warning">Phiếu trắng / Không bỏ phiếu</Text>
                                                </Descriptions.Item>
                                            );
                                        }

                                        // 2️⃣ tất cả voteValue đều = 0 → phiếu trắng
                                        const allZero = ballot.allocations.every(a => a.voteValue === 0);

                                        if (allZero) {
                                            return (
                                                <Descriptions.Item>
                                                    <Text strong type="warning">Phiếu trắng / Không bỏ phiếu</Text>
                                                </Descriptions.Item>
                                            );
                                        }

                                        // 3️⃣ có vote hợp lệ → hiển thị danh sách ứng viên + số phiếu
                                        return ballot.allocations.map((a, i) => (
                                            <Descriptions.Item key={i} label={`Đối tượng ${i + 1}`}>
                                                <Text strong style={{ color: "#52c41a" }}>
                                                    {a.entityId?.title} - Quyền biểu quyết: {a.voteValue}
                                                </Text>
                                            </Descriptions.Item>
                                        ));
                                    })()}


                                    {/* ---- YES_NO_ABSTAIN ---- */}
                                    {methodCode === "YES_NO_ABSTAIN" && (() => {

                                        // 1️⃣ allocations = null → phiếu trắng
                                        if (!ballot.allocations) {
                                            return (
                                                <Descriptions.Item>
                                                    <Text strong type="warning">Phiếu trắng / Không bỏ phiếu</Text>
                                                </Descriptions.Item>
                                            );
                                        }

                                        const value = ballot.allocations[0].voteValue;

                                        // 2️⃣ convert voteValue sang text
                                        const mapYesNoAbstain: any = {
                                            1: "Đồng ý",
                                            0: "Không đồng ý",

                                        };

                                        return (
                                            <Descriptions.Item>
                                                <Text strong style={{ color: "#52c41a" }}>
                                                    {ballot.allocations[0].entityId.title} - {mapYesNoAbstain[value]}
                                                </Text>
                                            </Descriptions.Item>
                                        );
                                    })()}


                                </Descriptions>

                            </Card>
                        </div>
                    </Col>
                </Row>





                {/* Nút hành động */}
                {/* <Row gutter={12} className="voting-buttons" style={{ marginTop: 12 }}>
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
                </Row> */}
            </Card>


        </div>
    );
};

export default VotingHistoryContent;
