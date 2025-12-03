import React, { useEffect, useState } from "react";
import { Card, Button, Progress, Tag, message } from "antd";
import MeetingService from "@/services/MeetingService";

interface EventStatusCardProps {
    electionId?: string;
    stats?: {
        totalAttendees: number;
        checkedInCount: number;
        votedCount: number;
        checkinPercent: number;
        votePercent: number;
        timeLeft: number;
        isRunning: boolean;
    };
    meeting?: any;
    election?: any;
    onRefresh?: () => void;
}

const EventStatusCard: React.FC<EventStatusCardProps> = ({
    electionId,
    stats,
    meeting,
    election,
    onRefresh
}) => {
    // Thời gian đã trôi qua từ khi bắt đầu (giây) - đếm từ 0 lên
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(stats?.isRunning || false);
    const [meetingStartTime, setMeetingStartTime] = useState<number | null>(null);

    // format về dạng HH:MM:SS
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    // Tính thời gian đã trôi qua từ khi meeting bắt đầu
    useEffect(() => {
        if (stats) {
            setIsRunning(stats.isRunning);
        }

        // Tìm thời điểm bắt đầu meeting (từ timeline hoặc createdAt)
        if (meeting) {
            // Ưu tiên lấy từ timeline (checkinAt là giai đoạn đầu tiên)
            const timeline = election?.timeline || {};
            let startTime: Date | null = null;

            // Tìm giai đoạn đầu tiên đã bắt đầu
            if (timeline.checkinAt) {
                startTime = new Date(timeline.checkinAt);
            } else if (timeline.reportAt) {
                startTime = new Date(timeline.reportAt);
            } else if (timeline.votingAt) {
                startTime = new Date(timeline.votingAt);
            } else if (meeting.createdAt) {
                startTime = new Date(meeting.createdAt);
            }

            if (startTime) {
                setMeetingStartTime(startTime.getTime());
                // Tính thời gian đã trôi qua
                const now = new Date().getTime();
                const elapsed = Math.floor((now - startTime.getTime()) / 1000);
                setTimeElapsed(Math.max(0, elapsed));
            } else {
                setMeetingStartTime(null);
                setTimeElapsed(0);
            }
        }
    }, [stats, meeting, election]);

    // Đếm thời gian từ 0 lên khi meeting đang chạy
    useEffect(() => {
        // Tính toán và cập nhật ngay lập tức
        const updateTime = () => {
            if (!meetingStartTime) {
                return;
            }

            const now = new Date().getTime();
            const elapsed = Math.floor((now - meetingStartTime) / 1000);
            setTimeElapsed(Math.max(0, elapsed));
        };

        // Cập nhật ngay lập tức lần đầu nếu có meetingStartTime
        if (meetingStartTime) {
            updateTime();
        }

        // Sau đó cập nhật mỗi giây (luôn chạy để kiểm tra)
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [meetingStartTime]);

    // Kiểm tra trạng thái meeting
    const meetingStatus = meeting?.status || "PENDING";
    const isPending = meetingStatus === "PENDING";
    const isCompleted = meetingStatus === "COMPLETED";

    // Kiểm tra meetingDate có <= thời gian hiện tại không
    const meetingDate = meeting?.meetingDate ? new Date(meeting.meetingDate) : null;
    const now = new Date();
    const canStartMeeting = meetingDate ? meetingDate <= now : false;

    // Kiểm tra tất cả các giai đoạn đã hoàn thành chưa
    const stages = election?.stages || {};
    const allStagesCompleted =
        stages.checkin === 'COMPLETED' &&
        stages.report === 'COMPLETED' &&
        stages.voting === 'COMPLETED' &&
        stages.result === 'COMPLETED' &&
        stages.closing === 'COMPLETED';

    // Chỉ có thể kết thúc cuộc họp khi tất cả giai đoạn đã hoàn thành
    const canEndMeeting = !isPending && !isCompleted && allStagesCompleted;

    return (
        <Card bordered={false} className="event-status-card">
            <h4 className="event-status-title">Trạng thái Sự kiện</h4>

            <div className="event-status-content">
                <Tag className="event-status-tag">
                    {isCompleted ? "ĐÃ KẾT THÚC" : isRunning ? "ĐANG DIỄN RA" : "TẠM DỪNG"}
                </Tag>

                <h2 className="event-status-timer">{formatTime(timeElapsed)}</h2>

                <div className="event-status-buttons">
                    {isPending && (
                        <Button
                            className="start-btn"
                            type="primary"
                            block
                            disabled={!canStartMeeting}
                            onClick={async () => {
                                if (!meeting?._id) {
                                    message.error("Không tìm thấy thông tin cuộc họp");
                                    return;
                                }
                                if (!canStartMeeting) {
                                    message.warning("Chỉ có thể bắt đầu cuộc họp khi ngày họp đã đến hoặc đã qua");
                                    return;
                                }
                                try {
                                    await MeetingService.updateStatus(meeting._id, "ONGOING");
                                    message.success("Đã bắt đầu sự kiện");
                                    if (onRefresh) {
                                        await onRefresh();
                                    }
                                } catch (error: any) {
                                    console.error("Error starting meeting:", error);
                                    message.error(error?.response?.data?.message || "Không thể bắt đầu sự kiện");
                                }
                            }}
                        >
                            ▶️ Bắt đầu Sự kiện
                        </Button>
                    )}
                    {isPending && !canStartMeeting && (
                        <p style={{ color: '#999', fontStyle: 'italic', margin: '8px 0 0', fontSize: '12px' }}>
                            Chờ đến ngày họp để bắt đầu
                        </p>
                    )}
                    {!isPending && !isCompleted && (
                        <Button
                            className="pause-btn"
                            disabled={isCompleted}
                            onClick={async () => {
                                if (!meeting?._id) {
                                    message.error("Không tìm thấy thông tin cuộc họp");
                                    return;
                                }
                                try {
                                    const newStatus = isRunning ? "POSTPONED" : "ONGOING";
                                    await MeetingService.updateStatus(meeting._id, newStatus);
                                    message.success(isRunning ? "Đã tạm dừng sự kiện" : "Đã tiếp tục sự kiện");
                                    if (onRefresh) {
                                        await onRefresh();
                                    }
                                } catch (error: any) {
                                    console.error("Error updating meeting status:", error);
                                    message.error(error?.response?.data?.message || "Không thể cập nhật trạng thái");
                                }
                            }}
                        >
                            {isRunning ? "⏸️ Tạm dừng Sự kiện" : "▶️ Tiếp tục Sự kiện"}
                        </Button>
                    )}
                    {!isPending && (
                        <Button
                            className="stop-btn"
                            disabled={isCompleted || !canEndMeeting}
                            onClick={async () => {
                                if (!meeting?._id) {
                                    message.error("Không tìm thấy thông tin cuộc họp");
                                    return;
                                }
                                if (!canEndMeeting) {
                                    message.warning("Chỉ có thể kết thúc cuộc họp khi tất cả các giai đoạn đã hoàn thành");
                                    return;
                                }
                                try {
                                    await MeetingService.updateStatus(meeting._id, "COMPLETED");
                                    message.success("Đã kết thúc sự kiện");
                                    if (onRefresh) {
                                        await onRefresh();
                                    }
                                } catch (error: any) {
                                    console.error("Error ending meeting:", error);
                                    message.error(error?.response?.data?.message || "Không thể kết thúc sự kiện");
                                }
                            }}
                        >
                            🛑 Kết thúc Sự kiện
                        </Button>
                    )}
                </div>

                <div className="event-status-progress">
                    <div className="progress-row">
                        <span>Check-in:</span>
                        <Progress
                            percent={stats?.checkinPercent || 0}
                            size="small"
                            strokeColor="#6FCF97"
                            showInfo={false}
                        />
                        <span className="percent">{stats?.checkinPercent || 0}%</span>
                    </div>
                    <div className="progress-row">
                        <span>Bỏ phiếu:</span>
                        <Progress
                            percent={stats?.votePercent || 0}
                            size="small"
                            strokeColor="#2F80ED"
                            showInfo={false}
                        />
                        <span className="percent">{stats?.votePercent || 0}%</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventStatusCard;
