import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Col, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import "../../../style/voter/ResolutionVoting.model.css";
import CountdownCard from "./CountdownCard";
import ResolutionContent from "./ResolutionContent";
import BallotService from "@/services/BallotService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { useLocation, useNavigate } from "react-router-dom";

const { Title } = Typography;

const VotingLayout: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(0);
  const location = useLocation();
  const ballotId = location.state?.ballotId;
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const navigate = useNavigate();


  // ==========================
  // 🔥 FIX CỨNG 100% DỮ LIỆU
  // ==========================
  const resolutionTitle = "Biểu quyết Nghị quyết 01/2025";
  const resolutionCode = "01/2025/NQ-HĐQT";
  const resolutionDate = "21/11/2025";
  const statusText = "Đang diễn ra";

  useEffect(() => {
    const checkBallot = async () => {
      try {
        const data = await BallotService.getBallotById(ballotId);
        if (!data) return;

        if (data.status === "ACTIVE") {
          const end = localStorage.getItem("voteCountdownEnd");

          if (!end) {
            const newEnd = Date.now() + 10 * 60 * 1000;
            localStorage.setItem("voteCountdownEnd", newEnd.toString());
            setTimeLeft(10 * 60);
          } else {
            const left = Number(end) - Date.now();
            setTimeLeft(Math.max(Math.floor(left / 1000), 0));
          }
        }
      } catch (err) {
        console.error("Ballot check failed:", err);
      }
    };

    checkBallot();
  }, []);


  // 🔥 Countdown chạy mỗi giây
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);


  // 🔥 Lock khi hết giờ thật sự
  useEffect(() => {
    const endTime = localStorage.getItem("voteCountdownEnd");
    if (!endTime) return;

    if (Date.now() < Number(endTime)) return;

    if (timeLeft !== 0) return;

    const lock = async () => {
      try {
        const ballot = await BallotService.getBallotById(ballotId);
        if (!ballot || ballot.status !== "ACTIVE") return;

        showLoading();
        await BallotService.updateBallot(ballotId, { status: "LOCKED" });

        notify("Phiếu bầu đã bị khóa do hết thời gian!", "warning");

        localStorage.removeItem("voteCountdownEnd");
        navigate("/voter/ballots");
      } finally {
        hideLoading();
      }
    };

    lock();
  }, [timeLeft]);





  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, "0");



  return (
    <div className="resolution-page">
      {/* ===== HEADER ===== */}
      <div className="resolution-header">
        <div className="header-left">
          <Title level={3} className="header-title">
            {resolutionTitle}
          </Title>

          <div className="header-meta">
            <span className="meta-item">
              <FileTextOutlined className="meta-icon" />
              <span>
                Nghị quyết số: <b>{resolutionCode}</b>
              </span>
            </span>

            <span className="meta-item">
              <ClockCircleOutlined className="meta-icon" />
              <span>
                Thời gian: <b>{resolutionDate}</b>
              </span>
            </span>
          </div>
        </div>

        <div className="status-pill">
          <CheckCircleOutlined />
          <span>{statusText}</span>
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
