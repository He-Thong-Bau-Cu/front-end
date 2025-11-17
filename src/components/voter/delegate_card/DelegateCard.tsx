import { useLoading } from "@/contexts/LoadingContext";
import DelegateCardService from "@/services/DelegateCardService";
import { DelegateCard } from "@/types/DelegateCard.interface";
import {
  StarFilled,
  IdcardOutlined
} from "@ant-design/icons";
import { Card, Col, Row, Tag, Typography } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import "../../../style/voter/DelegateCard.model.css";

const { Title, Text } = Typography;

const renderStatusTag = (status: string) => {
  const normalized = status.toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return <Tag color="green">Đang hoạt động</Tag>;

    case "EXPIRED":
      return <Tag color="red">Đã hết hạn</Tag>;

    case "REVOKED":
      return <Tag color="orange">Đã thu hồi</Tag>;

    case "PENDING":
      return <Tag color="blue">Đang chờ duyệt</Tag>;

    case "INVALID":
      return <Tag color="volcano">Không hợp lệ</Tag>;

    default:
      return <Tag color="default">Không xác định</Tag>;
  }
};



const DelegateCardPage = () => {
  const [card, setCard] = useState<DelegateCard | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const { showLoading, hideLoading } = useLoading();

  const voterId = localStorage.getItem("voterId") || "";

  useEffect(() => {
    const fetchDelegateCard = async () => {
      try {
        showLoading();

        const data = await DelegateCardService.getDelegateCardByVoterId(voterId);

        const raw = Array.isArray(data) ? data[0] : data;

        if (!raw) {
          setCard(null);
          setHasFetched(true);
          return;
        }

        const mapped: DelegateCard = {
          id: raw._id,
          fullName: raw.voterId?.userId?.fullName || "",
          email: raw.voterId?.userId?.email || "",
          dateOfBirth: raw.voterId?.userId?.dateOfBirth || "",
          citizenId: raw.voterId?.userId?.citizenId || "",
          position: raw.voterId?.userId?.position || "",
          image: raw.voterId?.userId?.image || "",
          status: raw.status,
          issuedAt: raw.issuedAt,
          expiresAt: raw.expiresAt,
          decisionNumber: raw.electionId?.decisionNumber || "",
          voterId: raw.voterId?._id || "",
          title: raw.electionId?.title || "",
          token: ""
        };

        setCard(mapped);
        setHasFetched(true);

      } catch {
        setCard(null);
        setHasFetched(true);
      } finally {
        hideLoading();
      }
    };

    fetchDelegateCard();
  }, []);


  if (!hasFetched) {
    return null;
  }

  if (!card) {
    return (
      <div className="delegate-wrapper">
        <div className="delegate-empty">
          <div className="delegate-empty-icon">
            <IdcardOutlined />
          </div>
          <Title level={3} className="delegate-empty-title">
            Thẻ đại biểu chưa được cấp
          </Title>
          <Text className="delegate-empty-description">
            Hiện tại bạn chưa có thẻ đại biểu. Vui lòng liên hệ với ban tổ chức để được cấp thẻ.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="delegate-wrapper">

      {/* Header */}
      <div className="delegate-header">
        <div>
          <Title level={4} className="delegate-header-title">
            Thẻ đại biểu
          </Title>

          <Text className="delegate-header-sub">
            Hạn thẻ: {dayjs(card.issuedAt).format("DD/MM/YYYY")} - {dayjs(card.expiresAt).format("DD/MM/YYYY")}
          </Text>
        </div>

        <div className="delegate-star">
          <StarFilled />
        </div>
      </div>

      {/* Main card */}
      <Card className="delegatmain-card">

        <Row gutter={[16, 16]} align="middle">
          {/* Avatar */}
          <Col xs={24} md={3}>
            <div className="delegate-avatar-wrapper">
              <img
                src={card.image}
                alt={card.fullName}
                className="delegate-avatar-img"
              />
            </div>
          </Col>

          {/* Info */}
          <Col xs={24} md={18}>
            <div className="delegate-info">

              <Title level={5} className="delegate-name">
                {card.fullName}
              </Title>

              <Text type="secondary" className="delegate-area">
                {card.position}
              </Text>

              <div className="delegate-tags">
                <div className="delegate-tags">
                  {renderStatusTag(card.status)}
                </div>

                {/* <Tag color="blue">
                  {card.decisionNumber}
                </Tag> */}
              </div>
            </div>
          </Col>
        </Row>

        {/* Info grid */}
        <div className="delegate-details">
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <div className="delegate-detail-item">
                <Text strong>Mã thẻ: </Text>
                <span>{card.id}</span>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="delegate-detail-item">
                <Text strong>Số CCCD: </Text>
                <span>{card.citizenId}</span>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="delegate-detail-item">
                <Text strong>Ngày sinh: </Text>
                <span>{dayjs(card.dateOfBirth).format("DD/MM/YYYY")}</span>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="delegate-detail-item">
                <Text strong>Email: </Text>
                <span>{card.email}</span>
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="delegate-detail-item">
                <Text strong>Chức vụ: </Text>
                <span>{card.position}</span>
              </div>
            </Col>

          </Row>
        </div>

        {/* QR Code */}
        <div className="delegate-qr">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${card.token}`}
            alt="QR"
            className="delegate-qr-img"
          />



          <div className="delegate-qr-text">
            <Text type="secondary">Quét mã QR để xác thực thông tin</Text>
            <br />
            <Text type="success">ID: {card.id}</Text>
          </div>
        </div>

        <Text type="secondary" className="delegate-issued">
          Ngày cấp: {dayjs(card.issuedAt).format("DD/MM/YYYY")}
        </Text>

      </Card>
    </div>
  );
};

export default DelegateCardPage;
