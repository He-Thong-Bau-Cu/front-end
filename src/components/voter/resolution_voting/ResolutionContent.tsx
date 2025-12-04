import React, { useEffect, useState } from "react";
import { Card, Typography, Radio, Space, Button } from "antd";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import "../../../style/voter/ResolutionVoting.model.css";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { CheckCircleFilled, CloseCircleFilled, MinusCircleFilled, SendOutlined } from "@ant-design/icons";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import OtpModal from "../otp-ballot/OtpModal";
import BallotService from "@/services/BallotService";
import AuthService from "@/services/AuthService";
import { useLocation, useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

const ResolutionContent: React.FC = () => {
  const [entity, setEntity] = useState<any>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [signModalOpen, setSignModalOpen] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const electionId = localStorage.getItem("currentElectionId") || "";
  const voterId = localStorage.getItem("voterId") || "";
  const ballotId = location.state?.ballotId || "";
  const email = localStorage.getItem("email") || "";

  useEffect(() => {
    const loadEntity = async () => {
      try {
        if (!electionId) return;
        showLoading();
        const list = await ElectionEntitiesService.getElectionEntitiesByElectionId(electionId);
        setEntity(list[0] || null);
      } catch (err) {
        console.error("Lỗi load entity:", err);
        notify("Không thể tải nội dung nghị quyết", "error");
      } finally {
        hideLoading();
      }
    };
    loadEntity();
  }, [electionId]);

  const handleSendOtp = async () => {
    try {
      showLoading();
      await AuthService.sendOtp({ email });
      notify("OTP đã được gửi!", "success");
      setOtpModalOpen(true);
    } catch {
      notify("Không gửi được OTP!", "error");
    } finally {
      hideLoading();
    }
  };


  const handleVerifyOtp = async (otp: string) => {
    try {
      const res = await BallotService.verifyOtp(ballotId, { email, otp });
      notify(res.message || "Xác minh thành công!", "success");
      setOtpModalOpen(false);
      setSignModalOpen(true);
    } catch (error: any) {
      notify(error?.response?.data?.message || "OTP không chính xác!", "error");
    }
  };

  const handleResendOtp = async () => {
    try {
      await AuthService.sendOtp({ email });
    } catch {
      notify("Gửi lại OTP thất bại!", "error");
    }
  };


  const handleSign = async ({ file, password }: { file: File; password: string }) => {
    try {
      showLoading();
      await BallotService.signBallot(ballotId, file, password);
      const allocations = [{
        entityId: entity._id,
        voteValue:
          selected === "YES" ? 1 :
            selected === "NO" ? 0 :
              selected === "ABSTAIN" ? -1 :
                -1, // không chọn → -1
      }];


      // update ballot
      await BallotService.updateBallot(ballotId, {
        electionId,
        voterId,
        allocations,
        status: "CAST",
      });

      notify("Bỏ phiếu thành công!", "success");
      setSignModalOpen(false);
      navigate("/voter/ballots");
    } catch {
      notify("Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư.", "error");
    } finally {
      hideLoading();
    }
  };


  const options = [
    {
      key: "YES",
      label: "Tán thành",
      description: "Tôi đồng ý với nội dung nghị quyết này",
      icon: <CheckCircleFilled style={{ color: "#52c41a", fontSize: 20 }} />,
    },
    {
      key: "NO",
      label: "Không tán thành",
      description: "Tôi không đồng ý với nội dung nghị quyết này",
      icon: <CloseCircleFilled style={{ color: "#ff4d4f", fontSize: 20 }} />,
    },
    {
      key: "ABSTAIN",
      label: "Không ý kiến",
      description: "Tôi không có ý kiến về nội dung nghị quyết này",
      icon: <MinusCircleFilled style={{ color: "#ffb300", fontSize: 20 }} />,

    },
  ];

  return (
    <Card bordered={false} className="resolution-card">
      {/* <Title level={5} className="section-title">Nội dung Nghị quyết</Title> */}

      {!entity && <Paragraph>Không có dữ liệu nghị quyết.</Paragraph>}

      {entity && (
        <>
          <Title level={5} style={{ marginBottom: 6 }}>Bầu cử: {entity.title}</Title>

          {entity.description && (
            <Text type="secondary" style={{ marginBottom: 12, display: "block" }}>
              Nội dung: {entity.description}
            </Text>
          )}

          {entity.clauses?.map((c: any, idx: number) => (
            <Paragraph key={idx} style={{ marginBottom: 8 }}>
              {c.title && <b>{c.title}: </b>}
              {c.content}
            </Paragraph>
          ))}

          <hr style={{ margin: "16px 0", borderColor: "#eee" }} />
        </>
      )}

      <Title level={5} className="section-title">Lựa chọn biểu quyết</Title>

      <Radio.Group onChange={(e) => setSelected(e.target.value)} value={selected} style={{ width: "100%" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {options.map((opt) => (
            <Card
              key={opt.key}
              onClick={() => setSelected(opt.key)}
              className={`vote-option ${selected === opt.key ? "active" : ""} ${opt.key}`}
            >
              <Radio value={opt.key}>
                <Space>
                  <span className="icon">{opt.icon}</span>
                  <Text strong>{opt.label}</Text>
                </Space>
              </Radio>

              <Text type="secondary" style={{ display: "block", marginTop: 4 }}>
                {opt.description}
              </Text>
            </Card>
          ))}
        </Space>
      </Radio.Group>

      {/* NÚT GỬI PHIẾU */}
      <div className="vote-form-buttons">
        <Button
          icon={<SendOutlined />}
          className="confirm-btn active"
          disabled={false}
          onClick={handleSendOtp}
        >
          Gửi Phiếu Bầu
        </Button>
      </div>

      {/* MODALS */}
      <OtpModal
        open={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
      />

      <DigitalSignModal
        open={signModalOpen}
        onClose={() => setSignModalOpen(false)}
        onSubmit={handleSign}
      />
    </Card>
  );
};

export default ResolutionContent;
