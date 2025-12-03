import React, { useEffect, useState, useCallback, useRef } from "react";
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
    const meetingStatus = meeting?.status || "PENDING";
    const isMeetingStarted = meetingStatus !== "PENDING";
    const isMeetingCompleted = meetingStatus === "COMPLETED";

    const timeline = election?.timeline || {};
    const stages = election?.stages || {};

    const checkinStarted = !!timeline.checkinAt;
    const checkinCompleted = stages.checkin === 'COMPLETED';
    const checkinActive = checkinStarted && !checkinCompleted;
    const canStartCheckin = isMeetingStarted && !checkinStarted && !checkinCompleted;

    const reportStarted = !!timeline.reportAt;
    const reportCompleted = stages.report === 'COMPLETED';
    const reportActive = reportStarted && !reportCompleted;
    const canStartReport = isMeetingStarted && checkinCompleted && !reportStarted && !reportCompleted;

    const votingStarted = !!timeline.votingAt;
    const votingCompleted = stages.voting === 'COMPLETED';
    const votingActive = votingStarted && !votingCompleted;
    const canStartVoting = isMeetingStarted && reportCompleted && !votingStarted && !votingCompleted;

    const [votingTimeLeft, setVotingTimeLeft] = useState<string>("--:--:--");
    const [votingTimeLeftSeconds, setVotingTimeLeftSeconds] = useState<number>(0);
    const [autoEndTriggered, setAutoEndTriggered] = useState<boolean>(false);
    const votingEndTimeRef = useRef<number | null>(null);

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

    // helper: chuẩn hoá config value -> minutes (1..1440)
    const normalizeVoteDurationMinutes = (configValue: any, defaultMinutes = 30): number => {
        if (configValue == null) return defaultMinutes;

        let rawNumber: number | null = null;

        if (typeof configValue === 'number') {
            rawNumber = configValue;
        } else if (typeof configValue === 'string') {
            const p = parseFloat(configValue);
            rawNumber = isNaN(p) ? null : p;
        } else if (typeof configValue === 'object' && configValue !== null) {
            if (typeof configValue.value === 'number') rawNumber = configValue.value;
            else if (typeof configValue.minutes === 'number') rawNumber = configValue.minutes;
            else if (typeof configValue.amount === 'number') rawNumber = configValue.amount;
            else if (typeof configValue.total === 'number') rawNumber = configValue.total;
            else {
                const first = Object.values(configValue)[0];
                if (typeof first === 'number') rawNumber = first;
                else if (typeof first === 'string') {
                    const p = parseFloat(first as string);
                    rawNumber = isNaN(p) ? null : p;
                }
            }
        }

        if (rawNumber == null) return defaultMinutes;

        // Detect units robustly:
        // - If value is very large (> 86400) assume milliseconds -> convert to minutes
        // - Else if value between 1000 and 86400 assume seconds -> convert to minutes
        // - Else treat as minutes
        if (rawNumber > 86400) {
            // milliseconds -> minutes
            rawNumber = rawNumber / 60000;
        } else if (rawNumber >= 1000 && rawNumber <= 86400) {
            // seconds -> minutes
            rawNumber = rawNumber / 60;
        }

        const minutes = Math.max(1, Math.min(Math.round(rawNumber), 1440));
        return minutes;
    };

    const calculateTimeRemaining = useCallback(async (): Promise<number> => {
        if (!votingActive || votingCompleted || !timeline.votingAt) {
            return 0;
        }

        try {
            const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
            const config: any = configResponse?.data || configResponse;
            const configValue = (config?.data?.configValue !== undefined)
                ? config.data.configValue
                : config?.configValue;

            // Sử dụng hàm chuẩn hoá
            const voteDurationMinutes = normalizeVoteDurationMinutes(configValue, 30);
            const voteDurationSeconds = voteDurationMinutes * 60;

            if (voteDurationSeconds <= 0) {
                return 0;
            }

            const votingStartTime = new Date(timeline.votingAt).getTime();
            const now = new Date().getTime();

            if (votingStartTime > now) {
                return voteDurationSeconds;
            }

            const votingEndTime = votingStartTime + (voteDurationSeconds * 1000);
            const timeRemaining = votingEndTime - now;

            if (timeRemaining > 0) {
                return Math.floor(timeRemaining / 1000);
            } else {
                return 0;
            }
        } catch (error: any) {
            console.error("Error calculating time remaining:", error);
            return 0;
        }
    }, [votingActive, votingCompleted, timeline.votingAt]);

    useEffect(() => {
        const loadVotingTimer = async () => {
            if (!votingActive || votingCompleted || !timeline.votingAt) {
                setVotingTimeLeft("--:--:--");
                setVotingTimeLeftSeconds(0);
                setAutoEndTriggered(false);
                votingEndTimeRef.current = null;
                // clear persisted end time when not active
                try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
                return;
            }

            try {
                const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
                const config: any = configResponse?.data || configResponse;
                const configValue = (config?.data?.configValue !== undefined)
                    ? config.data.configValue
                    : config?.configValue;

                // Dùng hàm chuẩn hoá để lấy minutes nhất quán
                const voteDurationMinutes = normalizeVoteDurationMinutes(configValue, 30);

                const voteDurationSeconds = voteDurationMinutes * 60;

                if (voteDurationSeconds <= 0) {
                    setVotingTimeLeftSeconds(0);
                    setVotingTimeLeft("00:00:00");
                    votingEndTimeRef.current = null;
                    try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
                    return;
                }

                const votingStartTime = new Date(timeline.votingAt).getTime();
                const votingEndTime = votingStartTime + (voteDurationSeconds * 1000);
                const now = Date.now();

                const storageKey = `voting_end_time_${electionId || 'global'}`;
                // Nếu voting chưa bắt đầu (votingStartTime > now),
                // ưu tiên tiếp tục countdown đã lưu (nếu có), ngược lại tạo mới countdown bắt đầu từ now.
                if (votingStartTime > now) {
                    let storedEnd: number | null = null;
                    try {
                        const raw = sessionStorage.getItem(storageKey);
                        storedEnd = raw ? Number(raw) : null;
                        if (storedEnd && isNaN(storedEnd)) storedEnd = null;
                    } catch (e) {
                        storedEnd = null;
                    }

                    if (storedEnd && storedEnd > now) {
                        // tiếp tục từ end time đã lưu
                        votingEndTimeRef.current = storedEnd;
                        const secondsLeft = Math.max(0, Math.floor((storedEnd - now) / 1000));
                        setVotingTimeLeftSeconds(secondsLeft);
                        setVotingTimeLeft(formatSecondsToClock(secondsLeft));
                        setAutoEndTriggered(false);
                        return;
                    } else {
                        // không có lưu, bắt đầu countdown mới từ now và lưu end time
                        const end = now + (voteDurationSeconds * 1000);
                        votingEndTimeRef.current = end;
                        try { sessionStorage.setItem(storageKey, String(end)); } catch {}
                        setVotingTimeLeftSeconds(voteDurationSeconds);
                        setVotingTimeLeft(formatSecondsToClock(voteDurationSeconds));
                        setAutoEndTriggered(false);
                        return;
                    }
                }
                // voting đã thực sự bắt đầu theo timeline -> clear persisted pre-start key
                try { sessionStorage.removeItem(storageKey); } catch {}
                votingEndTimeRef.current = votingEndTime;

                if (now >= votingEndTime) {
                    setVotingTimeLeftSeconds(0);
                    setVotingTimeLeft("00:00:00");
                    votingEndTimeRef.current = null;
                    try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
                } else {
                    const secondsLeft = Math.floor((votingEndTime - now) / 1000);
                    setVotingTimeLeftSeconds(secondsLeft);
                    setVotingTimeLeft(formatSecondsToClock(secondsLeft));
                    setAutoEndTriggered(false);
                }
            } catch (error: any) {
                console.error("Error loading voting timer:", error);
                setVotingTimeLeft("--:--:--");
                setVotingTimeLeftSeconds(0);
                votingEndTimeRef.current = null;
                try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
            }
        };

        loadVotingTimer();
    }, [votingActive, votingCompleted, timeline.votingAt, electionId]);

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

    // Timer đếm ngược mỗi giây - tính lại từ thời gian thực (không fetch config)
    useEffect(() => {
        if (votingCompleted || !votingActive || !timeline.votingAt) {
            if (votingTimeLeftSeconds <= 0 && votingActive) {
                setVotingTimeLeft("00:00:00");
            }
            return;
        }

        // Tính toán lại thời gian còn lại từ votingEndTime ref (nhanh hơn, không cần fetch)
        const updateTimer = () => {
            if (!votingEndTimeRef.current) {
                return;
            }

            const now = Date.now();
            const votingEndTime = votingEndTimeRef.current;

            if (now >= votingEndTime) {
                setVotingTimeLeftSeconds(0);
                setVotingTimeLeft("00:00:00");
                votingEndTimeRef.current = null;
            } else {
                const secondsLeft = Math.floor((votingEndTime - now) / 1000);
                setVotingTimeLeftSeconds(secondsLeft);
                setVotingTimeLeft(formatSecondsToClock(secondsLeft));
            }
        };

        // Cập nhật ngay lập tức nếu đã có votingEndTime
        if (votingEndTimeRef.current) {
            updateTimer();
        }

        // Thiết lập interval để cập nhật mỗi giây
        const interval = setInterval(updateTimer, 1000);

        // Xử lý khi tab trở nên visible (tính lại thời gian khi quay lại tab)
        const handleVisibilityChange = () => {
            if (!document.hidden && votingEndTimeRef.current) {
                // Tab đã trở nên visible, tính lại thời gian
                updateTimer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [votingActive, votingCompleted, timeline.votingAt]);

    // Reset autoEndTriggered khi voting completed
    useEffect(() => {
        if (votingCompleted) {
            setAutoEndTriggered(false);
            try { sessionStorage.removeItem(`voting_end_time_${electionId || 'global'}`); } catch {}
        }
    }, [votingCompleted, electionId]);

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
