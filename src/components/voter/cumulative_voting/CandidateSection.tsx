import React, { useEffect, useState } from "react";
import { Typography, Row, Col, Card, Tag, Space, Spin } from "antd";
import {
  DollarOutlined,
  InfoCircleOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

import CandidateCard from "./CandidateCard";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import VotingRightsService from "@/services/VotingRightsService";

import { ElectionEntities } from "@/types/ElectionEntities.interface";
import { VotingRight } from "@/types/VotingRights.interface";
import { useLoading } from "@/contexts/LoadingContext";

const { Title, Text } = Typography;

const CandidateSection = () => {
  const [totalVotes, setTotalVotes] = useState(0);
  const [remainingVotes, setRemainingVotes] = useState(0);
  const [electionTitle, setElectionTitle] = useState("");


  const [candidates, setCandidates] = useState<ElectionEntities[]>([]);
  const { showLoading, hideLoading } = useLoading();

  const [voteDistribution, setVoteDistribution] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        showLoading();
        const voterId = localStorage.getItem("voterId");
        const electionId = localStorage.getItem("currentElectionId");

        // 🔥 1. API lấy quyền bầu cử (votes)
        const votingRights: VotingRight[] =
          await VotingRightsService.getVotingRightsByVoterId(voterId!);

        // tìm quyền bầu đúng electionId
        const right = votingRights.find(
          (item) => item.electionId._id === electionId
        );

        const votes = right?.votes ?? 0;

        // set số phiếu
        setTotalVotes(votes);
        setRemainingVotes(votes);
        setElectionTitle(right?.electionId?.title ?? "");


        // 🔥 2. API lấy danh sách ứng viên
        const list = await ElectionEntitiesService.getElectionEntitiesByElectionId(
          electionId!
        );

        setCandidates(list);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        hideLoading();
      }
    };

    loadData();
  }, []);

  // Xử lý phân bổ phiếu
  const handleVoteChange = (entity: ElectionEntities, value: number) => {
    const newDistribution = { ...voteDistribution, [entity._id]: value };

    setVoteDistribution(newDistribution);

    const totalUsed = Object.values(newDistribution).reduce((sum, v) => sum + v, 0);

    setRemainingVotes(Math.max(totalVotes - totalUsed, 0));
  };


  return (
    <div style={{ padding: 24 }}>
      {/* HEADER */}
      <Card style={{ background: "#fff", marginBottom: 24, borderRadius: 12 }} bodyStyle={{ padding: 20 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4}>{electionTitle}</Title>
            <Text>Phân bổ {totalVotes} phiếu bầu của bạn cho các ứng cử viên</Text>
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
              <DollarOutlined /> {remainingVotes} phiếu còn lại
            </div>
          </Col>
        </Row>

        <Card
          style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e6f4ff" }}
          bodyStyle={{ padding: 16 }}
        >
          <Space>
            <InfoCircleOutlined style={{ color: "#52c41a" }} />
            <Text>
              Bạn có <b>{totalVotes} phiếu bầu</b>. Có thể dồn phiếu hoặc chia đều tuỳ ý.
            </Text>
          </Space>
        </Card>
      </Card>

      {/* LIST */}
      <Card
        style={{ border: "1px solid #e6f4ff", background: "#fff", borderRadius: 12 }}
        bodyStyle={{ padding: 20 }}
      >
        <Space align="center" style={{ marginBottom: 16 }}>
          <UsergroupAddOutlined style={{ color: "#52c41a", fontSize: 18 }} />
          <Title level={5} style={{ margin: 0 }}>Danh sách bầu cử</Title>
        </Space>

        {candidates.map((entity) => (
          <CandidateCard
            key={entity._id}
            entity={entity}
            onVoteChange={handleVoteChange}
          />
        ))}
      </Card>
    </div>
  );
};

export default CandidateSection;
