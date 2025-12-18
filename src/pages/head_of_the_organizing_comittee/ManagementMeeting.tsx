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
                                        disabled={stats.election?.statusData === "REMAKE" || stats.election?.statusData === "ABNORMAL_REMAKE"}
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
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '4px 0'
                    }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(255, 77, 79, 0.3)'
                        }}>
                            <FileTextOutlined style={{ fontSize: 20, color: '#fff' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
                                Báo cáo bất thường
                            </div>
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                                Chi tiết báo cáo và thông tin liên quan
                            </div>
                        </div>
                    </div>
                }
                open={reportModalOpen}
                onCancel={() => {
                    setReportModalOpen(false);
                    setAbnormalReport(null);
                }}
                footer={[
                    <Button
                        key="close"
                        onClick={() => {
                            setReportModalOpen(false);
                            setAbnormalReport(null);
                        }}
                        style={{ minWidth: 100 }}
                    >
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
                            style={{
                                minWidth: 140,
                                background: '#52c41a',
                                borderColor: '#52c41a'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#73d13d';
                                e.currentTarget.style.borderColor = '#73d13d';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#52c41a';
                                e.currentTarget.style.borderColor = '#52c41a';
                            }}
                        >
                            Tải xuống PDF
                        </Button>
                    ] : [])
                ]}
                width={1100}
                centered
                styles={{
                    body: { padding: '24px' }
                }}
            >
                {loadingReport ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 8
                    }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 20, color: '#595959', fontSize: 15, fontWeight: 500 }}>
                            Đang tải dữ liệu...
                        </p>
                    </div>
                ) : abnormalReport ? (
                    <div style={{
                        maxHeight: "70vh",
                        overflowY: "auto",
                        paddingRight: 8
                    }}>
                        {/* Thông tin cuộc bầu cử */}
                        <Card
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    fontSize: 15,
                                    fontWeight: 600
                                }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
                                        background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <InfoCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
                                    </div>
                                    <span>Thông tin cuộc bầu cử</span>
                                </div>
                            }
                            style={{
                                marginBottom: 20,
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #e8e8e8'
                            }}
                            headStyle={{
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                borderBottom: '2px solid #1890ff',
                                borderRadius: '8px 8px 0 0'
                            }}
                        >
                            <Descriptions
                                column={1}
                                bordered
                                size="middle"
                                labelStyle={{
                                    fontWeight: 600,
                                    background: '#fafafa',
                                    width: '180px'
                                }}
                                contentStyle={{
                                    background: '#fff'
                                }}
                            >
                                <Descriptions.Item label="Số quyết định">
                                    <Tag color="blue" style={{ fontSize: 13, padding: '4px 12px' }}>
                                        {abnormalReport.electionId?.decisionNumber || 'N/A'}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tên quyết định">
                                    <span style={{ fontSize: 14, color: '#262626' }}>
                                        {abnormalReport.electionId?.decisionName || 'N/A'}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Tiêu đề">
                                    <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                        {abnormalReport.electionId?.title || 'N/A'}
                                    </span>
                                </Descriptions.Item>
                                {abnormalReport.electionId?.startDate && (
                                    <Descriptions.Item label="Ngày bắt đầu">
                                        <span style={{ fontSize: 14, color: '#262626' }}>
                                            {(() => { const date = new Date(abnormalReport.electionId.startDate); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}
                                        </span>
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.electionId?.endDate && (
                                    <Descriptions.Item label="Ngày kết thúc">
                                        <span style={{ fontSize: 14, color: '#262626' }}>
                                            {(() => { const date = new Date(abnormalReport.electionId.endDate); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}
                                        </span>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        {/* Tóm tắt */}
                        {abnormalReport.summary && (
                            <Card
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        fontSize: 15,
                                        fontWeight: 600
                                    }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 6,
                                            background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FileTextOutlined style={{ color: '#fff', fontSize: 16 }} />
                                        </div>
                                        <span>Tóm tắt</span>
                                    </div>
                                }
                                style={{
                                    marginBottom: 20,
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '1px solid #e8e8e8'
                                }}
                                headStyle={{
                                    background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)',
                                    borderBottom: '2px solid #52c41a',
                                    borderRadius: '8px 8px 0 0'
                                }}
                            >
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.8',
                                    color: '#262626',
                                    fontSize: 14,
                                    padding: '16px',
                                    background: '#fafafa',
                                    borderRadius: 6,
                                    border: '1px solid #f0f0f0'
                                }}>
                                    {abnormalReport.summary}
                                </div>
                            </Card>
                        )}

                        {/* Mô tả chi tiết */}
                        {abnormalReport.description && (
                            <Card
                                title={
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        fontSize: 15,
                                        fontWeight: 600
                                    }}>
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: 6,
                                            background: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <FileTextOutlined style={{ color: '#fff', fontSize: 16 }} />
                                        </div>
                                        <span>Mô tả chi tiết</span>
                                    </div>
                                }
                                style={{
                                    marginBottom: 20,
                                    borderRadius: 8,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                    border: '1px solid #e8e8e8'
                                }}
                                headStyle={{
                                    background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)',
                                    borderBottom: '2px solid #722ed1',
                                    borderRadius: '8px 8px 0 0'
                                }}
                            >
                                <div style={{
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: '1.8',
                                    color: '#262626',
                                    fontSize: 14,
                                    padding: '16px',
                                    background: '#fafafa',
                                    borderRadius: 6,
                                    border: '1px solid #f0f0f0'
                                }}>
                                    {abnormalReport.description}
                                </div>
                            </Card>
                        )}

                        {/* Thông tin báo cáo */}
                        <Card
                            title={
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    fontSize: 15,
                                    fontWeight: 600
                                }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 6,
                                        background: 'linear-gradient(135deg, #fa8c16 0%, #ffa940 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <InfoCircleOutlined style={{ color: '#fff', fontSize: 16 }} />
                                    </div>
                                    <span>Thông tin báo cáo</span>
                                </div>
                            }
                            style={{
                                borderRadius: 8,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: '1px solid #e8e8e8'
                            }}
                            headStyle={{
                                background: 'linear-gradient(135deg, #fff7e6 0%, #ffe7ba 100%)',
                                borderBottom: '2px solid #fa8c16',
                                borderRadius: '8px 8px 0 0'
                            }}
                        >
                            <Descriptions
                                column={1}
                                bordered
                                size="middle"
                                labelStyle={{
                                    fontWeight: 600,
                                    background: '#fafafa',
                                    width: '180px'
                                }}
                                contentStyle={{
                                    background: '#fff'
                                }}
                            >
                                <Descriptions.Item label="Trạng thái">
                                    <Tag
                                        color={
                                            abnormalReport.status === 'ACTIVE' ? 'green' :
                                            abnormalReport.status === 'REJECTED' ? 'red' :
                                            abnormalReport.status === 'PENDING' ? 'orange' :
                                            'default'
                                        }
                                        style={{ fontSize: 13, padding: '4px 12px' }}
                                    >
                                        {getStatusLabel(abnormalReport.status)}
                                    </Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mức độ nghiêm trọng">
                                    {(() => {
                                        const severityInfo = getSeverityLabel(abnormalReport.severity);
                                        return (
                                            <Tag
                                                color={severityInfo.color}
                                                style={{ fontSize: 13, padding: '4px 12px' }}
                                            >
                                                {severityInfo.label}
                                            </Tag>
                                        );
                                    })()}
                                </Descriptions.Item>
                                {abnormalReport.createdBy && (
                                    <Descriptions.Item
                                        label={
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                <UserOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                                                Người tạo
                                            </span>
                                        }
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span style={{ fontSize: 14, color: '#262626', fontWeight: 500 }}>
                                                {abnormalReport.createdBy.fullName || abnormalReport.createdBy.username || 'N/A'}
                                            </span>
                                            {abnormalReport.createdBy.email && (
                                                <span style={{
                                                    color: '#8c8c8c',
                                                    fontSize: 13,
                                                    fontStyle: 'italic'
                                                }}>
                                                    ({abnormalReport.createdBy.email})
                                                </span>
                                            )}
                                        </div>
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.createdAt && (
                                    <Descriptions.Item
                                        label={
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                                                Ngày tạo
                                            </span>
                                        }
                                    >
                                        <span style={{ fontSize: 14, color: '#262626' }}>
                                            {(() => { const date = new Date(abnormalReport.createdAt); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}
                                        </span>
                                    </Descriptions.Item>
                                )}
                                {abnormalReport.updatedAt && (
                                    <Descriptions.Item
                                        label={
                                            <span style={{ display: 'flex', alignItems: 'center' }}>
                                                <CalendarOutlined style={{ marginRight: 6, color: '#1890ff' }} />
                                                Ngày cập nhật
                                            </span>
                                        }
                                    >
                                        <span style={{ fontSize: 14, color: '#262626' }}>
                                            {(() => { const date = new Date(abnormalReport.updatedAt); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}
                                        </span>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>
                    </div>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '80px 20px',
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 8
                    }}>
                        <InfoCircleOutlined style={{
                            fontSize: 64,
                            color: '#d9d9d9',
                            marginBottom: 20,
                            display: 'block'
                        }} />
                        <p style={{
                            color: '#8c8c8c',
                            fontSize: 16,
                            fontWeight: 500,
                            margin: 0
                        }}>
                            Không có dữ liệu báo cáo
                        </p>
                    </div>
                )}
            </Modal>
        </Layout>
    );
};

export default ManagementMeeting;
