import React from "react";
import { Card, Row, Col, Typography, Button, Tag } from "antd";
import {
  StarFilled,
  HomeOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  DownloadOutlined,
  PrinterOutlined,
  SendOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import "../../../style/voter/DelegateCard.model.css";

const { Title, Text } = Typography;

const DelegateCard = ({ delegate }) => {
  if (!delegate) return null;

  return (
    <div className="delegate-wrapper">
      {/* Header */}
      <div className="delegate-header">
        <div>
          <Title level={4} className="delegate-header-title">
            Thẻ đại biểu
          </Title>
          <Text className="delegate-header-sub">
            {delegate.term || "Khóa XVI - Nhiệm kỳ 2021–2026"}
          </Text>
        </div>
        <div className="delegate-star">
          <StarFilled />
        </div>
      </div>

      {/* Main Card */}
      <Card className="delegate-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <div className="delegate-avatar">
              <div className="delegate-avatar-text">
                {delegate.avatarText || "NA"}
              </div>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <div className="delegate-info">
              <Title level={5} className="delegate-name">
                {delegate.name || "Nguyễn Văn A"}
              </Title>
              <Text type="secondary" className="delegate-area">
                {delegate.area || "Đại biểu Khu vực 1 - Quận 1, TP.HCM"}
              </Text>
              <div className="delegate-tags">
                <Tag icon={<CheckCircleFilled />} color="green">
                  {delegate.status || "Đang hoạt động"}
                </Tag>
                <Tag color="blue">
                  {delegate.termShort || "Nhiệm kỳ: 2021 - 2026"}
                </Tag>
              </div>
            </div>
          </Col>
        </Row>

        {/* Info grid */}
        <div className="delegate-details">
          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Text strong>Số CCCD/CMND</Text>
              <div>{delegate.idNumber || "001234567890"}</div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Ngày sinh</Text>
              <div>{delegate.dob || "15/05/1975"}</div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Đảng phái</Text>
              <div>{delegate.party || "Đảng Cộng sản Việt Nam"}</div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Chức vụ</Text>
              <div>{delegate.position || "Trưởng Ban Kinh tế"}</div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Email</Text>
              <div>{delegate.email || "nguyenvana@quochoi.vn"}</div>
            </Col>
            <Col xs={24} md={12}>
              <Text strong>Số điện thoại</Text>
              <div>{delegate.phone || "0912 345 678"}</div>
            </Col>
          </Row>
        </div>

        {/* QR Code */}
        <div className="delegate-qr">
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DelegateID=DB-QK-XVI-001-2024"
            alt="QR"
            className="delegate-qr-img"
          />
          <div className="delegate-qr-text">
            <Text type="secondary">Quét mã QR để xác thực thông tin</Text>
            <br />
            <Text type="success">
              ID: {delegate.id || "DB-QK-XVI-001-2024"}
            </Text>
          </div>
        </div>

        {/* Actions */}
        <div className="delegate-actions">
          <Button icon={<PrinterOutlined />}>In thẻ</Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            Tải xuống
          </Button>
          <Button icon={<SendOutlined />}>Gửi email</Button>
        </div>

        <Text type="secondary" className="delegate-issued">
          {delegate.issued || "Ngày cấp: 01/01/2024"}
        </Text>
      </Card>

      {/* Extra Info */}
      <Card className="delegate-extra">
        <Title level={5} className="delegate-extra-title">
          Thông tin bổ sung
        </Title>

        <div className="delegate-extra-item">
          <HomeOutlined className="extra-icon" />
          <div>
            <Text strong>Lĩnh vực phụ trách</Text>
            <div>
              {delegate.field ||
                "Kinh tế tài chính - Ngành chính đầu tư phát triển"}
            </div>
          </div>
        </div>

        <div className="delegate-extra-item">
          <TeamOutlined className="extra-icon" />
          <div>
            <Text strong>Số lượng cử tri đại diện</Text>
            <div>
              {delegate.constituency ||
                "17.850 cử tri tại Quận 1, TP Hồ Chí Minh"}
            </div>
          </div>
        </div>

        <div className="delegate-extra-item">
          <EnvironmentOutlined className="extra-icon" />
          <div>
            <Text strong>Văn phòng làm việc</Text>
            <div>
              {delegate.office ||
                "Tầng 3, Nhà Quốc hội, Số 2 Hùng Vương, Ba Đình, Hà Nội"}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DelegateCard;
