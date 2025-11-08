import { Card, Typography, Button } from "antd";
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    RightOutlined,
    TrophyOutlined,
    PlayCircleOutlined,
    StopOutlined,
    FolderOutlined,
    AppstoreOutlined,
    SettingOutlined,
    BankOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "../../../style/voter/Dashboard.model.css";
import { useEffect, useState } from "react";
import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";

const { Text, Title } = Typography;

const ElectionOverview = () => {
    const navigate = useNavigate();
    const [election, setElection] = useState<Election | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchElection = async () => {
            try {
                // ✅ Fix cứng ID 
                const res = await ElectionService.getElectionId("651f0a7c1f2b4d1a12345678");
                setElection(res);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết kỳ bầu cử:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchElection();
    }, []);

    if (loading || !election) {
        return <p style={{ padding: 20 }}>Đang tải thông tin kỳ bầu cử...</p>;
    }

    // 🧩 Map trạng thái DB → tiếng Việt
    const mapStatus = (status: string) => {
        const normalizedStatus = status?.trim().toUpperCase() || "";
        switch (normalizedStatus) {
            case "ACTIVE":
                return "Đang diễn ra";
            case "DRAFT":
                return "Sắp diễn ra";
            case "CLOSED":
                return "Đã kết thúc";
            case "ARCHIVED":
                return "Lưu trữ";
            default:
                console.warn("Unknown status:", status, "→ defaulting to 'Sắp diễn ra'");
                return "Sắp diễn ra";
        }
    };

    const statusVi = mapStatus(election.status);

    // Debug: Kiểm tra status từ API
    console.log("Status từ API:", election.status);
    console.log("Status sau khi map:", statusVi);

    // 🎨 Config UI theo trạng thái
    const getStatusConfig = () => {
        switch (statusVi) {
            case "Đang diễn ra":
                return { color: "#27AE60", bg: "#E8F8F2", icon: <ClockCircleOutlined /> };
            case "Sắp diễn ra":
                return { color: "#FFB84C", bg: "#FFF7E6", icon: <ExclamationCircleOutlined /> };
            case "Đã kết thúc":
                return { color: "#4C84FF", bg: "#F0F5FF", icon: <CheckCircleOutlined /> };
            case "Lưu trữ":
                return { color: "#95A5A6", bg: "#F5F5F5", icon: <FolderOutlined /> };
            default:
                return { color: "#FFB84C", bg: "#FFF7E6", icon: <ExclamationCircleOutlined /> };
        }
    };

    const statusConfig = getStatusConfig();

    const stages = [
        { key: 1, label: "Chuẩn bị", icon: <ExclamationCircleOutlined />, color: "#FFB84C" },
        { key: 2, label: "Bắt đầu", icon: <PlayCircleOutlined />, color: "#27AE60" },
        { key: 3, label: "Kết thúc", icon: <StopOutlined />, color: "#4C84FF" },
        { key: 4, label: "Lưu trữ", icon: <FolderOutlined />, color: "#95A5A6" },
    ];

    const currentStage =
        statusVi === "Sắp diễn ra" ? 1
            : statusVi === "Đang diễn ra" ? 2
                : statusVi === "Đã kết thúc" ? 3
                    : 4;


    const handleVoteNow = () => navigate("/voter/ballots");
    const handleViewDetails = () => navigate("/voter/results");

    return (
        <Card className="election-overview-card" bordered={false}>
            {/* Header */}
            <div className="election-overview-header">
                <div className="election-overview-title-section">
                    <div className="election-overview-title-wrapper">
                        <div className="election-icon-wrapper">
                            <TrophyOutlined className="election-main-icon" />
                        </div>
                        <div className="election-title-content">
                            <Title level={3} className="election-overview-title">
                                {election.title}
                            </Title>
                            <Text style={{ color: statusConfig.color, fontWeight: 600 }}>
                                {statusVi}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            <div className="election-divider-line"></div>

            {/* Nội dung */}
            <div className="election-overview-content">
                <div className="election-description-box">
                    <div className="election-info-grid">
                        <div className="election-info-item">
                            <div className="election-info-icon-wrapper" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
                                <AppstoreOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Loại bầu cử</Text>
                                <Text className="election-info-value">{election.electionType}</Text>
                            </div>
                        </div>
                        <div className="election-info-item">
                            <div className="election-info-icon-wrapper" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                                <SettingOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Phương thức</Text>
                                <Text className="election-info-value">{election.votingMethod}</Text>
                            </div>
                        </div>
                        <div className="election-info-item">
                            <div className="election-info-icon-wrapper" style={{ background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" }}>
                                <BankOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Loại hình công ty</Text>
                                <Text className="election-info-value">{election.companyType}</Text>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Thời gian */}
                <div className="election-overview-time">
                    <div className="election-time-container">
                        <div className="election-time-item">
                            <CalendarOutlined />{" "}
                            <Text>
                                Bắt đầu:{" "}
                                {new Date(election.startDate).toLocaleString("vi-VN", {
                                    hour12: false,
                                })}
                            </Text>
                        </div>
                        <div className="election-time-item">
                            <ClockCircleOutlined />{" "}
                            <Text>
                                Kết thúc:{" "}
                                {new Date(election.endDate).toLocaleString("vi-VN", {
                                    hour12: false,
                                })}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="election-timeline-container">
                    <div className="election-timeline">
                        {stages.map((stage, index) => {
                            const isCompleted = currentStage > stage.key;
                            const isCurrent = currentStage === stage.key;
                            const isUpcoming = currentStage < stage.key;

                            const shouldActivateLine = isCompleted || isCurrent;

                            return (
                                <div key={stage.key} className="timeline-item-wrapper">
                                    <div
                                        className={`timeline-item ${isCompleted ? "completed" : isCurrent ? "current" : isUpcoming ? "upcoming" : ""
                                            }`}
                                    >
                                        <div
                                            className="timeline-icon"
                                            style={{
                                                background: isCompleted
                                                    ? stage.color
                                                    : isCurrent
                                                        ? stage.color
                                                        : "#ccc",
                                                boxShadow: isCurrent
                                                    ? `0 0 0 3px ${stage.color}33, 0 2px 8px ${stage.color}66`
                                                    : "none",
                                            }}
                                        >
                                            {stage.icon}
                                        </div>
                                        <Text className="timeline-label">{stage.label}</Text>
                                    </div>
                                    {index < stages.length - 1 && (
                                        <div
                                            className={`timeline-line ${shouldActivateLine ? "active" : ""}`}
                                            style={{
                                                background: shouldActivateLine
                                                    ? `linear-gradient(90deg, ${stage.color} 0%, ${stages[index + 1].color} 100%)`
                                                    : "#e0e0e0",
                                                opacity: shouldActivateLine ? 1 : 0.3,
                                                height: shouldActivateLine ? "4px" : "3px",
                                                transition: "all 0.5s ease",
                                                boxShadow: shouldActivateLine
                                                    ? `0 2px 4px rgba(0, 0, 0, 0.1)`
                                                    : "none",
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Nút hành động */}
                <div className="election-overview-actions">
                    {statusVi === "Đang diễn ra" ? (
                        <Button
                            type="primary"
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={handleVoteNow}
                        >
                            Bỏ phiếu ngay <RightOutlined />
                        </Button>
                    ) : statusVi === "Sắp diễn ra" ? (
                        <Button
                            size="large"
                            icon={<ClockCircleOutlined />}
                            onClick={handleViewDetails}
                        >
                            Xem chi tiết cuộc bầu cử <RightOutlined />
                        </Button>
                    ) : (
                        <Button
                            size="large"
                            icon={<CheckCircleOutlined />}
                            onClick={handleViewDetails}
                        >
                            Xem kết quả bầu cử <RightOutlined />
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default ElectionOverview;
