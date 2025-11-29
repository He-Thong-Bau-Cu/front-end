import React, { useEffect, useState } from "react";
import { Card, Button, message, Modal } from "antd";
import {
    CheckCircleFilled,
    ClockCircleOutlined,
    StopOutlined,
    FlagOutlined,
    PlayCircleOutlined,
} from "@ant-design/icons";
import ElectionService from "@/services/ElectionService";
import SystemConfigService from "@/services/SystemConfigService";

interface EventStageControlProps {
    electionId?: string;
    meeting?: any;
    election?: any;
    stats?: any;
    onRefresh?: () => void;
}

const EventStageControl: React.FC<EventStageControlProps> = ({
    electionId,
    meeting,
    election,
    stats,
    onRefresh
}) => {
    // Kiểm tra trạng thái meeting - chỉ có thể bắt đầu giai đoạn khi meeting đã được bắt đầu
    const meetingStatus = meeting?.status || "PENDING";
    const isMeetingStarted = meetingStatus !== "PENDING";
    const isMeetingCompleted = meetingStatus === "COMPLETED";

    // Xác định trạng thái các giai đoạn dựa trên timeline và stages
    const timeline = election?.timeline || {};
    const stages = election?.stages || {};

    // Giai đoạn Check-in
    const checkinStarted = !!timeline.checkinAt;
    const checkinCompleted = stages.checkin === 'COMPLETED';
    const checkinActive = checkinStarted && !checkinCompleted;
    const canStartCheckin = isMeetingStarted && !checkinStarted && !checkinCompleted;

    // Giai đoạn Phát biểu & Báo cáo
    const reportStarted = !!timeline.reportAt;
    const reportCompleted = stages.report === 'COMPLETED';
    const reportActive = reportStarted && !reportCompleted;
    const canStartReport = isMeetingStarted && checkinCompleted && !reportStarted && !reportCompleted;

    // Giai đoạn Bỏ phiếu
    const votingStarted = !!timeline.votingAt;
    const votingCompleted = stages.voting === 'COMPLETED';
    const votingActive = votingStarted && !votingCompleted;
    const canStartVoting = isMeetingStarted && reportCompleted && !votingStarted && !votingCompleted;

    // Timer cho giai đoạn bỏ phiếu
    const [votingTimeLeft, setVotingTimeLeft] = useState<string>("--:--:--");
    const [votingTimeLeftSeconds, setVotingTimeLeftSeconds] = useState<number>(0);
    const [autoEndTriggered, setAutoEndTriggered] = useState<boolean>(false);

    const formatSecondsToClock = (seconds: number): string => {
        if (!seconds || seconds <= 0) return "00:00:00";
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

    // Load và tính thời gian còn lại cho giai đoạn bỏ phiếu
    useEffect(() => {
        const loadVotingTimer = async () => {
            if (!votingActive || votingCompleted || !timeline.votingAt) {
                setVotingTimeLeft("--:--:--");
                setVotingTimeLeftSeconds(0);
                setAutoEndTriggered(false);
                return;
            }

            try {
                // Lấy config TIME_VOTE_ELECTION (thời gian bầu cử tính bằng phút)
                const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
                const config: any = configResponse?.data || configResponse;
                // Xử lý cả 2 trường hợp: config có thể là SystemConfig hoặc BaseResponse<SystemConfig>
                const configValue = (config?.data?.configValue !== undefined)
                    ? config.data.configValue
                    : config?.configValue;
                const timeVoteElection = (typeof configValue === 'object' && configValue?.value !== undefined)
                    ? configValue.value
                    : (typeof configValue === 'number' ? configValue : 0);
                const voteDurationMinutes = typeof timeVoteElection === 'number' ? timeVoteElection : parseInt(String(timeVoteElection)) || 0;
                const voteDurationSeconds = voteDurationMinutes * 60; // Chuyển đổi từ phút sang giây

                console.log("Voting timer calculation:", {
                    timeVoteElection,
                    voteDurationMinutes,
                    voteDurationSeconds,
                    votingAt: timeline.votingAt
                });

                if (voteDurationSeconds <= 0) {
                    console.warn("TIME_VOTE_ELECTION config is invalid or zero:", voteDurationMinutes);
                    setVotingTimeLeft("--:--:--");
                    setVotingTimeLeftSeconds(0);
                    setAutoEndTriggered(false);
                    return;
                }

                const votingStartTime = new Date(timeline.votingAt).getTime();
                const now = new Date().getTime();
                const timeSinceStart = now - votingStartTime;

                console.log("Time calculation:", {
                    votingStartTime: new Date(votingStartTime).toISOString(),
                    now: new Date(now).toISOString(),
                    timeSinceStart: Math.floor(timeSinceStart / 1000) + " seconds",
                    voteDurationSeconds
                });

                // Nếu thời điểm bắt đầu trong tương lai (không hợp lệ), tính từ bây giờ
                if (votingStartTime > now) {
                    console.warn("votingStartTime is in the future, using current time");
                    const seconds = voteDurationSeconds;
                    setVotingTimeLeftSeconds(seconds);
                    setVotingTimeLeft(formatSecondsToClock(seconds));
                    setAutoEndTriggered(false);
                    return;
                }

                // Tính thời gian còn lại
                const votingEndTime = votingStartTime + (voteDurationSeconds * 1000);
                const timeRemaining = votingEndTime - now;

                console.log("Remaining time:", {
                    votingEndTime: new Date(votingEndTime).toISOString(),
                    timeRemaining: Math.floor(timeRemaining / 1000) + " seconds"
                });

                if (timeRemaining > 0) {
                    const seconds = Math.floor(timeRemaining / 1000);
                    setVotingTimeLeftSeconds(seconds);
                    setVotingTimeLeft(formatSecondsToClock(seconds));
                    setAutoEndTriggered(false); // Reset khi có thời gian còn lại
                } else {
                    // Thời gian đã hết
                    console.warn("Voting time has expired");
                    setVotingTimeLeftSeconds(0);
                    setVotingTimeLeft("00:00:00");
                }
            } catch (error: any) {
                console.error("Error loading TIME_VOTE_ELECTION config:", error);
                setVotingTimeLeft("--:--:--");
                setVotingTimeLeftSeconds(0);
                setAutoEndTriggered(false);
            }
        };

        loadVotingTimer();
    }, [votingActive, votingCompleted, timeline.votingAt]);

    // Tự động kết thúc giai đoạn bỏ phiếu khi hết thời gian
    useEffect(() => {
        const autoEndVoting = async () => {
            if (votingCompleted || autoEndTriggered || votingTimeLeftSeconds > 0 || !votingActive) {
                return;
            }

            if (!electionId) {
                return;
            }

            // Chỉ tự động kết thúc nếu thời gian đã thực sự hết (đợi ít nhất 2 giây sau khi bắt đầu để tránh race condition)
            const votingStartTime = timeline.votingAt ? new Date(timeline.votingAt).getTime() : 0;
            const now = new Date().getTime();
            const timeSinceStart = (now - votingStartTime) / 1000; // seconds

            // Nếu mới bắt đầu (< 2 giây), không tự động kết thúc (có thể do tính toán sai)
            if (timeSinceStart < 2) {
                console.warn("Voting just started, skipping auto-end to avoid race condition");
                return;
            }

            try {
                setAutoEndTriggered(true);
                await ElectionService.endStage(electionId, 'voting');
                message.success("Thời gian bỏ phiếu đã hết. Giai đoạn bỏ phiếu đã được tự động kết thúc.");
                setVotingTimeLeft("00:00:00");
                // Gọi onRefresh để cập nhật trạng thái
                onRefresh?.();
            } catch (error: any) {
                console.error("Error auto-ending voting stage:", error);
                message.error(error?.response?.data?.message || "Không thể tự động kết thúc giai đoạn bỏ phiếu");
                setAutoEndTriggered(false); // Reset để có thể thử lại
            }
        };

        if (votingTimeLeftSeconds === 0 && votingActive && !votingCompleted && !autoEndTriggered) {
            autoEndVoting();
        }
    }, [votingTimeLeftSeconds, votingActive, votingCompleted, autoEndTriggered, electionId, onRefresh, timeline.votingAt]);

    // Timer đếm ngược mỗi giây
    useEffect(() => {
        if (votingCompleted || !votingActive || votingTimeLeftSeconds <= 0) {
            if (votingTimeLeftSeconds <= 0 && votingActive) {
                setVotingTimeLeft("00:00:00");
            }
            return;
        }

        const interval = setInterval(() => {
            setVotingTimeLeftSeconds((prev) => {
                if (prev <= 0) {
                    return 0;
                }
                const newSeconds = prev - 1;
                setVotingTimeLeft(formatSecondsToClock(newSeconds));
                return newSeconds;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [votingTimeLeftSeconds, votingActive, votingCompleted]);

    // Reset autoEndTriggered khi voting completed
    useEffect(() => {
        if (votingCompleted) {
            setAutoEndTriggered(false);
        }
    }, [votingCompleted]);

    // Giai đoạn Công bố Kết quả
    const resultAnnounced = !!timeline.resultAnnouncedAt;
    const resultCompleted = stages.result === 'COMPLETED';
    const resultActive = resultAnnounced && !resultCompleted;
    const canAnnounceResult = isMeetingStarted && votingCompleted && !resultAnnounced && !resultCompleted;

    // Giai đoạn Bế mạc
    const closingStarted = !!timeline.closingAt;
    const closingCompleted = stages.closing === 'COMPLETED';
    const closingActive = closingStarted && !closingCompleted;
    const canStartClosing = isMeetingStarted && resultCompleted && !closingStarted && !closingCompleted;
    return (
        <Card bordered={false} className="stage-card">
            <h4 className="stage-title">Kiểm soát Quy trình & Giai đoạn</h4>

            <div className="stage-timeline">
                {/* Giai đoạn 1: Check-in */}
                <div className={`stage-item ${checkinCompleted ? 'completed' : checkinActive ? 'active' : 'pending'}`}>
                    <div className="stage-icon">
                        {checkinCompleted ? <CheckCircleFilled /> : checkinActive ? <ClockCircleOutlined /> : <StopOutlined />}
                    </div>
                    <div className="stage-content">
                        <strong>Giai đoạn Check-in</strong>
                        <p>
                            {checkinCompleted
                                ? `Đã hoàn tất: ${stats?.checkedInCount || 0} / ${stats?.totalAttendees || 0} đại biểu`
                                : checkinActive
                                ? `Đang diễn ra: ${stats?.checkedInCount || 0} / ${stats?.totalAttendees || 0} đại biểu`
                                : "Chưa bắt đầu"}
                        </p>
                        {canStartCheckin && (
                            <Button
                                block
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={async () => {
                                    if (!electionId) {
                                        message.error("Không tìm thấy thông tin cuộc bầu cử");
                                        return;
                                    }
                                    try {
                                        await ElectionService.startStage(electionId, 'checkin');
                                        message.success("Đã bắt đầu giai đoạn Check-in");
                                        onRefresh?.();
                                    } catch (error: any) {
                                        message.error(error?.response?.data?.message || "Không thể bắt đầu giai đoạn");
                                    }
                                }}
                            >
                                BẮT ĐẦU GIAI ĐOẠN CHECK-IN
                            </Button>
                        )}
                        {!isMeetingStarted && !checkinStarted && !checkinCompleted && (
                            <p style={{ color: '#999', fontStyle: 'italic', margin: 0 }}>
                                Vui lòng bắt đầu sự kiện trước
                            </p>
                        )}
                        {checkinActive && !checkinCompleted && (
                            <Button
                                block
                                className="end-vote-btn"
                                icon={<FlagOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Xác nhận kết thúc giai đoạn Check-in",
                                        content: "Bạn có chắc chắn muốn kết thúc giai đoạn Check-in? Sau khi kết thúc, không thể check-in thêm.",
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: async () => {
                                            if (!electionId) {
                                                message.error("Không tìm thấy thông tin cuộc bầu cử");
                                                return;
                                            }
                                            try {
                                                await ElectionService.endStage(electionId, 'checkin');
                                                message.success("Đã kết thúc giai đoạn Check-in");
                                                onRefresh?.();
                                            } catch (error: any) {
                                                console.error("Error ending checkin stage:", error);
                                                message.error(error?.response?.data?.message || "Không thể kết thúc giai đoạn Check-in");
                                            }
                                        },
                                    });
                                }}
                            >
                                KẾT THÚC GIAI ĐOẠN CHECK-IN
                            </Button>
                        )}
                    </div>
                </div>

                {/* Giai đoạn 2: Phát biểu & Báo cáo */}
                <div className={`stage-item ${reportCompleted ? 'completed' : reportActive ? 'active' : 'pending'}`}>
                    <div className="stage-icon">
                        {reportCompleted ? <CheckCircleFilled /> : reportActive ? <ClockCircleOutlined /> : <StopOutlined />}
                    </div>
                    <div className="stage-content">
                        <strong>Phát biểu & Báo cáo</strong>
                        <p>
                            {reportCompleted ? "Đã hoàn tất" : reportActive ? "Đang diễn ra" : "Chưa bắt đầu"}
                        </p>
                        {canStartReport && (
                            <Button
                                block
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={async () => {
                                    if (!electionId) {
                                        message.error("Không tìm thấy thông tin cuộc bầu cử");
                                        return;
                                    }
                                    try {
                                        await ElectionService.startStage(electionId, 'report');
                                        message.success("Đã bắt đầu giai đoạn Phát biểu & Báo cáo");
                                        onRefresh?.();
                                    } catch (error: any) {
                                        message.error(error?.response?.data?.message || "Không thể bắt đầu giai đoạn");
                                    }
                                }}
                            >
                                BẮT ĐẦU GIAI ĐOẠN PHÁT BIỂU & BÁO CÁO
                            </Button>
                        )}
                        {reportActive && !reportCompleted && (
                            <Button
                                block
                                className="end-vote-btn"
                                icon={<FlagOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Xác nhận kết thúc giai đoạn Phát biểu & Báo cáo",
                                        content: "Bạn có chắc chắn muốn kết thúc giai đoạn Phát biểu & Báo cáo?",
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: async () => {
                                            if (!electionId) {
                                                message.error("Không tìm thấy thông tin cuộc bầu cử");
                                                return;
                                            }
                                            try {
                                                await ElectionService.endStage(electionId, 'report');
                                                message.success("Đã kết thúc giai đoạn Phát biểu & Báo cáo");
                                                onRefresh?.();
                                            } catch (error: any) {
                                                console.error("Error ending report stage:", error);
                                                message.error(error?.response?.data?.message || "Không thể kết thúc giai đoạn");
                                            }
                                        },
                                    });
                                }}
                            >
                                KẾT THÚC GIAI ĐOẠN PHÁT BIỂU & BÁO CÁO
                            </Button>
                        )}
                    </div>
                </div>

                {/* Giai đoạn 3: Bỏ phiếu */}
                <div className={`stage-item ${votingCompleted ? 'completed' : votingActive ? 'active' : 'pending'}`}>
                    <div className="stage-icon">
                        {votingCompleted ? <CheckCircleFilled /> : votingActive ? <ClockCircleOutlined /> : <StopOutlined />}
                    </div>
                    <div className="stage-content">
                        <strong>Giai đoạn Bỏ phiếu</strong>
                        <p>
                            {votingActive
                                ? `Đang diễn ra: ${stats?.votedCount || 0} / ${stats?.totalAttendees || 0} đã bỏ phiếu`
                                : votingCompleted
                                ? `Đã hoàn tất: ${stats?.votedCount || 0} / ${stats?.totalAttendees || 0} đã bỏ phiếu`
                                : "Chưa bắt đầu"}
                        </p>
                        {votingActive && !votingCompleted && (
                            <p style={{ marginTop: 8, fontSize: 14, color: '#1677ff', fontWeight: 600 }}>
                                Thời gian còn lại: {votingTimeLeft}
                            </p>
                        )}
                        {canStartVoting && (
                            <Button
                                block
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={async () => {
                                    if (!electionId) {
                                        message.error("Không tìm thấy thông tin cuộc bầu cử");
                                        return;
                                    }
                                    try {
                                        await ElectionService.startStage(electionId, 'voting');
                                        message.success("Đã bắt đầu giai đoạn Bỏ phiếu");
                                        onRefresh?.();
                                    } catch (error: any) {
                                        message.error(error?.response?.data?.message || "Không thể bắt đầu giai đoạn");
                                    }
                                }}
                            >
                                BẮT ĐẦU GIAI ĐOẠN BỎ PHIẾU
                            </Button>
                        )}
                        {votingActive && !votingCompleted && (
                            <Button
                                block
                                className="end-vote-btn"
                                icon={<FlagOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Xác nhận kết thúc giai đoạn bỏ phiếu",
                                        content: "Bạn có chắc chắn muốn kết thúc giai đoạn bỏ phiếu? Sau khi kết thúc, không thể bỏ phiếu thêm.",
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: async () => {
                                            if (!electionId) {
                                                message.error("Không tìm thấy thông tin cuộc bầu cử");
                                                return;
                                            }
                                            try {
                                                await ElectionService.endStage(electionId, 'voting');
                                                message.success("Đã kết thúc giai đoạn bỏ phiếu");
                                                onRefresh?.();
                                            } catch (error: any) {
                                                console.error("Error ending voting stage:", error);
                                                message.error(error?.response?.data?.message || "Không thể kết thúc giai đoạn bỏ phiếu");
                                            }
                                        },
                                    });
                                }}
                            >
                                KẾT THÚC GIAI ĐOẠN BỎ PHIẾU
                            </Button>
                        )}
                    </div>
                </div>

                {/* Giai đoạn 4: Công bố Kết quả */}
                <div className={`stage-item ${resultCompleted ? 'completed' : resultAnnounced ? 'active' : 'pending'}`}>
                    <div className="stage-icon">
                        {resultCompleted ? <CheckCircleFilled /> : resultAnnounced ? <ClockCircleOutlined /> : <StopOutlined />}
                    </div>
                    <div className="stage-content">
                        <strong>Công bố Kết quả</strong>
                        <p>
                            {resultCompleted ? "Đã hoàn tất" : resultAnnounced ? "Đang công bố" : canAnnounceResult ? "Sẵn sàng công bố" : "Chưa bắt đầu"}
                        </p>
                        {canAnnounceResult && (
                            <Button
                                block
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={async () => {
                                    if (!electionId) {
                                        message.error("Không tìm thấy thông tin cuộc bầu cử");
                                        return;
                                    }
                                    try {
                                        await ElectionService.startStage(electionId, 'result');
                                        message.success("Đã bắt đầu công bố kết quả");
                                        onRefresh?.();
                                    } catch (error: any) {
                                        message.error(error?.response?.data?.message || "Không thể công bố kết quả");
                                    }
                                }}
                            >
                                BẮT ĐẦU CÔNG BỐ KẾT QUẢ
                            </Button>
                        )}
                        {resultAnnounced && !resultCompleted && (
                            <Button
                                block
                                className="end-vote-btn"
                                icon={<FlagOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Xác nhận kết thúc công bố kết quả",
                                        content: "Bạn có chắc chắn muốn kết thúc công bố kết quả?",
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: async () => {
                                            if (!electionId) {
                                                message.error("Không tìm thấy thông tin cuộc bầu cử");
                                                return;
                                            }
                                            try {
                                                await ElectionService.endStage(electionId, 'result');
                                                message.success("Đã kết thúc công bố kết quả");
                                                onRefresh?.();
                                            } catch (error: any) {
                                                console.error("Error ending result stage:", error);
                                                message.error(error?.response?.data?.message || "Không thể kết thúc công bố kết quả");
                                            }
                                        },
                                    });
                                }}
                            >
                                KẾT THÚC CÔNG BỐ KẾT QUẢ
                            </Button>
                        )}
                    </div>
                </div>

                {/* Giai đoạn 5: Bế mạc */}
                <div className={`stage-item ${closingCompleted ? 'completed' : closingActive ? 'active' : 'pending'}`}>
                    <div className="stage-icon">
                        {closingCompleted ? <CheckCircleFilled /> : closingActive ? <ClockCircleOutlined /> : <StopOutlined />}
                    </div>
                    <div className="stage-content">
                        <strong>Bế mạc</strong>
                        <p>
                            {closingCompleted ? "Đã hoàn tất" : closingActive ? "Đang diễn ra" : canStartClosing ? "Sẵn sàng bế mạc" : "Chưa bắt đầu"}
                        </p>
                        {canStartClosing && (
                            <Button
                                block
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={async () => {
                                    if (!electionId) {
                                        message.error("Không tìm thấy thông tin cuộc bầu cử");
                                        return;
                                    }
                                    try {
                                        await ElectionService.startStage(electionId, 'closing');
                                        message.success("Đã bắt đầu bế mạc");
                                        onRefresh?.();
                                    } catch (error: any) {
                                        message.error(error?.response?.data?.message || "Không thể bắt đầu bế mạc");
                                    }
                                }}
                            >
                                BẮT ĐẦU BẾ MẠC
                            </Button>
                        )}
                        {closingActive && !closingCompleted && (
                            <Button
                                block
                                className="end-vote-btn"
                                icon={<FlagOutlined />}
                                disabled={isMeetingCompleted}
                                onClick={() => {
                                    Modal.confirm({
                                        title: "Xác nhận kết thúc bế mạc",
                                        content: "Bạn có chắc chắn muốn kết thúc bế mạc?",
                                        okText: "Xác nhận",
                                        cancelText: "Hủy",
                                        onOk: async () => {
                                            if (!electionId) {
                                                message.error("Không tìm thấy thông tin cuộc bầu cử");
                                                return;
                                            }
                                            try {
                                                await ElectionService.endStage(electionId, 'closing');
                                                message.success("Đã kết thúc bế mạc");
                                                onRefresh?.();
                                            } catch (error: any) {
                                                console.error("Error ending closing stage:", error);
                                                message.error(error?.response?.data?.message || "Không thể kết thúc bế mạc");
                                            }
                                        },
                                    });
                                }}
                            >
                                KẾT THÚC BẾ MẠC
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventStageControl;
