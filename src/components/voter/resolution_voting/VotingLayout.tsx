import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Col, Row, Typography } from "antd";
import React from "react";
import "../../../style/voter/ResolutionVoting.model.css";

import CountdownCard from "./CountdownCard";
import ResolutionContent from "./ResolutionContent";

const { Title } = Typography;

const VotingLayout: React.FC = () => {
  // ==========================
  // 🔥 FIX CỨNG 100% DỮ LIỆU
  // ==========================
  const resolutionTitle = "Biểu quyết Nghị quyết 01/2025";
  const resolutionCode = "01/2025/NQ-HĐQT";
  const resolutionDate = "21/11/2025";
  const statusText = "Đang diễn ra";

  // CountDown fix cứng
  const minutes = 10;
  const seconds = 0;

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

      {/* ===== NỘI DUNG & COUNTDOWN ===== */}
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <ResolutionContent />
        </Col>

        <Col xs={24} lg={8}>
          <CountdownCard minutes={minutes} seconds={seconds} />
        </Col>
      </Row>
    </div>
  );
};

export default VotingLayout;
