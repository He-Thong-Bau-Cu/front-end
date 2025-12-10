import React, { useCallback, useEffect, useState } from "react";
import { Layout, Row, Col, Spin, message, Button, Card, Alert, Space, Modal, Descriptions, Tag, Divider } from "antd";
import { ReloadOutlined, FileTextOutlined, InfoCircleOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import EventStatusCard from "@/components/head_of_the_organizing_committee/management-meeting/EventStatusCard";
import EventStageControl from "@/components/head_of_the_organizing_committee/management-meeting/EventStageControl";
import AnnouncementCard from "@/components/head_of_the_organizing_committee/management-meeting/AnnouncementCard";
import ReelectionModal from "@/components/head_of_the_organizing_committee/management-meeting/ReelectionModal";
import MeetingService from "@/services/MeetingService";
import BoardControlService from "@/services/BoardControlService";
import { useNotification } from "@/contexts/NotificationContext";
import '../../style/head-of-the-organizing-committee/ManagementMeeting.model.css'
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";

interface EventManagementStats {
    meeting: {
        _id: string;
        title: string;
        meetingDate: string;
        location: string;
        status: string;
    };
    election: {
        _id: string;
        title: string;
        startDate: string;
        endDate: string;
        status: string;
        statusData?: any;
        timeline?: {
            checkinAt?: string;
            reportAt?: string;
            votingAt?: string;
            resultAnnouncedAt?: string;
            closingAt?: string;
        };
        stages?: {
            checkin?: string;
            report?: string;
            voting?: string;
            result?: string;
            closing?: string;
        };
    };
    stats: {
        totalAttendees: number;
        checkedInCount: number;
        votedCount: number;
        checkinPercent: number;
        votePercent: number;
        timeLeft: number;
        isRunning: boolean;
    };
}

const ManagementMeeting: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<EventManagementStats | null>(null);
    const [electionId, setElectionId] = useState<string>("");
    const [rejectionStatus, setRejectionStatus] = useState<any>(null);
    const [reelectionModalOpen, setReelectionModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [abnormalReport, setAbnormalReport] = useState<any>(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const { notify } = useNotification();

    // Hàm việt hóa trạng thái
    const getStatusLabel = (status: string) => {
        const statusMap: Record<string, string> = {
            'ACTIVE': 'Đang hoạt động',
            'INACTIVE': 'Không hoạt động',
            'PENDING': 'Chờ xử lý',
            'REJECTED': 'Đã từ chối',
            'APPROVED': 'Đã duyệt',
            'COMPLETED': 'Hoàn thành',
            'DRAFT': 'Nháp',
            'ARCHIVED': 'Đã lưu trữ',
        };
        return statusMap[status] || status || 'N/A';
    };

    // Hàm việt hóa mức độ nghiêm trọng
    const getSeverityLabel = (severity: string) => {
        const severityMap: Record<string, { label: string; color: string }> = {
            'LOW': { label: 'Thấp', color: 'green' },
            'MEDIUM': { label: 'Trung bình', color: 'orange' },
            'HIGH': { label: 'Cao', color: 'red' },
        };
        return severityMap[severity] || { label: severity || 'N/A', color: 'default' };
    };

    const loadData = useCallback(async () => {
        try {
            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                message.error("Vui lòng chọn cuộc bầu cử từ trang chủ");
                return;
            }

            setElectionId(currentElectionId);
            if (!stats) {
                setLoading(true);
            }

            const response = await MeetingService.getEventManagementStats(currentElectionId);
            const data = response?.data || response;
            setStats(data);

            // Kiểm tra trạng thái từ chối và báo cáo bất thường
            try {
                const rejectionResponse = await BoardControlService.checkRejectionStatus(currentElectionId);
                const rejectionData = rejectionResponse?.data || rejectionResponse;
                setRejectionStatus(rejectionData);
            } catch (error) {
                console.error("Error loading rejection status:", error);
                // Không hiển thị lỗi nếu không có quyền hoặc chưa có dữ liệu
            }
        } catch (error: any) {
            console.error("Error loading event management stats:", error);
            message.error(error?.response?.data?.message || "Không thể tải thống kê điều hành sự kiện");
        } finally {
            setLoading(false);
        }
    }, [stats]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!electionId) return;
        const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
        socket.on("connect", () => {
            socket.emit("join", electionId);
        });

        const handleRealtime = (data: any) => {
            if (data.type === "checkin-update" || data.type === "stage-started" || data.type === "stage-ended") {
                loadData();
            }
        };

        socket.on("transferData", handleRealtime);

        return () => {
            socket.off("transferData", handleRealtime);
            socket.disconnect();
        };
    }, [electionId, loadData]);

    if (loading) {
        return (
            <Layout
                style={{
                    padding: "24px 40px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Spin size="large" />
            </Layout>
        );
    }

    if (!stats) {
        return (
            <Layout
                style={{
                    padding: "24px 40px",
                }}
            >
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <p>Không có dữ liệu để hiển thị</p>
                </div>
            </Layout>
        );
    }

    const eventTitle = stats.election?.title || stats.meeting?.title || "Cuộc họp";
    const canStartReelection = rejectionStatus?.isRejected && rejectionStatus?.hasAbnormalReport;

    const handleReelectionSuccess = () => {
        notify("Bắt đầu cuộc bầu cử lại thành công!", "success");
        loadData();
    };

    return (
        <Layout
            style={{
                padding: "24px 40px",
            }}
        >
            {/* HEADER */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ color: "#124D2D", marginBottom: 4 }}>
                    Điều hành Sự kiện: {eventTitle}
                </h2>
            </div>

            {/* Hiển thị thông báo và nút bầu cử lại nếu có từ chối và báo cáo bất thường */}
            {canStartReelection && (
                <Card
                    style={{ marginBottom: 24, border: "1px solid #ff4d4f" }}
                    bodyStyle={{ padding: "16px 24px" }}
                >
                    <Alert
                        message="Cuộc bầu cử đã bị từ chối và có báo cáo bất thường"
                        description={
                            <div>
                                <p style={{ marginBottom: 12 }}>
                                    Ban kiểm soát đã từ chối kết quả bầu cử. Bạn có thể xem báo cáo bất thường và bắt đầu cuộc bầu cử lại.
                                </p>
                                <Space>
                                    {rejectionStatus?.abnormalReport?.documentId && (
                                        <Button
                                            icon={<FileTextOutlined />}
                                            onClick={async () => {
                                                try {
                                                    setLoadingReport(true);
                                                    const response = await BoardControlService.getAbnormalReport(electionId);
                                                    const reportData = response?.data || response;
                                                    setAbnormalReport(reportData);
                                                    setReportModalOpen(true);
                                                } catch (error: any) {
                                                    notify(error?.response?.data?.message || "Không thể tải báo cáo bất thường", "error");
                                                } finally {
                                                    setLoadingReport(false);
                                                }
                                            }}
                                            loading={loadingReport}
                                        >
                                            Xem báo cáo bất thường
                                        </Button>
                                    )}
                                    <Button
                                        type="primary"
                                        danger
                                        icon={<ReloadOutlined />}
                                        onClick={() => setReelectionModalOpen(true)}
                                    >
                                        Bắt đầu cuộc bầu cử lại
                                    </Button>
                                </Space>
                            </div>
                        }
                        type="warning"
                        showIcon
                    />
                </Card>
            )}

            <Row gutter={[24, 24]}>
                <Col xs={24} md={7}>
                    <EventStatusCard
                        electionId={electionId}
                        stats={stats.stats}
                        meeting={stats.meeting}
                        election={stats.election}
                        onRefresh={loadData}
                    />
                </Col>

                <Col xs={24} md={10}>
                    <EventStageControl
                        electionId={electionId}
                        meeting={stats.meeting}
                        election={stats.election}
                        stats={stats.stats}
                        onRefresh={loadData}
                    />
                </Col>

                <Col xs={24} md={7}>
                    <AnnouncementCard
                        electionId={electionId}
                        meeting={stats.meeting}
                    />
                </Col>
            </Row>

            <ReelectionModal
                open={reelectionModalOpen}
                onClose={() => setReelectionModalOpen(false)}
                onSuccess={handleReelectionSuccess}
                electionId={electionId}
            />

            {/* Modal xem báo cáo bất thường */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileTextOutlined style={{ fontSize: 20, color: '#ff4d4f' }} />
                        <span>Báo cáo bất thường</span>
                    </div>
                }
                open={reportModalOpen}
                onCancel={() => {
                    setReportModalOpen(false);
                    setAbnormalReport(null);
                }}
                footer={[
                    <Button key="close" onClick={() => {
                        setReportModalOpen(false);
                        setAbnormalReport(null);
                    }}>
                        Đóng
                    </Button>,
                    ...(abnormalReport?.documentId ? [
                        <Button
                            key="download"
                            type="primary"
                            icon={<FileTextOutlined />}
                            onClick={() => {
                                const apiBaseUrl = import.meta.env.VITE_API_URL || '';
                                const reportUrl = `${apiBaseUrl}/board-control/${electionId}/archive-report/download?reportId=${abnormalReport._id}`;
                                window.open(reportUrl, "_blank");
                            }}
                        >
                            Tải xuống PDF
                        </Button>
                    ] : [])
                ]}
                width={1000}
                centered
            >
                {loadingReport ? (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16, color: '#666' }}>Đang tải dữ liệu...</p>
                    </div>
                ) : abnormalReport ? (
                    <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                        {/* Thông tin cuộc bầu cử */}
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <InfoCircleOutlined style={{ color: '#1890ff' }} />
                                    <span>Thông tin cuộc bầu cử</span>
                                </div>
                            }
                            style={{ marginBottom: 16 }}
                            size="small"
                        >
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Số quyết định">
                                    <strong>{abnormalReport.electionId?.decisionNumber || 'N/A'}</strong>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên quyết định">
                                    {abnormalReport.electionId?.decisionName || 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiêu đề">
                                    {abnormalReport.electionId?.title || 'N/A'}
                                </Descriptions.Item>
                                {abnormalReport.electionId?.startDate && (
                                    <Descriptions.Item label="Ngày bắt đầu">
                                        {new Date(abnormalReport.electionId.startDate).toLocaleDateString('vi-VN')}
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.electionId?.endDate && (
                                    <Descriptions.Item label="Ngày kết thúc">
                                        {new Date(abnormalReport.electionId.endDate).toLocaleDateString('vi-VN')}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        {/* Tóm tắt */}
                        {abnormalReport.summary && (
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileTextOutlined style={{ color: '#52c41a' }} />
                                        <span>Tóm tắt</span>
                                    </div>
                                }
                                style={{ marginBottom: 16 }}
                                size="small"
                            >
                                <p style={{
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    lineHeight: '1.8',
                                    color: '#333'
                                }}>
                                    {abnormalReport.summary}
                                </p>
                            </Card>
                        )}

                        {/* Mô tả chi tiết */}
                        {abnormalReport.description && (
                            <Card
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FileTextOutlined style={{ color: '#722ed1' }} />
                                        <span>Mô tả chi tiết</span>
                                    </div>
                                }
                                style={{ marginBottom: 16 }}
                                size="small"
                            >
                                <p style={{
                                    whiteSpace: 'pre-wrap',
                                    margin: 0,
                                    lineHeight: '1.8',
                                    color: '#333'
                                }}>
                                    {abnormalReport.description}
                                </p>
                            </Card>
                        )}

                        {/* Thông tin báo cáo */}
                        <Card
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <InfoCircleOutlined style={{ color: '#fa8c16' }} />
                                    <span>Thông tin báo cáo</span>
                                </div>
                            }
                            size="small"
                        >
                            <Descriptions column={1} bordered>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag color={
                                        abnormalReport.status === 'ACTIVE' ? 'green' :
                                        abnormalReport.status === 'REJECTED' ? 'red' :
                                        abnormalReport.status === 'PENDING' ? 'orange' :
                                        'default'
                                    }>
                                        {getStatusLabel(abnormalReport.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mức độ nghiêm trọng">
                                    {(() => {
                                        const severityInfo = getSeverityLabel(abnormalReport.severity);
                                        return (
                                            <Tag color={severityInfo.color}>
                                                {severityInfo.label}
                                            </Tag>
                                        );
                                    })()}
                                </Descriptions.Item>
                                {abnormalReport.createdBy && (
                                    <Descriptions.Item
                                        label={
                                            <span>
                                                <UserOutlined style={{ marginRight: 4 }} />
                                                Người tạo
                                            </span>
                                        }
                                    >
                                        {abnormalReport.createdBy.fullName || abnormalReport.createdBy.username || 'N/A'}
                                        {abnormalReport.createdBy.email && (
                                            <span style={{ color: '#999', marginLeft: 8 }}>
                                                ({abnormalReport.createdBy.email})
                                            </span>
                                        )}
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.createdAt && (
                                    <Descriptions.Item
                                        label={
                                            <span>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                Ngày tạo
                                            </span>
                                        }
                                    >
                                        {new Date(abnormalReport.createdAt).toLocaleString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.updatedAt && (
                                    <Descriptions.Item
                                        label={
                                            <span>
                                                <CalendarOutlined style={{ marginRight: 4 }} />
                                                Ngày cập nhật
                                            </span>
                                        }
                                    >
                                        {new Date(abnormalReport.updatedAt).toLocaleString('vi-VN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <InfoCircleOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                        <p style={{ color: '#999', fontSize: 16 }}>Không có dữ liệu báo cáo</p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default ManagementMeeting;
