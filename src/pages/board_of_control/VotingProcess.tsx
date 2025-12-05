import { useCallback, useEffect, useState } from "react";
import { Col, Row } from "antd";
import CountdownControl from "../../components/board_of_control/voting_process/CountdownControl";
import LiveResult from "../../components/board_of_control/voting_process/LiveResult";
import SummaryStats from "../../components/board_of_control/voting_process/SummaryStats";
import "../../style/head-of-the-organizing-committee/VotingDashboard.model.css";
import { SummaryData } from "../../types/VottingProcess.interface";
import BoardControlService from "@/services/BoardControlService";
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
  const [stats, setStats] = useState<SummaryData>(defaultStats);

  const loadOverview = useCallback(async () => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      showLoading();
      const response = await BoardControlService.getVotingOverview(electionId);
      if (response.success && response.data) {
        const data = response.data;
        setStats(data.summary || defaultStats);
        const timeLeftSeconds = data.timer?.timeLeftSeconds || 0;
        setTimeLeft(formatSecondsToClock(timeLeftSeconds));
      } else {
        notify(response.message || "Không thể tải dữ liệu giám sát", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể tải dữ liệu giám sát", "error");
    } finally {
      hideLoading();
    }
  }, [hideLoading, notify, showLoading]);

  useEffect(() => {
    loadOverview();
    const interval = setInterval(loadOverview, 5000);
    return () => clearInterval(interval);
  }, [loadOverview]);

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => socket.emit("join", electionId));

    const handleRealtimeUpdate = (data: any) => {
      if (data.type === "ballot-cast" || data.type === "stage-started" || data.type === "stage-ended") {
        loadOverview();
      }
    };

    socket.on("transferData", handleRealtimeUpdate);

    return () => {
      socket.off("transferData", handleRealtimeUpdate);
      socket.disconnect();
    };
  }, [loadOverview]);

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
