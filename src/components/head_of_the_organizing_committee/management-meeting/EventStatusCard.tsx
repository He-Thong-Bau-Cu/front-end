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
    // tổng thời gian còn lại (giây)
    const [timeLeft, setTimeLeft] = useState(stats?.timeLeft || 0);
    const [isRunning, setIsRunning] = useState(stats?.isRunning || false);

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

    useEffect(() => {
        if (stats) {
            setTimeLeft(stats.timeLeft);
            setIsRunning(stats.isRunning);
        }
    }, [stats]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 0) {
                        setIsRunning(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    // Kiểm tra trạng thái meeting
    const meetingStatus = meeting?.status || "PENDING";
    const isPending = meetingStatus === "PENDING";
    const isCompleted = meetingStatus === "COMPLETED";

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

                <h2 className="event-status-timer">{formatTime(timeLeft)}</h2>

                <div className="event-status-buttons">
                    {isPending && (
                        <Button
                            className="start-btn"
                            type="primary"
                            block
                            onClick={async () => {
                                if (!meeting?._id) {
                                    message.error("Không tìm thấy thông tin cuộc họp");
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
