import React, { useState } from "react";
import { Card, Badge, Progress, Button, Typography, Avatar, Tag, Space, Row, Col } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  LogoutOutlined,
  UserOutlined,
  TrophyOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface Election {
  id: number;
  title: string;
  description: string;
  status: "ongoing" | "upcoming" | "ended";
  role: "admin" | "voter" | "observer";
  startDate: string;
  endDate: string;
  totalVoters: number;
  votedCount: number;
  candidates: number;
  image: string;
}

export default function ElectionDashboard() {
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);

  // Mock data các cuộc bầu cử
  const elections: Election[] = [
    {
      id: 1,
      title: "Bầu cử Chủ tịch Hội Sinh viên 2025",
      description: "Bầu chọn Ban Chủ nhiệm Hội Sinh viên nhiệm kỳ 2025-2027",
      status: "ongoing",
      role: "admin",
      startDate: "15/11/2025",
      endDate: "20/11/2025",
      totalVoters: 1234,
      votedCount: 856,
      candidates: 4,
      image: "🗳️"
    },
    {
      id: 2,
      title: "Bầu cử Lớp trưởng K18",
      description: "Bầu chọn Ban Cán sự lớp niên khóa 2025-2026",
      status: "ongoing",
      role: "voter",
      startDate: "10/11/2025",
      endDate: "25/11/2025",
      totalVoters: 45,
      votedCount: 32,
      candidates: 3,
      image: "🎓"
    },
    {
      id: 3,
      title: "Bầu cử Ban Đại diện Khoa CNTT",
      description: "Bầu chọn Ban Đại diện sinh viên Khoa Công nghệ Thông tin",
      status: "upcoming",
      role: "voter",
      startDate: "01/12/2025",
      endDate: "05/12/2025",
      totalVoters: 567,
      votedCount: 0,
      candidates: 6,
      image: "💻"
    },
  ];

  const getStatusConfig = (status: Election["status"]) => {
    switch (status) {
      case "ongoing":
        return {
          label: "Đang diễn ra",
          color: "success",
          icon: <ClockCircleOutlined />
        };
      case "upcoming":
        return {
          label: "Sắp diễn ra",
          color: "processing",
          icon: <ExclamationCircleOutlined />
        };
      case "ended":
        return {
          label: "Đã kết thúc",
          color: "default",
          icon: <CheckCircleOutlined />
        };
    }
  };

  const getRoleConfig = (role: Election["role"]) => {
    switch (role) {
      case "admin":
        return {
          label: "Quản trị viên",
          color: "orange"
        };
      case "voter":
        return {
          label: "Cử tri",
          color: "green"
        };
      case "observer":
        return {
          label: "Giám sát viên",
          color: "purple"
        };
    }
  };

  const handleSelectElection = (election: Election): void => {
    setSelectedElection(election);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: "linear-gradient(135deg, #a8e063 0%, #56ab2f 100%)",
        padding: "24px",
      }}
    >
      {/* Header */}
      <Card
        style={{
          maxWidth: "1200px",
          margin: "0 auto 24px",
          borderRadius: "16px",
        }}
        bodyStyle={{ padding: "24px" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Space size="large">
            <Avatar
              size={64}
              style={{
                background: "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)",
                fontSize: "32px",
              }}
            >
              🗳️
            </Avatar>
            <div>
              <Title level={3} style={{ margin: 0 }}>
                Hệ thống Bầu cử Điện tử
              </Title>
              <Text type="secondary">
                Chào mừng, <Text strong>Nguyễn Văn A</Text>
              </Text>
            </div>
          </Space>

          <Space>
            <Button icon={<UserOutlined />} size="large">
              Hồ sơ
            </Button>
            <Button type="primary" danger icon={<LogoutOutlined />} size="large">
              Đăng xuất
            </Button>
          </Space>
        </div>
      </Card>

      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Title Section */}
        <Card style={{ marginBottom: "2px", borderRadius: "16px 16px 0 0" }}>
          <Title level={4} style={{ margin: 0 }}>
            Danh sách cuộc bầu cử
          </Title>
          <Text type="secondary">Chọn cuộc bầu cử để tham gia hoặc quản lý</Text>
        </Card>

        {/* Elections List */}
        <Card
          style={{
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
          }}
          bodyStyle={{ padding: 0 }}
        >
          {elections.map((election, index) => {
            const statusConfig = getStatusConfig(election.status);
            const roleConfig = getRoleConfig(election.role);
            const progress = Math.round((election.votedCount / election.totalVoters) * 100);

            return (
              <div
                key={election.id}
                onClick={() => handleSelectElection(election)}
                style={{
                  padding: "24px",
                  borderBottom: index < elections.length - 1 ? "1px solid #f0f0f0" : "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: selectedElection?.id === election.id ? "#f9fdf7" : "transparent",
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background = "#f9fdf7";
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                  e.currentTarget.style.background =
                    selectedElection?.id === election.id ? "#f9fdf7" : "transparent";
                }}
              >
                <Row gutter={[20, 16]}>
                  {/* Icon */}
                  <Col>
                    <Avatar
                      size={64}
                      style={{
                        background: "#f5f5f5",
                        fontSize: "32px",
                      }}
                    >
                      {election.image}
                    </Avatar>
                  </Col>

                  {/* Content */}
                  <Col flex={1}>
                    <Space direction="vertical" style={{ width: "100%" }} size="small">
                      <Space wrap>
                        <Title level={5} style={{ margin: 0 }}>
                          {election.title}
                        </Title>
                        <Badge
                          status={statusConfig.color as any}
                          text={statusConfig.label}
                        />
                        <Tag color={roleConfig.color}>{roleConfig.label}</Tag>
                      </Space>

                      <Paragraph
                        type="secondary"
                        style={{ margin: 0 }}
                        ellipsis={{ rows: 2 }}
                      >
                        {election.description}
                      </Paragraph>

                      <Row gutter={[24, 8]}>
                        <Col>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Thời gian
                          </Text>
                          <div>
                            <Text strong style={{ fontSize: "14px" }}>
                              {election.startDate} - {election.endDate}
                            </Text>
                          </div>
                        </Col>
                        <Col>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Ứng cử viên
                          </Text>
                          <div>
                            <Text strong style={{ fontSize: "14px" }}>
                              {election.candidates} người
                            </Text>
                          </div>
                        </Col>
                        <Col>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Tỷ lệ bỏ phiếu
                          </Text>
                          <div>
                            <Text strong style={{ fontSize: "14px" }}>
                              {election.votedCount}/{election.totalVoters} ({progress}%)
                            </Text>
                          </div>
                        </Col>
                      </Row>

                      {election.status === "ongoing" && (
                        <Progress
                          percent={progress}
                          strokeColor={{
                            "0%": "#7cb342",
                            "100%": "#a5d6a7",
                          }}
                          showInfo={false}
                        />
                      )}
                    </Space>
                  </Col>

                  {/* Arrow */}
                  <Col>
                    <Button
                      type="text"
                      icon={<RightOutlined />}
                      size="large"
                      style={{ color: "#7cb342" }}
                    />
                  </Col>
                </Row>
              </div>
            );
          })}
        </Card>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            marginTop: "24px",
            color: "rgba(255,255,255,0.9)",
          }}
        >
          <Text style={{ color: "rgba(255,255,255,0.9)" }}>
            © 2025 Hệ thống Bầu cử Điện tử. Bảo mật và minh bạch.
          </Text>
        </div>
      </div>
    </div>
  );
}
