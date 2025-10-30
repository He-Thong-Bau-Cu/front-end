import React, { useState } from "react";
import { Typography, Row, Col, Card, Tag, Space } from "antd";
import {
  DollarOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import CandidateCard from "./CandidateCard";
import { Candidate } from "@/types/Candidate.interface"; // 👈 import interface

const { Title, Text } = Typography;

const CandidateSection = () => {
  const [totalVotes, setTotalVotes] = useState(10);
  const [remainingVotes, setRemainingVotes] = useState(10);

  // Dữ liệu ứng cử viên có kiểu Candidate[]
  const candidates: Candidate[] = [
    {
      name: "Nguyễn Văn A",
      age: 50,
      department: "Phòng Kinh doanh",
      position: "Trưởng phòng",
      experience: "15 năm",
      description:
        "Có kinh nghiệm quản lý và điều hành hoạt động công đoàn, nhiệt tình trong công tác xã hội, được đồng nghiệp tin tưởng và ủng hộ.",
      maxVotes: 5,
      tags: [{ label: "Đoàn viên", color: "green" }],
    },
    {
      name: "Trần Thị B",
      age: 45,
      department: "Phòng Nhân sự",
      position: "Phó phòng",
      experience: "12 năm",
      description:
        "Tâm huyết với công tác vận động quần chúng, có khả năng tổ chức các hoạt động văn hóa, thể thao cho CBCNV, luôn lắng nghe và giải quyết tâm tư nguyện vọng.",
      maxVotes: 5,
      tags: [{ label: "Đảng viên", color: "green" }],
    },
  ];

  const [voteDistribution, setVoteDistribution] = useState<Record<string, number>>({});

  const handleVoteChange = (candidate: Candidate, value: number) => {
    const newDistribution = { ...voteDistribution, [candidate.name]: value };
    setVoteDistribution(newDistribution);

    const totalUsed = Object.values(newDistribution).reduce((sum, v) => sum + v, 0);
    setRemainingVotes(Math.max(totalVotes - totalUsed, 0));
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header Section */}
      <Card
        style={{
          background: "#fff",
          marginBottom: 24,
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>Bầu cử hội đồng quản trị</Title>
            <Text>
              Phân bổ {totalVotes} phiếu bầu của bạn cho các ứng cử viên
            </Text>
          </Col>

          <Col>
            <div
              style={{
                background: "#f6ffed",
                borderRadius: 30,
                padding: "8px 20px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                color: "#389e0d",
              }}
            >
              <DollarOutlined /> {remainingVotes} Phiếu bầu còn lại
            </div>
          </Col>
        </Row>

        <Card
          style={{
            marginTop: 16,
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #e6f4ff",
          }}
          bodyStyle={{ padding: 16 }}
        >
          <Space>
            <InfoCircleOutlined style={{ color: "#52c41a" }} />
            <Text>
              Bạn có <b>{totalVotes} phiếu bầu</b> cho danh sách ứng cử viên. Bạn có
              thể tập trung tất cả cho một người, hoặc chia đều cho nhiều người.
            </Text>
          </Space>
        </Card>
      </Card>

      {/* Candidate List */}
      <Card
        style={{
          border: "1px solid #e6f4ff",
          background: "#fff",
          borderRadius: 12,
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Space align="center" style={{ marginBottom: 16 }}>
          <UsergroupAddOutlined style={{ color: "#52c41a", fontSize: 18 }} />
          <Title level={5} style={{ margin: 0 }}>
            Danh sách Ứng cử viên
          </Title>
          <Tag color="blue">Tất cả ({candidates.length})</Tag>
          <Tag color="default">
            Đã phân bổ ({Object.keys(voteDistribution).length})
          </Tag>
        </Space>

        {candidates.map((c, i) => (
          <CandidateCard key={i} candidate={c} onVoteChange={handleVoteChange} />
        ))}
      </Card>
    </div>
  );
};

export default CandidateSection;
