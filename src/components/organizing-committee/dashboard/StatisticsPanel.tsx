import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, Spin } from "antd";
import {
    UserOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CalendarOutlined,
} from "@ant-design/icons";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import MeetingService from "@/services/MeetingService";
import ElectionParticipantService from "@/services/ElectionParticipantsService";
import { BaseResponse } from "@/types/BaseResponse.interface";
import { io, Socket } from "socket.io-client";
import { useNotification } from "@/contexts/NotificationContext";

const StatisticsPanel: React.FC = () => {
    const { notify } = useNotification();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        attended: 0,
        notAttended: 0,
        percent: 0,
    });
    const [meetingInfo, setMeetingInfo] = useState<any>(null);

    useEffect(() => {
        fetchData();

        // Setup socket để nhận cập nhật realtime
        const currentElectionId = localStorage.getItem("currentElectionId");
        if (currentElectionId) {
            const socket: Socket = io("http://54.253.192.210:80/notification", {
                transports: ["websocket"],
            });

            socket.on("connect", () => {
                console.log("Socket connected for dashboard stats:", socket.id);
                socket.emit("join", currentElectionId);
            });

            socket.on("connect_error", (err) => {
                console.error("Socket connection error:", err.message);
            });

            socket.on("transferData", (data: any) => {
                if (data.type === "checkin-update" && data.stats) {
                    console.log("📊 Received checkin update:", data);
                    setStats((prevStats) => {
                        const newStats = {
                            total: data.stats.total || prevStats.total,
                            attended: data.stats.attended || prevStats.attended,
                            notAttended: data.stats.notAttended || prevStats.notAttended,
                            percent: data.stats.total > 0
                                ? Math.round((data.stats.attended / data.stats.total) * 100)
                                : 0,
                        };
                        return newStats;
                    });
                }
            });

            return () => {
                socket.disconnect();
                console.log("Socket disconnected for dashboard stats");
            };
        }
    }, []);

    const fetchData = async () => {
        try {
            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                setLoading(false);
                return;
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
                        const meetingId = meetings[0]._id || meetings[0].id;
                        if (meetingId) {
                            await fetchStatistics(meetingId, currentElectionId);
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
            let participants: any[] = [];
            if (participantsResponse) {
                if (participantsResponse.success && Array.isArray(participantsResponse.data)) {
                    participants = participantsResponse.data;
                } else if (Array.isArray(participantsResponse)) {
                    participants = participantsResponse;
                } else if (participantsResponse.data && Array.isArray(participantsResponse.data)) {
                    participants = participantsResponse.data;
                }
            }
            const total = participants.length;

            // Get attended count
            const attendeesResponse: BaseResponse<any> = await MeetingAttendeeService.getByMeetingId(meetingId);
            const attendees = attendeesResponse?.success && attendeesResponse?.data
                ? (Array.isArray(attendeesResponse.data) ? attendeesResponse.data : [attendeesResponse.data])
                : [];
            const attended = attendees.filter((a: any) => a.attended === true).length;
            const notAttended = total - attended;

            const percent = total > 0 ? Math.round((attended / total) * 100) : 0;
            setStats({ total, attended, notAttended, percent });
        } catch (error) {
            console.error("Lỗi khi lấy thống kê:", error);
        }
    };

    if (loading) {
        return (
            <Card className="statistics-card" bordered={false}>
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <Spin size="large" />
                </div>
            </Card>
        );
    }

    return (
        <Card
            className="statistics-card"
            title={
                <span className="statistics-title">
                    <CalendarOutlined className="statistics-icon" />
                    Thống kê Check-in
                </span>
            }
            bordered={false}
            bodyStyle={{ height: "auto", minHeight: "auto" }}
        >
            <Row gutter={[12, 12]} style={{ height: "auto" }}>
                <Col xs={24} sm={12} style={{ height: "auto" }}>
                    <Card
                        className="stat-card stat-card-purple"
                        bodyStyle={{ padding: "24px", minHeight: "120px", height: "auto" }}
                    >
                        <Statistic
                            title={<span className="stat-title">Tổng số đại biểu</span>}
                            value={stats.total}
                            prefix={<UserOutlined className="stat-icon" />}
                            valueStyle={{ color: "#fff", fontSize: 36, fontWeight: 700 }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} style={{ height: "auto" }}>
                    <Card
                        className="stat-card stat-card-green"
                        bodyStyle={{ padding: "24px", minHeight: "120px", height: "auto" }}
                    >
                        <Statistic
                            title={<span className="stat-title">Đã check-in</span>}
                            value={stats.attended}
                            prefix={<CheckCircleOutlined className="stat-icon" />}
                            valueStyle={{ color: "#fff", fontSize: 36, fontWeight: 700 }}
                        />
                    </Card>
                </Col>
            </Row>

            {meetingInfo && (
                <div className="meeting-info-section">
                    <div className="meeting-info-label">Thông tin cuộc họp</div>
                    <div className="meeting-info-title">
                        {meetingInfo.title || meetingInfo.name || "Chưa cập nhật"}
                    </div>
                    {meetingInfo.meetingDate && (
                        <div className="meeting-info-date">
                            {new Date(meetingInfo.meetingDate).toLocaleString("vi-VN", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric"
                            })}
                        </div>
                    )}
                    {meetingInfo.location && (
                        <div className="meeting-info-location">
                            <span className="location-icon">📍</span> {meetingInfo.location}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

export default StatisticsPanel;

