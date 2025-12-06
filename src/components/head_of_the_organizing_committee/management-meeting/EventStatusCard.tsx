import React, { useEffect, useState } from "react";
import { Card, Button, Progress, Tag } from "antd";
import {
    PlayCircleOutlined,
    StopOutlined,
} from "@ant-design/icons";
import MeetingService from "@/services/MeetingService";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDateNoOffset } from "@/utils/format";

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
    const { notify } = useNotification();
     // Thời gian đã trôi qua từ khi bắt đầu (giây) - đếm từ 0 lên
     const [timeElapsed, setTimeElapsed] = useState(0);
     const [isRunning, setIsRunning] = useState(stats?.isRunning || false);
     const [meetingStartTime, setMeetingStartTime] = useState<number | null>(null);

    const meetingKey = meeting?._id || electionId || "meeting";
    const startKey = `meeting_start_time_${meetingKey}`;
    const pausedKey = `meeting_paused_elapsed_${meetingKey}`;

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
        const statusRunning = meeting?.status === "ONGOING";
        if (stats) {
            setIsRunning(stats.isRunning || statusRunning);
        } else {
            setIsRunning(statusRunning);
        }

        if (meeting) {
            const timeline = election?.timeline || {};
            let startTime: Date | null = null;

            // Ưu tiên lấy từ timeline (checkinAt là giai đoạn đầu tiên)
            if (timeline.checkinAt) {
                startTime = new Date(timeline.checkinAt);
            } else if (timeline.reportAt) {
                startTime = new Date(timeline.reportAt);
            } else if (timeline.votingAt) {
                startTime = new Date(timeline.votingAt);
            } else if (meeting.createdAt) {
                startTime = new Date(meeting.createdAt);
            }

            if (!startTime) {
                const stored = localStorage.getItem(startKey);
                if (stored && !Number.isNaN(Number(stored))) {
                    startTime = new Date(Number(stored));
                } else if (statusRunning) {
                    startTime = new Date();
                }
            }

            const now = Date.now();
            if (statusRunning && startTime) {
                const elapsed = Math.floor((now - startTime.getTime()) / 1000);
                setMeetingStartTime(startTime.getTime());
                setTimeElapsed(Math.max(0, elapsed));
                localStorage.removeItem(pausedKey);
            } else {
                setMeetingStartTime(startTime ? startTime.getTime() : null);
                const pausedElapsed = Number(localStorage.getItem(pausedKey) || 0);
                setTimeElapsed(Number.isNaN(pausedElapsed) ? timeElapsed : Math.max(0, pausedElapsed));
            }
        }
    }, [stats, meeting, election]);

    // Đếm thời gian từ 0 lên khi meeting đang chạy
    useEffect(() => {
        // Nếu chưa có mốc hoặc đang tạm dừng thì không cập nhật
        if (!meetingStartTime || !isRunning) {
            return;
        }

        const updateTime = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - meetingStartTime) / 1000);
            setTimeElapsed(Math.max(0, elapsed));
        };

        // Cập nhật ngay lập tức lần đầu
        updateTime();

        // Sau đó cập nhật mỗi giây
        const timer = setInterval(updateTime, 1000);

        return () => clearInterval(timer);
    }, [meetingStartTime, isRunning]);

    // Kiểm tra trạng thái meeting
    const meetingStatus = meeting?.status || "PENDING";
    const isPending = meetingStatus === "PENDING";
    const isCompleted = meetingStatus === "COMPLETED";

    // Kiểm tra meetingDate có <= thời gian hiện tại không
    const meetingDate = meeting?.meetingDate ? new Date(new Date(meeting?.meetingDate).getTime() - 7 * 3600 * 1000) : null;
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

                {/*<h2 className="event-status-timer">{formatTime(timeElapsed)}</h2>*/}

                <div className="event-status-buttons">
                    {isPending && (
                        <Button
                            className="start-btn"
                            type="primary"
                            block
                            icon={<PlayCircleOutlined />}
                            disabled={!canStartMeeting}
                            onClick={async () => {
                                if (!meeting?._id) {
                                    notify("Không tìm thấy thông tin cuộc họp", "error");
                                    return;
                                }
                                if (!canStartMeeting) {
                                    notify("Chỉ có thể bắt đầu cuộc họp khi ngày họp đã đến hoặc đã qua", "warning");
                                    return;
                                }
                                try {
                                    await MeetingService.updateStatus(meeting._id, "ONGOING");
                                    notify("Đã bắt đầu sự kiện", "success");
                                    const nowTs = Date.now();
                                    localStorage.setItem(startKey, String(nowTs));
                                    setMeetingStartTime(nowTs);
                                    setTimeElapsed(0);
                                    setIsRunning(true);
                                    if (onRefresh) await onRefresh();
                                } catch (error: any) {
                                    console.error("Error starting meeting:", error);
                                    notify(error?.response?.data?.message || "Không thể bắt đầu sự kiện", "error");
                                    // rollback optimistic state nếu lỗi
                                    setIsRunning(false);
                                    setMeetingStartTime(null);
                                    setTimeElapsed(0);
                                }
                            }}
                        >
                            Bắt đầu Sự kiện
                        </Button>
                    )}
                    {isPending && !canStartMeeting && (
                        <p style={{ color: '#999', fontStyle: 'italic', margin: '8px 0 0', fontSize: '12px' }}>
                            Chờ đến ngày họp để bắt đầu
                        </p>
                    )}
                    {/* Tạm dừng/tiếp tục đã được loại bỏ theo yêu cầu */}
                    {!isPending && (
                        <Button
                            className="stop-btn"
                            disabled={isCompleted || !canEndMeeting}
                            icon={<StopOutlined />}
                            onClick={async () => {
                                if (!meeting?._id) {
                                    notify("Không tìm thấy thông tin cuộc họp", "error");
                                    return;
                                }
                                if (!canEndMeeting) {
                                    notify("Chỉ có thể kết thúc cuộc họp khi tất cả các giai đoạn đã hoàn thành", "warning");
                                    return;
                                }
                                try {
                                    await MeetingService.updateStatus(meeting._id, "COMPLETED");
                                    notify("Đã kết thúc sự kiện", "success");
                                    localStorage.removeItem(startKey);
                                    if (onRefresh) await onRefresh();
                                } catch (error: any) {
                                    console.error("Error ending meeting:", error);
                                    notify(error?.response?.data?.message || "Không thể kết thúc sự kiện", "error");
                                }
                            }}
                        >
                            Kết thúc Sự kiện
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
