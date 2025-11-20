import { ElectionEntities } from "@/types/ElectionEntities.interface";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Slider, Space, Typography } from "antd";
import React from "react";

const { Text, Paragraph } = Typography;

interface Props {
  entity: ElectionEntities;
  votes: number;
  maxVotes: number;
  onVoteChange: (entity: ElectionEntities, value: number) => void;
}


const CandidateCard: React.FC<Props> = ({ entity, votes, maxVotes, onVoteChange }) => {
  // const [votes, setVotes] = useState(0);


  const handleChange = (value: number) => {
    const realValue = Math.min(maxVotes, Math.max(0, value));
    onVoteChange(entity, realValue);
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        marginBottom: 24,
        border: "1px solid #f0f0f0",
      }}
      bodyStyle={{ padding: 24 }}
    >
      <Row gutter={[16, 8]} align="middle">
        <Col flex="auto">
          <Space direction="vertical" size={4}>
            <Text strong style={{ fontSize: 16 }}>{entity.title}</Text>
          </Space>
        </Col>
      </Row>

      <Paragraph style={{ marginTop: 12, fontSize: 14, color: "#555" }}>
        {entity.description}
      </Paragraph>

      <div style={{ background: "#fafafa", borderRadius: 12, padding: 16, marginTop: 8 }}>
        <Text strong>Phân bổ phiếu bầu</Text>

        <Row align="middle" justify="space-between" style={{ marginTop: 8 }}>
          <Space>
            <Button
              shape="circle"
              icon={<MinusOutlined />}
              onClick={() => handleChange(votes - 1)}
              disabled={votes === 0}
            />
            <Text style={{ fontSize: 18, fontWeight: 600 }}>{votes}</Text>
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => handleChange(votes + 1)}
              disabled={votes >= maxVotes}
            />
          </Space>

          <Text type="success" strong>{votes} phiếu bầu</Text>
        </Row>

        <Slider
          min={0}
          max={maxVotes}
          value={votes}
          onChange={handleChange}
        />
      </div>
    </Card>
  );
};

export default CandidateCard;
