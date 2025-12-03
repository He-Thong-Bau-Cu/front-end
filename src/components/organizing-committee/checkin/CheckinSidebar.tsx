import React, { useEffect, useState } from "react";
import { Card, Input, Button, Progress, Typography, Spin, Modal, Descriptions, Alert } from "antd";
import {
    CalendarOutlined,
    BarChartOutlined,
    UserOutlined,
    HistoryOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
} from "@ant-design/icons";
import ElectionService from "@/services/ElectionService";
import MeetingService from "@/services/MeetingService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import ElectionParticipantService from "@/services/ElectionParticipantsService";
import DelegateCardService from "@/services/DelegateCardService";
import { BaseResponse } from "@/types/BaseResponse.interface";
import dayjs from "dayjs";
import { io, Socket } from "socket.io-client";
import { useNotification } from "@/contexts/NotificationContext";
import { SOCKET_URL } from "@/config/socket";
import { USER_ROLE } from "@/enums/STATUS";

const { Text } = Typography;

interface RecentActivity {
    type: "success" | "error";
    name: string;
    time: string;
}

interface CheckinSidebarProps {
    canCheckin: boolean;
}

const CheckinSidebar: React.FC<CheckinSidebarProps> = ({ canCheckin }) => {
    const { notify } = useNotification();
    const [electionInfo, setElectionInfo] = useState<any>(null);
    const [meetingInfo, setMeetingInfo] = useState<any>(null);
    const [stats, setStats] = useState({ total: 0, attended: 0, percent: 0 });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [delegateData, setDelegateData] = useState<any>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Fetch data và setup socket
    useEffect(() => {
        fetchData();

        const currentElectionId = localStorage.getItem("currentElectionId");
        if (currentElectionId) {
            const socket: Socket = io(SOCKET_URL, {
                transports: ["websocket"],
            });

            socket.on("connect", () => {
                console.log("Socket connected for checkin stats:", socket.id);
                socket.emit("join", currentElectionId);
                socket.emit("join-election-room", currentElectionId);
            });

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
            });

            // Lắng nghe cập nhật check-in
            socket.on("transferData", (data: any) => {
                if (data.type === "checkin-update" && data.stats) {
                    console.log("📊 Received checkin update:", data);
                    // Cập nhật thống kê từ socket
                    setStats((prevStats) => {
                        const newStats = {
                            total: data.stats.total || prevStats.total,
                            attended: data.stats.attended || prevStats.attended,
                            percent: data.stats.total > 0
                                ? Math.round((data.stats.attended / data.stats.total) * 100)
                                : 0,
                        };
                        return newStats;
                    });

                    // Cập nhật recent activities nếu có attendee mới
                    if (data.attendee && data.attendee.participantId?.userId) {
                        const newActivity: RecentActivity = {
                            type: "success",
                            name: data.attendee.participantId.userId.fullName || "Người tham gia",
                            time: dayjs(data.attendee.checkInTime || new Date()).format("HH:mm:ss"),
                        };
                        setRecentActivities((prev) => [newActivity, ...prev].slice(0, 5));
                    }
                }
            });

            return () => {
                socket.disconnect();
                console.log("Socket disconnected for checkin stats");
            };
        }

        // Vẫn giữ interval để backup nếu socket không hoạt động
        const interval = setInterval(fetchData, 10000); // Tăng lên 10 giây vì đã có socket
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                setLoading(false);
                return;
            }

            // Fetch election info
            try {
                const election = await ElectionService.getElectionId(currentElectionId);
                setElectionInfo(election);
            } catch (error) {
                console.error("Lỗi khi lấy thông tin cuộc bầu cử:", error);
            }

            // Fetch meeting info
            try {
                const meetingsResponse: BaseResponse<any> = await MeetingService.getByElectionId(currentElectionId);
                if (meetingsResponse?.success && meetingsResponse?.data) {
                    const meetings = Array.isArray(meetingsResponse.data)
                        ? meetingsResponse.data
                        : [meetingsResponse.data];
                    if (meetings.length > 0) {
                        setMeetingInfo(meetings[0]);

                        // Fetch statistics
                        const meetingId = meetings[0]._id || meetings[0].id;
                        if (meetingId) {
                            await fetchStatistics(meetingId, currentElectionId);
                            await fetchRecentActivities(meetingId);
                        }
                    }
                }
            } catch (error) {
                console.error("Lỗi khi lấy thông tin cuộc họp:", error);
            }
        } catch (error: any) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async (meetingId: string, electionId: string) => {
        try {
            // Get total participants
            const participantsResponse: any = await ElectionParticipantService.getElectionParticipantByElectionId(electionId);
            // BaseService trả về response.data, nên đây là BaseResponse object
            let participants: any[] = [];
            if (participantsResponse) {
                if (participantsResponse.success && Array.isArray(participantsResponse.data)) {
                    participants = participantsResponse.data.filter((p: any) => p.roleId.roleCode === USER_ROLE.VOTER);
                } else if (Array.isArray(participantsResponse)) {
                    participants = participantsResponse.filter((p: any) => p.roleId.roleCode === USER_ROLE.VOTER);
                } else if (participantsResponse.data && Array.isArray(participantsResponse.data)) {
                    participants = participantsResponse.data.filter((p: any) => p.roleId.roleCode === USER_ROLE.VOTER);
                }
            }
            const total = participants.length;

            // Get attended count
            const attendeesResponse: BaseResponse<any> = await MeetingAttendeeService.getByMeetingId(meetingId);
            console.log("Attendees response for stats:", attendeesResponse);
            const attendees = attendeesResponse?.success && attendeesResponse?.data
                ? (Array.isArray(attendeesResponse.data) ? attendeesResponse.data : [attendeesResponse.data])
                : [];
            const attended = attendees.filter((a: any) => a.attended === true).length;

            const percent = total > 0 ? Math.round((attended / total) * 100) : 0;
            setStats({ total, attended, percent });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê:", error);
        }
    };

    const fetchRecentActivities = async (meetingId: string) => {
        try {
            const attendeesResponse: BaseResponse<any> = await MeetingAttendeeService.getByMeetingId(meetingId);
            if (attendeesResponse?.success && attendeesResponse?.data) {
                const attendees = Array.isArray(attendeesResponse.data)
                    ? attendeesResponse.data
                    : [attendeesResponse.data];

                // Sort by checkInTime descending and take latest 5
                const sorted = attendees
                    .filter((a: any) => a.checkInTime)
                    .sort((a: any, b: any) =>
                        new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
                    )
                    .slice(0, 5);

                const activities: RecentActivity[] = sorted.map((a: any) => ({
                    type: a.attended ? "success" : "error",
                    name: a.participantId?.userId?.fullName || "Không xác định",
                    time: dayjs(a.checkInTime).format("HH:mm:ss"),
                }));

                setRecentActivities(activities);
            }
        } catch (error) {
            console.error("Lỗi khi lấy hoạt động gần nhất:", error);
        }
    };

    const handleManualSearch = async () => {
        if (!searchText.trim()) {
            notify("Vui lòng nhập ID thẻ đại biểu", "warning");
            return;
        }

        const cardId = searchText.trim();
        setSearchLoading(true);
        setIsModalVisible(true);
        setDelegateData(null);

        try {
            const response: BaseResponse<any> = await DelegateCardService.getById(cardId);

            if (!response || !response.success || !response.data) {
                notify("Không tìm thấy thẻ đại biểu với ID này", "error");
                setSearchLoading(false);
                return;
            }

            const delegateCard = response.data;
            const voter = delegateCard.voterId;
            if (!voter || !voter.userId) {
                notify("Không tìm thấy thông tin cử tri", "error");
                setSearchLoading(false);
                return;
            }

            const userId = voter.userId;
            const electionId = delegateCard.electionId?._id || delegateCard.electionId;

            const delegateInfo = {
                id: delegateCard._id,
                fullName: userId.fullName || "",
                code: userId.username || "",
                department: userId.department || "",
                position: userId.position || "",
                email: userId.email || "",
                phone: userId.phone || voter.phone || "",
                electionName: delegateCard.electionId?.title || "",
                userId: userId._id || userId,
                electionId: electionId,
            };

            setDelegateData(delegateInfo);
        } catch (error: any) {
            console.error("Lỗi khi tìm kiếm:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Không thể tìm kiếm thẻ đại biểu";
            notify(`❌ ${errorMsg}`, "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!delegateData) {
                notify("Không có thông tin đại biểu", "error");
                return;
            }

            // Kiểm tra lại trạng thái checkin trước khi checkin
            if (!canCheckin) {
                notify("❌ Giai đoạn checkin chưa bắt đầu hoặc đã kết thúc", "warning");
                return;
            }

            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                notify("Vui lòng chọn cuộc bầu cử từ trang chủ", "warning");
                return;
            }

            const meetingsResponse: BaseResponse<any> = await MeetingService.getByElectionId(currentElectionId);
            if (!meetingsResponse || !meetingsResponse.success || !meetingsResponse.data) {
                notify("Không tìm thấy cuộc họp cho cuộc bầu cử này", "error");
                return;
            }

            const meetings = Array.isArray(meetingsResponse.data) ? meetingsResponse.data : [meetingsResponse.data];
            if (meetings.length === 0) {
                notify("Chưa có cuộc họp nào được tạo cho cuộc bầu cử này", "error");
                return;
            }

            const meeting = meetings[0];
            const meetingId = meeting._id || meeting.id;
            if (!meetingId) {
                notify("Không tìm thấy ID cuộc họp", "error");
                return;
            }

            const electionId = delegateData.electionId || currentElectionId;
            const userId = delegateData.userId;

            if (!electionId || !userId) {
                notify("Thiếu thông tin cuộc bầu cử hoặc người dùng", "error");
                return;
            }

            setSearchLoading(true);

            try {
                const participantResponse: BaseResponse<any> = await ElectionParticipantService.getByUserId(userId);
                const participantList = participantResponse?.data
                    ? (Array.isArray(participantResponse.data) ? participantResponse.data : [participantResponse.data])
                    : [];
                const participant = participantList.find(
                    (p: any) => p.electionId?._id === electionId || p.electionId === electionId
                );

                if (!participant || !participant._id) {
                    notify("Người này chưa được thêm vào danh sách tham gia cuộc bầu cử", "warning");
                    setSearchLoading(false);
                    return;
                }

                // Cập nhật trạng thái tham gia cuộc họp (MeetingAttendee record đã được tạo sẵn)
                const updateResult = await MeetingAttendeeService.updateStatusAttendance(
                    meetingId,
                    participant._id,
                    true
                );

                // Kiểm tra xem response có data không
                if (!updateResult?.data || updateResult?.data === null) {
                    notify("Không tìm thấy bản ghi tham gia cuộc họp. Vui lòng kiểm tra lại.", "error");
                    setSearchLoading(false);
                    return;
                }

                notify(`✅ Đã xác thực đại biểu: ${delegateData?.fullName}`, "success");
                setIsModalVisible(false);
                setDelegateData(null);
                setSearchText("");
                fetchData(); // Refresh data
            } catch (attendanceError: any) {
                console.error("❌ Lỗi khi cập nhật trạng thái tham gia:", attendanceError);
                const errorMsg = attendanceError?.response?.data?.message || attendanceError?.message || "Không thể cập nhật trạng thái tham gia";
                notify(`❌ ${errorMsg}`, "error");
            }
        } catch (error: any) {
            console.error("❌ Lỗi khi check-in:", error);
            const errorMsg = error?.response?.data?.message || error?.message || "Không thể check-in";
            notify(`❌ ${errorMsg}`, "error");
        } finally {
            setSearchLoading(false);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setDelegateData(null);
        setSearchText("");
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        return dayjs(dateString).format("DD/MM/YYYY | HH:mm");
    };

    if (loading) {
        return (
            <div className="checkin-sidebar" style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="checkin-sidebar">
            {/* Sự kiện */}
            <Card className="checkin-card">
                <h3 className="sidebar-title-qr">
                    <CalendarOutlined /> Sự kiện
                </h3>
                {electionInfo ? (
                    <>
                        <p className="sidebar-event-name">{electionInfo.title || "Chưa có tên"}</p>
                        {meetingInfo?.meetingDate ? (
                            <p className="sidebar-event-time">{formatDate(meetingInfo.meetingDate)}</p>
                        ) : electionInfo.startDate ? (
                            <p className="sidebar-event-time">{formatDate(electionInfo.startDate)}</p>
                        ) : (
                            <p className="sidebar-event-time">Chưa cập nhật</p>
                        )}
                    </>
                ) : (
                    <>
                        <p className="sidebar-event-name">Chưa chọn cuộc bầu cử</p>
                        <p className="sidebar-event-time">Vui lòng chọn từ trang chủ</p>
                    </>
                )}
            </Card>

            {/* Thống kê */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-qr">
                    <BarChartOutlined /> Thống kê
                </h3>
                <p style={{ marginBottom: 0 }}>Đã check-in</p>
                <Progress percent={stats.percent} className="checkin-progress" />
                <p className="sidebar-progress">{stats.attended} / {stats.total}</p>
            </Card>

            {/* Check-in thủ công */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-qr">
                    <UserOutlined /> Check-in Thủ công
                </h3>
                {!canCheckin && (
                    <Alert
                        message="Giai đoạn checkin đã kết thúc"
                        description="Không thể thực hiện checkin nữa."
                        type="info"
                        showIcon
                        style={{ marginBottom: 12 }}
                    />
                )}
                <Input
                    placeholder="Nhập ID thẻ đại biểu..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleManualSearch}
                    style={{ marginBottom: 8 }}
                    allowClear
                    disabled={!canCheckin}
                />
                <Button
                    block
                    type="default"
                    className="checkin-btn"
                    onClick={handleManualSearch}
                    loading={searchLoading}
                    disabled={!canCheckin}
                >
                    Tìm kiếm & Xác nhận
                </Button>
            </Card>

            {/* Hoạt động gần nhất */}
            <Card className="checkin-card" bordered={false}>
                <h3 className="sidebar-title-pr">
                    <HistoryOutlined /> Hoạt động gần nhất
                </h3>
                {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                        <div key={index} className={`checkin-log ${activity.type}`}>
                            {activity.type === "success" ? <CheckCircleFilled /> : <CloseCircleFilled />}
                            <div>
                                <Text strong>{activity.name}</Text>
                                <p>{activity.time}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#999" }}>
                        Chưa có hoạt động nào
                    </div>
                )}
            </Card>

            {/* Modal xác nhận đại biểu */}
            <Modal
                open={isModalVisible}
                title="Xác nhận thông tin đại biểu"
                onCancel={handleCancel}
                footer={[
                    <Button key="cancel" onClick={handleCancel}>
                        Hủy
                    </Button>,
                    <Button
                        key="save"
                        type="primary"
                        onClick={handleSave}
                        loading={searchLoading}
                        disabled={!canCheckin}
                        style={{
                            backgroundColor: canCheckin ? '#52c41a' : '#d9d9d9',
                            borderColor: canCheckin ? '#52c41a' : '#d9d9d9',
                        }}
                    >
                        Checkin
                    </Button>,
                ]}
            >
                {searchLoading ? (
                    <div style={{ textAlign: "center", padding: "20px" }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16 }}>Đang tải thông tin đại biểu...</p>
                    </div>
                ) : delegateData ? (
                    <Descriptions bordered column={1} size="small">
                        <Descriptions.Item label="Họ tên">{delegateData.fullName || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Mã đại biểu">{delegateData.code || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Email">{delegateData.email || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">{delegateData.phone || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Đơn vị">{delegateData.department || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">{delegateData.position || "N/A"}</Descriptions.Item>
                        {delegateData.electionName && (
                            <Descriptions.Item label="Cuộc bầu cử">{delegateData.electionName}</Descriptions.Item>
                        )}
                    </Descriptions>
                ) : (
                    <p>Không có dữ liệu đại biểu.</p>
                )}
            </Modal>
        </div>
    );
};

export default CheckinSidebar;
