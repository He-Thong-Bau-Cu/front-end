import { useCallback, useEffect, useRef, useState } from "react";
import { Col, Row } from "antd";
import CountdownControl from "../../components/board_of_control/voting_process/CountdownControl";
import LiveResult from "../../components/board_of_control/voting_process/LiveResult";
import SummaryStats from "../../components/board_of_control/voting_process/SummaryStats";
import "../../style/head-of-the-organizing-committee/VotingDashboard.model.css";
import { SummaryData } from "../../types/VottingProcess.interface";
import BoardControlService from "@/services/BoardControlService";
import SystemConfigService from "@/services/SystemConfigService";
import ElectionService from "@/services/ElectionService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatSecondsToClock } from "@/utils/format";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";

const defaultStats: SummaryData = {
  percent: 0,
  voted: 0,
  total: 0,
  validVotes: 0,
  speed: 0,
};

export default function VotingProcess() {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [stats, setStats] = useState<SummaryData>(defaultStats);
  const votingEndTimeRef = useRef<number | null>(null);

  const normalizeVoteDurationMinutes = (configValue: any, defaultMinutes = 30): number => {
    const raw =
      typeof configValue === "object" && configValue?.value !== undefined
        ? configValue.value
        : configValue;
    const parsed = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (Number.isNaN(parsed)) return defaultMinutes;
    return Math.min(Math.max(parsed, 1), 24 * 60);
  };

  const loadOverview = useCallback(async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      showLoading();

      // Lấy timeline để tính countdown giống các màn voter/meeting
      let seconds = 0;
      try {
        const stageResponse = await ElectionService.getCurrentStage(electionId);
        const stagePayload = stageResponse?.data?.data ?? stageResponse?.data ?? stageResponse ?? {};
        const timeline = stagePayload.timeline || {};
        const stages = stagePayload.stages || {};
        const votingCompleted = stages.voting === "COMPLETED";

        if (votingCompleted || !timeline.votingAt) {
          votingEndTimeRef.current = null;
          seconds = 0;
        } else {
          const configResponse = await SystemConfigService.getByKey("TIME_VOTE_ELECTION");
          const config: any = configResponse?.data || configResponse;
          const configValue =
            config?.data?.configValue !== undefined ? config.data.configValue : config?.configValue;
          const voteDurationMinutes = normalizeVoteDurationMinutes(configValue, 30);
          const voteDurationSeconds = voteDurationMinutes * 60;

          if (voteDurationSeconds > 0) {
            // votingAt lưu UTC -> trừ 7h để về giờ VN
            const votingStartTime = new Date(timeline.votingAt).getTime() - 7 * 60 * 60 * 1000;
            const votingEnd = votingStartTime + voteDurationSeconds * 1000;
            const now = Date.now();

            votingEndTimeRef.current = votingEnd;
            if (votingStartTime > now) {
              seconds = voteDurationSeconds;
            } else if (votingEnd > now) {
              seconds = Math.floor((votingEnd - now) / 1000);
            } else {
              seconds = 0;
            }
          } else {
            votingEndTimeRef.current = null;
          }
        }
      } catch (err) {
        console.error("Không tính được countdown từ timeline:", err);
        votingEndTimeRef.current = null;
      }

      const response = await BoardControlService.getVotingOverview(electionId);
      if (response.success && response.data) {
        const data = response.data;
        setStats(data.summary || defaultStats);
        // Ưu tiên countdown tính từ timeline; fallback overview timer nếu seconds = 0 nhưng timer có
        const overviewSeconds = data.timer?.timeLeftSeconds || 0;
        const finalSeconds = seconds > 0 ? seconds : overviewSeconds;
        setTimeLeftSeconds(Math.max(finalSeconds, 0));
        setTimeLeft(formatSecondsToClock(finalSeconds));
      } else {
        notify(response.message || "Không thể tải dữ liệu giám sát", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể tải dữ liệu giám sát", "error");
    } finally {
      hideLoading();
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, []);

  // Tick mỗi giây dựa vào votingEndTimeRef (nếu có)
  useEffect(() => {
    if (!votingEndTimeRef.current) return;
    const updateTimer = () => {
      if (!votingEndTimeRef.current) return;
      const now = Date.now();
      const end = votingEndTimeRef.current;
      if (now >= end) {
        setTimeLeftSeconds(0);
        setTimeLeft("00:00:00");
        votingEndTimeRef.current = null;
      } else {
        const secs = Math.floor((end - now) / 1000);
        setTimeLeftSeconds(secs);
        setTimeLeft(formatSecondsToClock(secs));
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    const handleVisibilityChange = () => {
      if (!document.hidden) updateTimer();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [timeLeftSeconds]);

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => socket.emit("join", electionId));

    const handleRealtimeUpdate = (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended") {
        loadOverview();
      }
    };

    socket.on("transferData", handleRealtimeUpdate);

    return () => {
      socket.off("transferData", handleRealtimeUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="vd-page">
      <Row gutter={[20, 20]} align="stretch">
        <Col xs={24} lg={12} style={{ display: "flex" }}>
          <CountdownControl timeLeft={timeLeft} />
        </Col>

        <Col xs={24} lg={12} style={{ display: "flex" }}>
          <SummaryStats stats={stats} />
        </Col>
      </Row>

      <Row style={{ marginTop: 20 }}>
        <Col span={24}>
          <LiveResult />
        </Col>
      </Row>
    </div>
  );
}
