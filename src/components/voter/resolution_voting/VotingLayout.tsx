import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import ElectionService from "@/services/ElectionService";
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
import BoardControlService from "@/services/BoardControlService";
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
  const [stageInfo, setStageInfo] = useState<{ currentStage: string; stageStatus: string; message?: string } | null>(null);
  const lastTickRef = useRef<number | null>(null);

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
      updateStageState(timeline, stages);

      const overviewRes: any = await BoardControlService.getVotingOverview(electionId);
      const overview = overviewRes?.data || overviewRes;
      const seconds = overview?.data?.timer?.timeLeftSeconds ?? overview?.timer?.timeLeftSeconds ?? 0;
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
    if (!canVote || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [canVote, timeLeftSeconds]);

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

  const minutes = timeLeftSeconds > 0 ? Math.floor(timeLeftSeconds / 60) : 0;
  const seconds = timeLeftSeconds > 0 ? (timeLeftSeconds % 60).toString().padStart(2, "0") : "00";
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
          <CountdownCard minutes={minutes} seconds={seconds} />
        </Col>
      </Row>
      {/* ===== NỘI DUNG & COUNTDOWN ===== */}

    </div>
  );
};

export default VotingLayout;
