import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import ElectionService from "@/services/ElectionService";
import { Election } from "@/types/Election.interface";
import {
  FileTextOutlined
} from "@ant-design/icons";
import { Col, Row, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../style/voter/ResolutionVoting.model.css";
import CountdownCard from "./CountdownCard";
import ResolutionContent from "./ResolutionContent";

const { Title } = Typography;

const VotingLayout: React.FC = () => {
  const location = useLocation();
  const ballotId = location.state?.ballotId;
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const electionId = localStorage.getItem("currentElectionId") || "";
  const [timeLeft, setTimeLeft] = useState(-1);
  const isInitialLoad = useRef(true);

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


  useEffect(() => {
    const loadVotingTime = async () => {
      try {
        if (!electionId) return;

        const res = await ElectionService.getCurrentStage(electionId);
        const stage = res.data.data || res.data;
        if (!stage) return;

        const votingStage = stage.stages?.voting;
        const votingAt = stage.timeline?.votingAt;
        const resultAnnouncedAt = stage.timeline?.resultAnnouncedAt;

        if (!votingAt) return;

        if (votingStage !== "STARTED" || resultAnnouncedAt) {
          setTimeLeft(0);
          return;
        }

        const localVotingAtString = votingAt.endsWith('Z')
          ? votingAt.slice(0, -1)
          : votingAt;
        const start = new Date(localVotingAtString).getTime();

        const durationMinutes = 30;
        const end = start + durationMinutes * 60 * 1000;
        const now = Date.now();

        if (now < start) {
          setTimeLeft(-1);
          return;
        }

        if (now >= end) {
          setTimeLeft(0);
          return;
        }



        setTimeLeft(Math.floor((end - now) / 1000));
      } catch (err) {
        console.error("loadVotingTime error:", err);
      }
    };

    loadVotingTime();
  }, [electionId]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  // 🔥 Lock khi hết giờ thật sự
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (timeLeft !== 0) return;

    const lockBallot = async () => {
      const ballot = await BallotService.getBallotById(ballotId);
      if (!ballot || ballot.status !== "ACTIVE") return;

      showLoading();
      try {
        await BallotService.updateBallot(ballotId, {
          electionId: localStorage.getItem("currentElectionId"),
          voterId: localStorage.getItem("voterId"),
          status: "LOCKED",
        });
        notify("Phiếu bầu đã bị khóa do hết thời gian!", "error");
        navigate("/voter/ballots");
      } catch (error: any) {
        notify("Khóa phiếu bầu không thành công", "error");
      } finally {
        hideLoading();
      }
    };

    lockBallot();
  }, [timeLeft]);

  const minutes = timeLeft > 0 ? Math.floor(timeLeft / 60) : 0;
  const seconds = timeLeft > 0 ? (timeLeft % 60).toString().padStart(2, "0") : "00";



  return (
    <div className="resolution-page">
      {/* ===== HEADER ===== */}
      <div className="resolution-header">
        <div className="header-left">
          <Title level={3} className="header-title">
            {election?.title}
          </Title>

          <div className="header-meta">
            <span className="meta-item">
              <FileTextOutlined className="meta-icon" />
              <span>
                Nghị quyết số: <b>{election?.decisionNumber}</b>
              </span>
            </span>


          </div>
        </div>

      </div>
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <ResolutionContent />
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