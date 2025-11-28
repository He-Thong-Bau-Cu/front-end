import React, { useCallback, useEffect, useState } from "react";
import { Layout, Row, Col, Spin, message } from "antd";
import EventStatusCard from "@/components/head_of_the_organizing_committee/management-meeting/EventStatusCard";
import EventStageControl from "@/components/head_of_the_organizing_committee/management-meeting/EventStageControl";
import AnnouncementCard from "@/components/head_of_the_organizing_committee/management-meeting/AnnouncementCard";
import MeetingService from "@/services/MeetingService";
import '../../style/head-of-the-organizing-committee/ManagementMeeting.model.css'
import { io, Socket } from "socket.io-client";

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

    const loadData = useCallback(async (options?: { showLoader?: boolean }) => {
        const shouldShowLoader = options?.showLoader ?? false;
        if (shouldShowLoader) {
            setLoading(true);
        }

        try {
            // Lấy electionId từ localStorage
            const currentElectionId = localStorage.getItem("currentElectionId");
            if (!currentElectionId) {
                message.error("Vui lòng chọn cuộc bầu cử từ trang chủ");
                if (shouldShowLoader) {
                    setLoading(false);
                }
                return;
            }

            setElectionId(currentElectionId);

            const response = await MeetingService.getEventManagementStats(currentElectionId);
            const data = response?.data || response;
            setStats(data);
        } catch (error: any) {
            console.error("Error loading event management stats:", error);
            message.error(error?.response?.data?.message || "Không thể tải thống kê điều hành sự kiện");
        } finally {
            if (shouldShowLoader) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        loadData({ showLoader: true });
    }, [loadData]);

    const currentMeetingId = stats?.meeting?._id || (stats?.meeting as any)?.id || "";

    useEffect(() => {
        if (!electionId) {
            return;
        }

        const socket: Socket = io("http://54.253.192.210:80/notification", {
            transports: ["websocket"],
        });

        socket.on("connect", () => {
            socket.emit("join", electionId);
            socket.emit("join-election-room", electionId);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error on organizer screen:", err.message);
        });

        socket.on("transferData", (data: any) => {
            if (!data?.type) {
                return;
            }

            if (data.electionId && data.electionId !== electionId) {
                return;
            }

            if (data.type === "checkin-update") {
                if (currentMeetingId && data.meetingId !== currentMeetingId) {
                    return;
                }
                loadData();
                return;
            }

            const realtimeTriggers = [
                "stage-started",
                "stage-ended",
                "meeting-status-updated",
                "event-management-update",
            ];

            if (realtimeTriggers.includes(data.type)) {
                loadData();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, [electionId, loadData, currentMeetingId]);

    if (loading) {
        return (
            <Layout
                style={{
                    background: "#F3F8F3",
                    minHeight: "100vh",
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
                    background: "#F3F8F3",
                    minHeight: "100vh",
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

    return (
        <Layout
            style={{
                background: "#F3F8F3",
                minHeight: "100vh",
                padding: "24px 40px",
            }}
        >
            {/* HEADER */}
            <div style={{ marginBottom: 16 }}>
                <h2 style={{ color: "#124D2D", marginBottom: 4 }}>
                    Điều hành Sự kiện: {eventTitle}
                </h2>
            </div>

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
        </Layout>
    );
};

export default ManagementMeeting;
