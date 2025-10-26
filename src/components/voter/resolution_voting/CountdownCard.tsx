import React from "react";
import { Card, Typography, Space } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import "../../../style/voter/ResolutionVoting.model.css";

const { Title, Text } = Typography;

interface Props {
  minutes: number;
  seconds: string;
}

const CountdownCard: React.FC<Props> = ({ minutes, seconds }) => (
  <Card bordered={false} className="countdown-card">
    <Space direction="vertical" align="center" style={{ width: "100%" }}>
      <Space>
        <ClockCircleOutlined style={{ color: "#7cb342", fontSize: 20 }} />
        <Text strong style={{ color: "#388e3c" }}>
          Thời gian còn lại
        </Text>
      </Space>

      <Title level={2} className="time-text">
        {minutes}:{seconds}
      </Title>
      <Text type="secondary">Phút : Giây</Text>
    </Space>
  </Card>
);

export default CountdownCard;
