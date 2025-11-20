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
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Divider,
  Empty,
  message,
  Row,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/voter/BallotList.model.css";
import dayjs from "dayjs";

const { Text, Title } = Typography;

export default function BallotList() {
  const navigate = useNavigate();
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

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
      default:
        return "Không xác định";
    }
  };


  const formatDate = (date: string | null | undefined) => {
    if (!date) return "Không xác định";
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };


  useEffect(() => {
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
    fetchBallots();
  }, []);


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

    // 🟢 ACTIVE → VOTE
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
                {ballots.some((b) => b.status === "CAST") ? (
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
                ) : ballots.some((b) => b.status === "PENDING") ? (
                  <Alert
                    message="Chưa bắt đầu"
                    description="Cuộc bầu cử chưa bắt đầu."
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
          <div className="no-result">
            <Empty
              description={<Text type="secondary">Bạn chưa có phiếu bầu nào.</Text>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>
    </div>
  );
}
