// --- src/components/voter/BallotCard.jsx ---
import React from "react";
import { Card, Typography, Tag, Space, Row, Col } from "antd";
import { FileTextOutlined, ClockCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function BallotCard({ ballot = {}, onClick }) {
  const {
    title = "Không có tiêu đề",
    desc = "Chưa có mô tả",
    endTime = "—",
    status = "Chưa xác định",
  } = ballot;

  // 🎨 Quy tắc màu trạng thái
  const statusColorMap = {
    "Đang diễn ra": {
      tagColor: "green",
      bg: "#e8f5e9",
      textColor: "#388e3c",
      borderTop: "#7cb342",
      iconColor: "#7cb342",
    },
    "Chưa bắt đầu": {
      tagColor: "blue",
      bg: "#e3f2fd",
      textColor: "#1976d2",
      borderTop: "#2196f3",
      iconColor: "#2196f3",
    },
    "Đã kết thúc": {
      tagColor: "default",
      bg: "#f5f5f5",
      textColor: "#666",
      borderTop: "#bdbdbd",
      iconColor: "#9e9e9e",
    },
    default: {
      tagColor: "default",
      bg: "#fafafa",
      textColor: "#555",
      borderTop: "#ccc",
      iconColor: "#999",
    },
  };

  // ✅ Lấy màu theo trạng thái
  const colorRule = statusColorMap[status] || statusColorMap.default;

  return (
    <Card
      hoverable
      onClick={onClick}
      className="ballot-card-container"
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        borderTop: `4px solid ${colorRule.borderTop}`,
        cursor: "pointer",
        transition: "all 0.3s ease",
      }}
      bodyStyle={{ padding: "20px 22px" }}
    >
      {/* 🔹 Header: icon + tag */}
      <Row justify="space-between" align="top" style={{ marginBottom: 12 }}>
        <Col>
          <div
            style={{
              background: colorRule.bg,
              borderRadius: 12,
              padding: 12,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileTextOutlined style={{ fontSize: 22, color: colorRule.iconColor }} />
          </div>
        </Col>
        <Col>
          <Tag
            color={colorRule.tagColor}
            style={{
              background: colorRule.bg,
              color: colorRule.textColor,
              border: "none",
              borderRadius: 20,
              padding: "4px 12px",
              fontWeight: 500,
            }}
          >
            {status}
          </Tag>
        </Col>
      </Row>

      {/* 🔹 Title */}
      <Title
        level={5}
        style={{
          marginBottom: 6,
          color: "#212121",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {title}
      </Title>

      {/* 🔹 Description */}
      <Paragraph
        style={{
          color: "#555",
          fontSize: 13.5,
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        {desc}
      </Paragraph>

      {/* 🔹 End Time */}
      <Space align="center">
        <ClockCircleOutlined style={{ color: colorRule.iconColor }} />
        <Text type="secondary">Kết thúc: {endTime}</Text>
      </Space>
    </Card>
  );
}
