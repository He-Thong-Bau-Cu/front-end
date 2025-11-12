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
import { Alert, Button, Col, Divider, Empty, message, Row, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/voter/BallotList.model.css";

const { Text, Title } = Typography;

export default function BallotList() {
  const navigate = useNavigate();
  const [ballots, setBallots] = useState<Ballot[]>([]);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  // 👉 ID cử tri tạm (test)
  const voterId = "6910f2016e3b3c1fb79a1f9d";

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
    if (ballot.status === "CAST") {
      message.info("Phiếu này đã được bỏ. Bạn có thể xem lại trong lịch sử bỏ phiếu.");
    } else {
      // tuỳ loại phiếu mà điều hướng khác nhau
      navigate("/voter/ballot_cumulative_voting", { state: { ballotId: ballot._id } });
    }
  };

  return (
    <div className="ballot-page">
      <div className="history-button-container">
        <Button
          type="primary"
          icon={<HistoryOutlined />}
          size="large"
          style={{
            background: "#7cb342",
            borderColor: "#7cb342",
            fontWeight: 500,
          }}
          onClick={() => navigate("/voter/voting-history")}
        >
          Lịch sử bỏ phiếu
        </Button>
      </div>

      <div className="ballot-wrapper">
        {ballots.length > 0 ? (
          <Row gutter={[32, 0]} className="ballot-row">
            {/* Left: Phiếu bầu */}
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
                      endTime: b.electionId.endDate || "Không xác định",
                      status: b.status === "CAST" ? "Đã bỏ phiếu" : "Chưa bỏ",
                      type: 2,
                    }}
                    onClick={() => handleCardClick(b)}
                  />
                ))}
              </div>
            </Col>

            {/* Right: Thông tin bổ sung */}
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

                {ballots.some((b) => b.status === "CAST") ? (
                  <Alert
                    message="Bạn đã bỏ phiếu"
                    description="Phiếu bầu của bạn đã được ghi nhận. Bạn có thể xem chi tiết trong phần lịch sử bỏ phiếu."
                    type="success"
                    icon={<CheckCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                ) : (
                  <Alert
                    message="Phiếu chưa được bỏ"
                    description="Hãy thực hiện bỏ phiếu của bạn trước khi thời gian kết thúc."
                    type="warning"
                    icon={<ExclamationCircleOutlined />}
                    showIcon
                    style={{ borderRadius: 8 }}
                  />
                )}
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
