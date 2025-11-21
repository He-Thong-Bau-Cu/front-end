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
import OtpModal from "../otp-ballot/OtpModal";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";

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

  const [vote, setVote] = useState<Record<string, number>>({});

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
      await AuthService.sendOtp({ email });
      setOtpModalOpen(true);
    } catch (err) {
      notify("Không gửi được OTP!", "error");
    } finally {
      hideLoading();
    }
  };

  const handleResendOtp = async (): Promise<void> => {
    const email = localStorage.getItem("email");
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

      // 1️⃣ Gọi API để ký số
      await BallotService.signBallot(ballotId, file, password);

      notify("Ký phiếu bầu thành công!", "success");

      // 2️⃣ Lấy dữ liệu cần lưu
      const voterId = localStorage.getItem("voterId");
      const electionId = localStorage.getItem("currentElectionId");

      const allocations = Object.entries(vote).map(([entityId, voteValue]) => ({
        entityId,
        voteValue
      }));

      // 3️⃣ Update ballot để lưu allocations + CAST
      await BallotService.updateBallot(ballotId, {
        electionId,
        voterId,
        allocations,
        status: "CAST",
      });

      notify("Bỏ phiếu thành công!", "success");
      setSignModalOpen(false);
      navigate("/voter/ballots");

    } catch (error: any) {
      notify(error?.response?.data?.message || "Ký số thất bại!", "error");
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

      {/* LIST */}
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
    </div>
  );
};

export default CandidateSection;
