import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";
import {
    AppstoreOutlined,
    BankOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FolderOutlined,
    PlayCircleOutlined,
    SettingOutlined,
    StopOutlined,
    TrophyOutlined
} from "@ant-design/icons";
import { Card, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import "../../../style/voter/Dashboard.model.css";
import { useLoading } from "@/contexts/LoadingContext";
import moment from "moment-timezone";



const { Text, Title } = Typography;

const ElectionOverview = () => {
    const [election, setElection] = useState<Election | null>(null);
    const { showLoading, hideLoading } = useLoading();

    const location = useLocation();
    const electionId = location.state?.electionId || localStorage.getItem("currentElectionId");

    useEffect(() => {
        const fetchElection = async () => {
            try {
                showLoading();
                const res = await ElectionService.getElectionId(electionId);
                setElection(res);
            } catch (error) {
                console.error("Lỗi khi lấy chi tiết kỳ bầu cử:", error);
            } finally {
                hideLoading();
            }
        };
        fetchElection();
    }, []);

    if (!election) {
        return (
            <Card className="election-overview-card">
                <div style={{ padding: "40px", textAlign: "center" }}>
                    <Spin size="large" />
                </div>
            </Card>
        );
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


    // 🎨 Config UI theo trạng thái
    const getStatusConfig = () => {
        switch (statusVi) {
            case "Đang diễn ra":
                return { color: "#27AE60", icon: <ClockCircleOutlined /> };
            case "Sắp diễn ra":
                return { color: "#666", icon: <ExclamationCircleOutlined /> };
            case "Đã kết thúc":
                return { color: "#666", icon: <CheckCircleOutlined /> };
            case "Lưu trữ":
                return { color: "#999", icon: <FolderOutlined /> };
            default:
                return { color: "#666", icon: <ExclamationCircleOutlined /> };
        }
    };

    const statusConfig = getStatusConfig();

    const stages = [
        { key: 1, label: "Chuẩn bị", icon: <ExclamationCircleOutlined /> },
        { key: 2, label: "Bắt đầu", icon: <PlayCircleOutlined /> },
        { key: 3, label: "Kết thúc", icon: <StopOutlined /> },
        { key: 4, label: "Lưu trữ", icon: <FolderOutlined /> },
    ];

    const currentStage =
        statusVi === "Sắp diễn ra" ? 1
            : statusVi === "Đang diễn ra" ? 2
                : statusVi === "Đã kết thúc" ? 3
                    : 4;


    // const handleVoteNow = () => navigate("/voter/ballots");
    // const handleViewDetails = () => navigate("/voter/results");

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
                            <div className="election-info-icon-wrapper">
                                <AppstoreOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Loại bầu cử</Text>
                                <Text className="election-info-value">{election.typeId?.typeName}</Text>
                            </div>
                        </div>
                        <div className="election-info-item">
                            <div className="election-info-icon-wrapper">
                                <SettingOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Phương thức</Text>
                                <Text className="election-info-value">{election.votingMethodId?.methodName}</Text>
                            </div>
                        </div>
                        <div className="election-info-item">
                            <div className="election-info-icon-wrapper">
                                <BankOutlined className="election-info-icon" />
                            </div>
                            <div className="election-info-content">
                                <Text className="election-info-label">Thông qua</Text>
                                <Text className="election-info-value">{election.thresholdId?.thresholdName}</Text>
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
                                {moment.utc(election.startDate).format("DD/MM/YYYY HH:mm")}

                            </Text>
                        </div>
                        <div className="election-time-item">
                            <CalendarOutlined />{" "}
                            <Text>
                                Kết thúc:{" "}
                                {moment.utc(election.endDate).format("DD/MM/YYYY HH:mm")}
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                {/* <div className="election-timeline-container">
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
                                        <div className="timeline-icon">
                                            {stage.icon}
                                        </div>
                                        <Text className="timeline-label">{stage.label}</Text>
                                    </div>
                                    {index < stages.length - 1 && (
                                        <div
                                            className={`timeline-line ${shouldActivateLine ? "active" : ""}`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div> */}

                {/* Nút hành động */}
                {/* <div className="election-overview-actions">
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
                </div> */}
            </div>
        </Card>
    );
};

export default ElectionOverview;
