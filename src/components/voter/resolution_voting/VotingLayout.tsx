import React, { useState, useEffect } from "react";
import { Typography, Row, Col } from "antd";
import {
  CheckCircleOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import VotingContent from "./ResolutionContent";
import VotingOptions from "./VotingOptions";
import CountdownCard from "./CountdownCard";
import { VotingLayoutProps } from "./VotingTypes";
import "../../../style/voter/ResolutionVoting.model.css";

const { Title, Text } = Typography;

const VotingLayout: React.FC<VotingLayoutProps> = ({
  title,
  status,
  data,
  options,
  countdown,
  onSubmit,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    countdown ? countdown.minutes * 60 + parseInt(countdown.seconds) : 0
  );

  useEffect(() => {
    if (!countdown) return;
    const timer = setInterval(
      () => setTimeLeft((t) => (t > 0 ? t - 1 : 0)),
      1000
    );
    return () => clearInterval(timer);
  }, [countdown]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = String(timeLeft % 60).padStart(2, "0");

  return (
    <div className="resolution-page">
      <div className="resolution-header">
        <div className="header-left">
          <Title level={3} className="header-title">
            {title}
          </Title>

          <div className="header-meta">
            <span className="meta-item">
              <FileTextOutlined className="meta-icon" />
              <span>
                Nghị quyết số: <b>{data.code}</b>
              </span>
            </span>

            <span className="meta-item">
              <ClockCircleOutlined className="meta-icon" />
              <span>
                Thời gian: <b>{data.date}</b>
              </span>
            </span>
          </div>
        </div>

        <div className="status-pill">
          <CheckCircleOutlined />
          <span>{status}</span>
        </div>
      </div>

      {/* ✅ NỘI DUNG BIỂU QUYẾT */}
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <VotingContent data={data} />
          <VotingOptions
            options={options}
            selected={selected}
            setSelected={setSelected}
            comment={comment}
            setComment={setComment}
            onSubmit={() => onSubmit(selected, comment)}
          />
        </Col>
        {countdown && (
          <Col xs={24} lg={8}>
            <CountdownCard minutes={minutes} seconds={seconds} />
          </Col>
        )}
      </Row>
    </div>
  );
};

export default VotingLayout;
