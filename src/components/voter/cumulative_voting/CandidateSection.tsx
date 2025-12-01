import {
  DollarOutlined,
  InfoCircleOutlined,
  SendOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
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

const { Title, Text } = Typography;

const CandidateSection = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [electionTitle, setElectionTitle] = useState("");

  const [candidates, setCandidates] = useState<ElectionEntities[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const ballotId = location.state?.ballotId;

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [vote, setVote] = useState<Record<string, number>>({});


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
    const newDistribution = { ...vote, [entity._id]: value };
    setVote(newDistribution);
    const totalUsed = Object.values(newDistribution).reduce((sum, v) => sum + v, 0);
    setRemainingVotes(Math.max(totalVotes - totalUsed, 0));
  };

  //send otp
  const handleOpenOtp = async () => {
    if (remainingVotes > 0)
      return notify("Bạn chưa phân bổ hết số phiếu!", "warning");
    try {
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
      showLoading();
      await BallotService.signBallot(ballotId, file, password);

      const voterId = localStorage.getItem("voterId");
      const electionId = localStorage.getItem("currentElectionId");
      const allocations = Object.entries(vote).map(([entityId, voteValue]) => ({
        entityId,
        voteValue
      }));

      await BallotService.updateBallot(ballotId, {
        electionId,
        voterId,
        allocations,
        status: "CAST",
      });
      notify("Bỏ phiếu thành công!", "success");
      // 4️⃣ Đóng modal → quay lại danh sách
      setSignModalOpen(false);
      navigate("/voter/ballots");

    } catch {
      notify("Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư.", "error");
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

            {candidates.map((entity) => {
              const currentVotes = vote[entity._id] || 0;

              const maxVotesForCandidate = remainingVotes + currentVotes;

              return (
                <CandidateCard
                  key={entity._id}
                  entity={entity}
                  votes={currentVotes}
                  maxVotes={maxVotesForCandidate}
                  onVoteChange={handleVoteChange}
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
                disabled={remainingVotes !== 0}
              >
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
