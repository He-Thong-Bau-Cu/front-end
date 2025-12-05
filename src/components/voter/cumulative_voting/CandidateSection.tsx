import {
  DollarOutlined,
  InfoCircleOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import VotingRightsService from "@/services/VotingRightsService";
import CandidateCard from "./CandidateCard";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { ElectionEntities } from "@/types/ElectionEntities.interface";
import { VotingRight } from "@/types/VotingRights.interface";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import OtpModal from "../otp-ballot/OtpModal";
import CountdownCard from "../resolution_voting/CountdownCard";
import ElectionService from "@/services/ElectionService";
import BoardControlService from "@/services/BoardControlService";
import { SOCKET_URL } from "@/config/socket";

const { Title, Text } = Typography;

const CandidateSection = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [electionTitle, setElectionTitle] = useState("");
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);
  const [canVote, setCanVote] = useState(false);
  const [stageInfo, setStageInfo] = useState<{ currentStage: string; stageStatus: string; message?: string } | null>(null);
  const lastTickRef = useRef<number | null>(null);

  const [candidates, setCandidates] = useState<ElectionEntities[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const ballotId = location.state?.ballotId;

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [vote, setVote] = useState<Record<string, number>>({});


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
      const electionId = localStorage.getItem("currentElectionId");
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
      console.error("Failed to load stage/timer:", err);
    }
  }, [updateStageState]);

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
      console.error(error);
    } finally {
      hideLoading();
    }
  }, [ballotId, hideLoading, navigate, notify, showLoading]);

  useEffect(() => {
    loadStageAndTimer();
  }, [loadStageAndTimer]);

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, { transports: ["websocket"] });
    socket.on("connect", () => {
      socket.emit("join", electionId);
    });

    const handleRefresh = () => loadStageAndTimer();

    socket.on("transferData", (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended" || data.type === "ballot-cast") {
        handleRefresh();
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
  }, [loadStageAndTimer, updateStageState]);

  useEffect(() => {
    if (!canVote || timeLeftSeconds <= 0) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => Math.max(prev - 1, 0));
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



  useEffect(() => {
    const loadData = async () => {
      try {
        showLoading();
        const voterId = localStorage.getItem("voterId");
        const electionId = localStorage.getItem("currentElectionId");

        // 🔥 1. API lấy quyền bầu cử (votes)
        const votingRights: VotingRight[] =
          await VotingRightsService.getVotingRightsByVoterId(voterId!);

        // tìm quyền bầu đúng electionId
        const right = votingRights.find(
          (item) => item.electionId._id === electionId
        );

        const votes = right?.votes ?? 0;

        // set số phiếu
        setTotalVotes(votes);
        setRemainingVotes(votes);
        setElectionTitle(right?.electionId?.title ?? "");

        // 🔥 2. API lấy danh sách ứng viên
        const list = await ElectionEntitiesService.getElectionEntitiesByElectionId(
          electionId!
        );

        setCandidates(list);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);

  // Xử lý phân bổ phiếu
  const handleVoteChange = (entity: ElectionEntities, value: number) => {
    if (!isVotingWindow) return;
    let newValue = Math.max(0, Math.min(value, totalVotes)); // giới hạn 0 → total

    const newDistribution = { ...vote, [entity._id]: newValue };

    // Tổng dùng
    let totalUsed = Object.values(newDistribution).reduce((sum, v) => sum + v, 0);

    // Nếu vượt quá tổng số phiếu → cắt lại
    if (totalUsed > totalVotes) {
      const exceed = totalUsed - totalVotes;
      newValue -= exceed;
      newDistribution[entity._id] = newValue;

      totalUsed = totalVotes;
    }

    setVote(newDistribution);
    setRemainingVotes(totalVotes - totalUsed);
  };


  //send otp
  const handleOpenOtp = async () => {
    try {
      if (!isVotingWindow) {
        notify(stageInfo?.message || "Chưa đến giai đoạn bỏ phiếu.", "warning");
        return;
      }
      showLoading();
      const email = localStorage.getItem("email");
      if (!email) {
        notify("Không tìm thấy email!", "error");
        return;
      }
      await AuthService.sendOtp({ email });
      setOtpModalOpen(true);
    } catch {
      notify("Không gửi được OTP!", "error");
    } finally {
      hideLoading();
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    const email = localStorage.getItem("email");
    if (!email) {
      notify("Không tìm thấy email!", "error");
      return;
    }
    try {
      await AuthService.sendOtp({ email });
    } catch {
      notify("Gửi lại OTP thất bại!", "error");
    }
  };


  const handleVerifyOtp = async (otp: string) => {
    try {
      const email = localStorage.getItem("email") || "";
      const res = await BallotService.verifyOtp(ballotId, { email, otp });
      notify(res.message || "Xác minh thành công!", "success");
      setOtpModalOpen(false);
      setSignModalOpen(true);
    } catch (error: any) {
      notify(error?.response?.data?.message || "Có lỗi xảy ra!", "error");
    }
  };



  const handleSignBallot = async ({ file, password }: { file: File; password: string }) => {
    try {
      if (!isVotingWindow) {
        notify(stageInfo?.message || "Chưa đến giai đoạn bỏ phiếu.", "warning");
        return;
      }
      showLoading();
      await BallotService.signBallot(ballotId, file, password);

      const voterId = localStorage.getItem("voterId");
      const electionId = localStorage.getItem("currentElectionId");

      const allocations = candidates.map((entity) => {
        const voteValue = vote[entity._id];

        return {
          entityId: entity._id,
          voteValue: voteValue !== undefined ? voteValue : 0
        };
      });


      const isBlank = allocations.every(item => item.voteValue === 0);

      const updatePayload: any = {
        electionId,
        voterId,
      };

      if (isBlank) {
        updatePayload.status = "BLANK";
        updatePayload.allocations = null;
      } else {
        updatePayload.status = "CAST";
        updatePayload.allocations = allocations;
      }

      await BallotService.updateBallot(ballotId, updatePayload);

      notify("Bỏ phiếu thành công!", "success");
      setSignModalOpen(false);
      navigate("/voter/ballots");

    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc chứng thư số.";

      notify(msg, "error");
    } finally {
      hideLoading();
    }
  };



  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <Card style={{ background: "#fff", marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>{electionTitle}</Title>

            <Text>Phân bổ {totalVotes} phiếu bầu của bạn cho các ứng cử viên</Text>
          </Col>

          <Col>
            <div
              style={{
                background: "#f6ffed",
                borderRadius: 30,
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                color: "#389e0d",
              }}
            >
              <DollarOutlined /> {remainingVotes} phiếu còn lại
            </div>
          </Col>
        </Row>

        <Card
          style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e6f4ff" }}
          bodyStyle={{ padding: 16 }}
        >
          <Space>
            <InfoCircleOutlined style={{ color: "#52c41a" }} />
            <Text>
              Bạn có <b>{totalVotes} phiếu bầu</b>. Có thể dồn phiếu hoặc chia đều tuỳ ý.
            </Text>
          </Space>
        </Card>
      </Card>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Card
            style={{ border: "1px solid #e6f4ff", background: "#fff", borderRadius: 12 }}
            bodyStyle={{ padding: 20 }}
          >
            <Space align="center" style={{ marginBottom: 16 }}>
              <UsergroupAddOutlined style={{ color: "#52c41a", fontSize: 18 }} />
              <Title level={5} style={{ margin: 0 }}>Danh sách bầu cử</Title>
            </Space>

            {!isVotingWindow && stageInfo?.message && (
              <Alert
                type="warning"
                showIcon
                message={stageInfo.message}
                style={{ marginBottom: 16 }}
              />
            )}

            {candidates.map((entity) => {
              const currentVotes = vote[entity._id] || 0;

              const maxVotesForCandidate = totalVotes;

              return (
                <CandidateCard
                  key={entity._id}
                  entity={entity}
                  votes={currentVotes}
                  maxVotes={maxVotesForCandidate}
                  onVoteChange={handleVoteChange}
                  disabled={!isVotingWindow}
                />
              );
            })}


            {/* 🔥 NÚT SUBMIT PHIẾU */}
            <Row justify="end" style={{ marginTop: 24 }}>
              <Button
                type="primary"
                icon={<SendOutlined />}
                style={{
                  height: 44,
                  borderRadius: 10,
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "0 28px",
                  background: "linear-gradient(90deg, #89e68b, #4fcf5a)",
                  border: "none",
                  outline: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.12)"
                }}
                onClick={handleOpenOtp}
                disabled={!isVotingWindow}              >
                Gửi Phiếu Bầu
              </Button>
            </Row>


            <OtpModal
              open={otpModalOpen}
              onClose={() => setOtpModalOpen(false)}
              onVerify={handleVerifyOtp}
              onResend={handleResendOtp}
              loading={otpLoading}
            />


            <DigitalSignModal
              open={signModalOpen}
              onClose={() => setSignModalOpen(false)}
              onSubmit={handleSignBallot}
            />

          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <CountdownCard minutes={minutes} seconds={seconds} />
        </Col>
      </Row>



    </div>
  );
};

export default CandidateSection;
