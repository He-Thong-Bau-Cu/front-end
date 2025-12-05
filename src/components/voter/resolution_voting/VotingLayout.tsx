import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import ElectionService from "@/services/ElectionService";
import SystemConfigService from "@/services/SystemConfigService";
import { Election } from "@/types/Election.interface";
import {
  FileTextOutlined
} from "@ant-design/icons";
import { Col, Row, Typography } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../style/voter/ResolutionVoting.model.css";
import CountdownCard from "./CountdownCard";
import ResolutionContent from "./ResolutionContent";
import { SOCKET_URL } from "@/config/socket";

const { Title } = Typography;

const VotingLayout: React.FC = () => {
  const location = useLocation();
  const ballotId = location.state?.ballotId;
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const electionId = localStorage.getItem("currentElectionId") || "";
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [canVote, setCanVote] = useState(false);
  const [isVotingCompleted, setIsVotingCompleted] = useState(false);
  const [votingEndAt, setVotingEndAt] = useState<number | null>(null);
  const [stageInfo, setStageInfo] = useState<{ currentStage: string; stageStatus: string; message?: string } | null>(null);
  const lastTickRef = useRef<number | null>(null);
  const votingStartTimeRef = useRef<number | null>(null);
  const voteDurationSecondsRef = useRef<number>(0);
  const votingEndTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchElection = async () => {
      try {
        const data = await ElectionService.getElectionId(electionId);
        setElection(data);
      } catch (err) {
        console.error("Fetch election failed:", err);
      }
    };

    fetchElection();
  }, [electionId]);


  const calculateCurrentStage = useCallback((timeline: any = {}, stages: any = {}) => {
    let currentStage = 'not_started';
    let stageStartedAt: Date | null = null;
    let stageStatus = 'NOT_STARTED';

    if (timeline.checkinAt && stages.checkin !== 'COMPLETED') {
      currentStage = 'checkin';
      stageStartedAt = timeline.checkinAt ?? null;
      stageStatus = 'STARTED';
    } else if (stages.checkin === 'COMPLETED' && timeline.reportAt && stages.report !== 'COMPLETED') {
      currentStage = 'report';
      stageStartedAt = timeline.reportAt ?? null;
      stageStatus = 'STARTED';
    } else if (stages.report === 'COMPLETED' && timeline.votingAt && stages.voting !== 'COMPLETED') {
      currentStage = 'voting';
      stageStartedAt = timeline.votingAt ?? null;
      stageStatus = 'STARTED';
    } else if (stages.voting === 'COMPLETED' && timeline.resultAnnouncedAt && stages.result !== 'COMPLETED') {
      currentStage = 'result';
      stageStartedAt = timeline.resultAnnouncedAt ?? null;
      stageStatus = 'STARTED';
    } else if (stages.result === 'COMPLETED' && timeline.closingAt && stages.closing !== 'COMPLETED') {
      currentStage = 'closing';
      stageStartedAt = timeline.closingAt ?? null;
      stageStatus = 'STARTED';
    } else if (stages.closing === 'COMPLETED') {
      currentStage = 'completed';
      stageStartedAt = timeline.closingAt ?? null;
      stageStatus = 'COMPLETED';
    } else if (timeline.checkinAt) {
      if (stages.closing === 'COMPLETED') {
        currentStage = 'completed';
        stageStartedAt = timeline.closingAt ?? null;
        stageStatus = 'COMPLETED';
      } else if (stages.result === 'COMPLETED') {
        currentStage = 'result';
        stageStartedAt = timeline.resultAnnouncedAt ?? null;
        stageStatus = 'COMPLETED';
      } else if (stages.voting === 'COMPLETED') {
        currentStage = 'voting';
        stageStartedAt = timeline.votingAt ?? null;
        stageStatus = 'COMPLETED';
      } else if (stages.report === 'COMPLETED') {
        currentStage = 'report';
        stageStartedAt = timeline.reportAt ?? null;
        stageStatus = 'COMPLETED';
      } else if (stages.checkin === 'COMPLETED') {
        currentStage = 'checkin';
        stageStartedAt = timeline.checkinAt ?? null;
        stageStatus = 'COMPLETED';
      }
    }

    return { currentStage, stageStartedAt, stageStatus, timeline, stages };
  }, []);

  const normalizeVoteDurationMinutes = (configValue: any, defaultMinutes = 30): number => {
    const raw =
      typeof configValue === "object" && configValue?.value !== undefined
        ? configValue.value
        : configValue;

    const parsed = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    if (Number.isNaN(parsed)) return defaultMinutes;

    return Math.min(Math.max(parsed, 1), 24 * 60);
  };

  const updateStageState = useCallback((timeline: any = {}, stages: any = {}) => {
    const stageData = calculateCurrentStage(timeline, stages);
    const isActive = stageData.currentStage === 'voting' && stageData.stageStatus === 'STARTED';

    let message = '';
    if (!isActive) {
      if (stageData.currentStage === 'not_started' || stageData.currentStage === 'checkin' || stageData.currentStage === 'report') {
        message = 'Chưa đến giai đoạn bỏ phiếu.';
      } else if (stageData.currentStage === 'result' || stageData.currentStage === 'completed' || stages.voting === 'COMPLETED') {
        message = 'Giai đoạn bỏ phiếu đã kết thúc.';
      }
    }

    setCanVote(isActive);
    setStageInfo({ ...stageData, message });
  }, [calculateCurrentStage]);

  const loadStageAndTimer = useCallback(async () => {
    try {
      if (!electionId) return;
      const stageResponse = await ElectionService.getCurrentStage(electionId);
      const stagePayload = stageResponse?.data?.data ?? stageResponse?.data ?? stageResponse ?? {};
      const timeline = stagePayload.timeline || {};
      const stages = stagePayload.stages || {};
      const electionData = stagePayload.election || {};
      updateStageState(timeline, stages);
      const votingCompleted = stages.voting === "COMPLETED";
      setIsVotingCompleted(votingCompleted);
      if (votingCompleted || !timeline.votingAt) {
        setTimeLeftSeconds(0);
        setVotingEndAt(null);
        votingStartTimeRef.current = null;
        voteDurationSecondsRef.current = 0;
        votingEndTimeRef.current = null;
        return;
      }

      let seconds = 0;
      try {
        const configResponse = await SystemConfigService.getByKey("TIME_VOTE_ELECTION");
        const config: any = configResponse?.data || configResponse;
        const configValue =
          config?.data?.configValue !== undefined ? config.data.configValue : config?.configValue;
        const voteDurationMinutes = normalizeVoteDurationMinutes(configValue, 30);
        const voteDurationSeconds = voteDurationMinutes * 60;

        if (voteDurationSeconds > 0) {
          // votingAt được lưu UTC, cần trừ 7h để về giờ VN
          const votingStartTime = new Date(timeline.votingAt).getTime() - 7 * 60 * 60 * 1000;
          votingStartTimeRef.current = votingStartTime;
          voteDurationSecondsRef.current = voteDurationSeconds;

          const votingEndFromTimeline = votingStartTime + voteDurationSeconds * 1000;
          const now = Date.now();

          votingEndTimeRef.current = votingEndFromTimeline;
          setVotingEndAt(votingEndFromTimeline);

          if (votingStartTime > now) {
            // Voting chưa bắt đầu: hiển thị đủ thời lượng
            seconds = voteDurationSeconds;
          } else if (votingEndFromTimeline > now) {
            seconds = Math.floor((votingEndFromTimeline - now) / 1000);
          } else {
            seconds = 0;
          }
        } else {
          votingStartTimeRef.current = null;
          voteDurationSecondsRef.current = 0;
          votingEndTimeRef.current = null;
          setVotingEndAt(null);
        }
      } catch (error: any) {
        if (electionData?.endDate) {
          const endTime = new Date(electionData.endDate).getTime();
          const now = Date.now();
          if (endTime > now) {
            seconds = Math.floor((endTime - now) / 1000);
          }
        }
      }

      setTimeLeftSeconds(Math.max(seconds, 0));
    } catch (err) {
      console.error("loadVotingTime error:", err);
    }
  }, [electionId, updateStageState]);

  const lockBallot = useCallback(async () => {
    if (!ballotId) return;
    const ballot = await BallotService.getBallotById(ballotId);
    if (!ballot || ballot.status !== "ACTIVE") return;

    showLoading();
    try {
      await BallotService.updateBallot(ballotId, {
        electionId: localStorage.getItem("currentElectionId"),
        voterId: localStorage.getItem("voterId"),
        status: "NOT_CAST",
      });
      notify("Phiếu bầu đã bị khóa do hết thời gian!", "error");
      navigate("/voter/ballots");
    } catch (error: any) {
      notify("Khóa phiếu bầu không thành công", "error");
    } finally {
      hideLoading();
    }
  }, [ballotId, hideLoading, navigate, notify, showLoading]);

  useEffect(() => {
    loadStageAndTimer();
  }, [loadStageAndTimer]);

  useEffect(() => {
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => {
      socket.emit("join", electionId);
    });

    socket.on("transferData", (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended" || data.type === "ballot-cast") {
        loadStageAndTimer();
      }
    });

    socket.on("transferStateDataRT", (data: any) => {
      if (data.type === "meeting-status-changed" && data.payload?.election) {
        const election = data.payload.election;
        updateStageState(election.timeline || {}, election.stages || {});
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [electionId, loadStageAndTimer, updateStageState]);

  useEffect(() => {
    if (isVotingCompleted || !votingEndTimeRef.current) return;
    const updateTimer = () => {
      if (!votingEndTimeRef.current) return;
      const now = Date.now();
      const end = votingEndTimeRef.current;
      if (now >= end) {
        setTimeLeftSeconds(0);
        votingEndTimeRef.current = null;
      } else {
        const secondsLeft = Math.floor((end - now) / 1000);
        setTimeLeftSeconds(secondsLeft);
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
  }, [isVotingCompleted, timeLeftSeconds]);

  useEffect(() => {
    if (!canVote) {
      lastTickRef.current = timeLeftSeconds;
      return;
    }

    const prev = lastTickRef.current;
    if (prev !== null && prev > 0 && timeLeftSeconds === 0) {
      lockBallot();
    }
    lastTickRef.current = timeLeftSeconds;
  }, [timeLeftSeconds, canVote, lockBallot]);

  const hours = timeLeftSeconds > 0 ? Math.floor(timeLeftSeconds / 3600) : 0;
  const minutes = timeLeftSeconds > 0 ? Math.floor((timeLeftSeconds % 3600) / 60) : 0;
  const seconds = timeLeftSeconds > 0 ? (timeLeftSeconds % 60) : 0;
  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = minutes.toString().padStart(2, "0");
  const formattedSeconds = seconds.toString().padStart(2, "0");
  const isVotingWindow = canVote && timeLeftSeconds > 0;



  return (
    <div className="resolution-page">
      {/* ===== HEADER ===== */}
      <div
        className="resolution-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* LEFT SIDE */}
        <div>
          <Title
            level={3}
            className="header-title"
            style={{
              margin: 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {election?.title}
          </Title>

          <div className="header-meta" style={{ marginTop: 10 }}>
            <span className="meta-item">
              <FileTextOutlined className="meta-icon" />
              <span>
                Nghị quyết: <b>{election?.decisionNumber}</b>
              </span>
            </span>
          </div>
        </div>

        {/* RIGHT — BADGE */}
        <div className="status-pill">
          <span className="pill-dot" />
          Đang diễn ra
        </div>
      </div>


      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <ResolutionContent isVotingWindow={isVotingWindow} stageMessage={stageInfo?.message} />
        </Col>
        <Col xs={24} lg={8}>
          <CountdownCard hours={formattedHours} minutes={formattedMinutes} seconds={formattedSeconds} />
        </Col>
      </Row>
      {/* ===== NỘI DUNG & COUNTDOWN ===== */}

    </div>
  );
};

export default VotingLayout;
