// Pending, Cast, Locked, Invalid, Active
import BallotCard from "@/components/voter/BallotCard";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BallotService from "@/services/BallotService";
import { Ballot } from "@/types/Ballot.interface";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  InboxOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Divider,
  Row,
  Space,
  Typography
} from "antd";
import { formatServerDate } from "@/utils/date";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/voter/BallotList.model.css";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "@/config/socket";
import ElectionService from "@/services/ElectionService";

const { Text, Title } = Typography;

export default function BallotList() {
  const navigate = useNavigate();
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [canVoting, setCanVoting] = useState(false);

  const voterId = localStorage.getItem("voterId") || "";


  const getBallotStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chưa bắt đầu";
      case "ACTIVE":
        return "Đang diễn ra";
      case "CAST":
        return "Đã bỏ phiếu";
      case "LOCKED":
        return "Đã khóa";
      case "INVALID":
        return "Không hợp lệ";
      case "BLANK":
        return "Đã bỏ phiếu";
      default:
        return "Không xác định";
    }
  };


  const formatDate = (date: string | null | undefined) =>
    formatServerDate(date, { fallback: "Không xác định" });

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) return;

    const socket: Socket = io(SOCKET_URL, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected for checkin stage:", socket.id);
      socket.emit("join", electionId);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("transferData", (data: any) => {
      if (data.type === "stage-started" || data.type === "stage-ended") {
        console.log("📊 Received stage update:", data);
        checkVotingStage();
        fetchBallots();
      }
    });


    return () => {
      socket.disconnect();
      console.log("Socket disconnected for checkin stage");
    };
  }, []);

  const checkVotingStage = async () => {
    try {
      const electionId = localStorage.getItem("currentElectionId");
      if (!electionId) {
        return;
      }

      const stageResponse = await ElectionService.getCurrentStage(electionId);
      const stageData = stageResponse?.data || stageResponse;

      updateStageState(stageData);
    } catch (error: any) {
      console.error("Error checking voting stage:", error);
    }
  };

  const updateStageState = (stageData: any) => {
    const isCheckinActive =
      stageData?.currentStage === 'voting' &&
      stageData?.stageStatus === 'STARTED';

    setCanVoting(isCheckinActive);
  };

  useEffect(() => {
    fetchBallots();
    checkVotingStage();
  }, []);

  const fetchBallots = async () => {
    try {
      showLoading();
      const data = await BallotService.getBallotByVoterId(voterId);
      setBallots(data);
    } catch {
      notify("Không thể tải danh sách phiếu bầu", "error");
    } finally {
      hideLoading();
    }
  };

  const handleCardClick = (ballot: Ballot) => {
    const status = ballot.status;

    if (status !== "ACTIVE") {
      switch (status) {
        case "CAST":
          return notify(
            "Phiếu đã được bỏ",
            "error",
            "Bạn đã hoàn thành bỏ phiếu. Hãy xem chi tiết trong lịch sử."
          );
        case "BLANK":
          return notify(
            "Phiếu đã được bỏ",
            "error",
            "Bạn đã hoàn thành bỏ phiếu. Hãy xem chi tiết trong lịch sử."
          );

        case "LOCKED":
          return notify(
            "Phiếu bầu đã bị khóa",
            "error",
            "Bạn không thể thao tác vì phiếu này đã bị khóa."
          );

        case "INVALID":
          return notify(
            "Phiếu bầu không hợp lệ",
            "warning",
            "Phiếu bị lỗi hoặc không thể sử dụng. Vui lòng liên hệ ban tổ chức."
          );

        case "PENDING":
          return notify(
            "Chưa đến thời gian bỏ phiếu",
            "info",
            "Cuộc bầu cử chưa bắt đầu. Vui lòng quay lại sau."
          );

        default:
          return notify(
            "Không thể thao tác",
            "warning",
            "Trạng thái phiếu bầu này không được hỗ trợ."
          );
      }
    }

    const methodCode = ballot.electionId?.votingMethodId?.methodCode;

    if (!methodCode) {
      return notify("Không xác định được phương thức bỏ phiếu!", "error");
    }

    if (methodCode === "CUMULATIVE") {
      navigate("/voter/ballot_cumulative_voting", {
        state: { ballotId: ballot._id },
      });
    } else if (methodCode === "YES_NO_ABSTAIN") {
      navigate("/voter/ballot_resolution_voting", {
        state: { ballotId: ballot._id },
      });
    } else {
      notify("Phương thức bỏ phiếu chưa được hỗ trợ!", "warning");
    }
  };


  return (
    <div className="ballot-page">
      {/* Lịch sử */}
      <div className="history-button-container">
        <Button
          icon={<HistoryOutlined />}
          size="large"
          className="history-ballot-button"
          onClick={() => navigate("/voter/voting-history")}
        >
          Lịch sử bỏ phiếu
        </Button>
      </div>

      <div className="ballot-wrapper">
        {ballots.length > 0 ? (
          <Row gutter={[32, 0]} className="ballot-row">
            {/* LEFT */}
            <Col xs={24} md={12} className="ballot-left-col">
              <Title level={5} className="ballot-title">
                🗳️ Phiếu bầu của bạn
              </Title>

              <div className="single-ballot-container">
                {ballots.map((b, index) => (
                  <BallotCard
                    key={b._id || index}
                    ballot={{
                      id: b._id,
                      title: b.electionId.title,
                      desc: b.electionId.decisionName,
                      endTime: formatDate(b.electionId.endDate),
                      status: getBallotStatusLabel(b.status),
                      type: 2,
                    }}
                    onClick={() => handleCardClick(b)}
                  />
                ))}
              </div>
            </Col>

            {/* RIGHT – Info */}
            <Col xs={24} md={12} className="info-section-col">
              <Divider orientation="left" className="info-divider">
                <InfoCircleOutlined style={{ color: "#7cb342", marginRight: 8 }} />
                <Text strong>Thông tin bổ sung</Text>
              </Divider>

              <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                <Alert
                  message="Hướng dẫn bỏ phiếu"
                  description="Nhấp vào phiếu bầu bên trái để bắt đầu quá trình bỏ phiếu. Bạn có thể xem lại lựa chọn trước khi xác nhận."
                  type="info"
                  icon={<InfoCircleOutlined />}
                  showIcon
                  style={{ borderRadius: 8 }}
                />

                {/* SUMMARY STATUS RIGHT PANEL */}
                {ballots.some((b) => b.status === "BLANK") ? (
                  <Alert
                    message="Phiếu bỏ trống"
                    description="Phiếu của bạn đã được bỏ, nhưng không có lựa chọn."
                    type="info"
                    icon={<ExclamationCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : ballots.some((b) => b.status === "CAST") ? (
                  <Alert
                    message="Đã bỏ phiếu"
                    description="Phiếu bầu của bạn đã được ghi nhận."
                    type="success"
                    icon={<CheckCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : ballots.some((b) => b.status === "ACTIVE") ? (
                  <Alert
                    message="Đang diễn ra"
                    description="Bạn có thể thực hiện bỏ phiếu."
                    type="info"
                    icon={<InfoCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : ballots.some((b) => b.status === "PENDING" || !canVoting) ? (
                  <Alert
                    message="Chưa bắt đầu"
                    description="Chưa đến giai đoạn bỏ phiếu."
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : ballots.some((b) => b.status === "LOCKED") ? (
                  <Alert
                    message="Phiếu bầu đã bị khóa"
                    description="Bạn không thể thay đổi phiếu bầu này."
                    type="error"
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : ballots.some((b) => b.status === "INVALID") ? (
                  <Alert
                    message="Phiếu không hợp lệ"
                    description="Hãy liên hệ ban tổ chức để được hỗ trợ."
                    type="error"
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : null}
              </Space>
            </Col>
          </Row>
        ) : (
          <div className="voting-history-content" style={{ marginTop: 16 }}>
            <div className="no-voting-container">
              <div className="no-voting-icon">
                <InboxOutlined />
              </div>

              <Title level={4} className="no-voting-title">
                Bạn chưa có phiếu bầu nào
              </Title>

              <Text type="secondary" className="no-voting-description">
                Hiện tại bạn chưa được tạo phiếu bầu nào cho các cuộc bầu cử.
              </Text>

            </div>
          </div>
        )
        }
      </div>
    </div>
  );
}
