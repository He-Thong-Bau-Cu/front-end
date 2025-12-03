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
import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../../style/voter/ResolutionVoting.model.css";
import CountdownCard from "./CountdownCard";
import ResolutionContent from "./ResolutionContent";

const { Title } = Typography;

const VotingLayout: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoadingTime, setIsLoadingTime] = useState(true);
  const location = useLocation();
  const ballotId = location.state?.ballotId;
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();
  const [election, setElection] = useState<Election | null>(null);
  const electionId = localStorage.getItem("currentElectionId") || "";
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
  }, []);

  useEffect(() => {
    const loadVotingTime = async () => {
      setIsLoadingTime(true);
      try {
        const data = await BallotService.getBallotById(ballotId);
        if (!data) {
          setIsLoadingTime(false);
          return;
        }

        if (data.status !== "ACTIVE") {
          setTimeLeft(0);
          setIsLoadingTime(false);
          return;
        }

        // Load thời gian từ server thay vì chỉ dựa vào localStorage
        const electionId = localStorage.getItem("currentElectionId");
        if (!electionId) {
          setIsLoadingTime(false);
          return;
        }

        const res = await ElectionService.getCurrentStage(electionId);
        const stage = res.data.data || res.data;
        if (!stage) {
          setIsLoadingTime(false);
          return;
        }

        const votingStage = stage.stages?.voting;
        const votingAt = stage.timeline?.votingAt;
        const resultAnnouncedAt = stage.timeline?.resultAnnouncedAt;

        if (!votingAt) {
          setTimeLeft(0);
          setIsLoadingTime(false);
          return;
        }

        // Nếu đã COMPLETED hoặc đã có kết quả → khóa phiếu
        if (votingStage !== "STARTED" || resultAnnouncedAt) {
          setTimeLeft(0);
          localStorage.removeItem("voteCountdownEnd");
          votingEndTimeRef.current = null;
          setIsLoadingTime(false);
          return;
        }

        try {
          // Lấy config TIME_VOTE_ELECTION (thời gian bầu cử tính bằng phút)
          const configResponse = await SystemConfigService.getByKey('TIME_VOTE_ELECTION');
          const config: any = configResponse?.data || configResponse;
          const configValue = (config?.data?.configValue !== undefined)
            ? config.data.configValue
            : config?.configValue;
          const timeVoteElection = (typeof configValue === 'object' && configValue?.value !== undefined)
            ? configValue.value
            : (typeof configValue === 'number' ? configValue : 0);
          const voteDurationMinutes = typeof timeVoteElection === 'number' ? timeVoteElection : parseInt(String(timeVoteElection)) || 30;
          const voteDurationSeconds = voteDurationMinutes * 60;

          const votingStartTime = new Date(votingAt).getTime();
          const votingEndTime = votingStartTime + (voteDurationSeconds * 1000);
          const now = Date.now();

          if (now < votingStartTime) {
            setTimeLeft(0);
            votingEndTimeRef.current = null;
            setIsLoadingTime(false);
            return;
          }

          if (now >= votingEndTime) {
            setTimeLeft(0);
            localStorage.removeItem("voteCountdownEnd");
            votingEndTimeRef.current = null;
            setIsLoadingTime(false);
            return;
          }

          const secondsLeft = Math.floor((votingEndTime - now) / 1000);
          setTimeLeft(Math.max(secondsLeft, 0));

          // Lưu votingEndTime vào ref để tính toán lại chính xác
          votingEndTimeRef.current = votingEndTime;

          // Cập nhật localStorage để đồng bộ
          localStorage.setItem("voteCountdownEnd", votingEndTime.toString());
        } catch (configError) {
          console.error("Error loading TIME_VOTE_ELECTION config:", configError);
          // Fallback về 30 phút nếu không load được config
          const votingStartTime = new Date(votingAt).getTime();
          const votingEndTime = votingStartTime + (30 * 60 * 1000);
          const now = Date.now();
          if (now >= votingEndTime) {
            setTimeLeft(0);
            votingEndTimeRef.current = null;
          } else {
            const secondsLeft = Math.floor((votingEndTime - now) / 1000);
            setTimeLeft(Math.max(secondsLeft, 0));
            votingEndTimeRef.current = votingEndTime;
            localStorage.setItem("voteCountdownEnd", votingEndTime.toString());
          }
        }
      } catch (err) {
        console.error("Failed to load voting time:", err);
      } finally {
        setIsLoadingTime(false);
      }
    };

    loadVotingTime();
  }, [ballotId]);



  // 🔥 Countdown chạy mỗi giây - tính toán lại từ thời gian thực
  useEffect(() => {
    const timer = setInterval(() => {
      // Chỉ update nếu đã có votingEndTime
      if (!votingEndTimeRef.current) {
        return;
      }

      const now = Date.now();
      const votingEndTime = votingEndTimeRef.current;

      if (now >= votingEndTime) {
        setTimeLeft(0);
        votingEndTimeRef.current = null;
        return;
      }

      // Tính toán lại thời gian còn lại từ thời gian thực
      const secondsLeft = Math.floor((votingEndTime - now) / 1000);
      setTimeLeft(Math.max(secondsLeft, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []); // Chỉ chạy 1 lần khi mount


  // 🔥 Lock khi hết giờ thật sự - chỉ lock khi đã load xong và thực sự hết thời gian
  useEffect(() => {
    // Không lock trong khi đang load
    if (isLoadingTime) return;

    // Không lock nếu còn thời gian
    if (timeLeft !== 0) return;

    // Không lock nếu chưa có votingEndTime (chưa load xong)
    if (!votingEndTimeRef.current) return;

    const endTime = votingEndTimeRef.current;
    const now = Date.now();

    // Chỉ lock khi thực sự hết thời gian
    if (now < endTime) return;

    const lock = async () => {
      try {
        const ballot = await BallotService.getBallotById(ballotId);
        if (!ballot || ballot.status !== "ACTIVE") return;

        showLoading();
        await BallotService.updateBallot(ballotId, { status: "LOCKED" });

        notify("Phiếu bầu đã bị khóa do hết thời gian!", "warning");

        localStorage.removeItem("voteCountdownEnd");
        votingEndTimeRef.current = null;
        navigate("/voter/ballots");
      } finally {
        hideLoading();
      }
    };

    lock();
  }, [timeLeft, isLoadingTime, ballotId]);





  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");



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
