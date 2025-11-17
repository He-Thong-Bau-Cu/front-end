import React, { useState } from "react";
import { Card, Button, Slider, Typography, Tag, Row, Col, Space } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { ElectionEntities } from "@/types/ElectionEntities.interface";

const { Text, Paragraph } = Typography;

interface Props {
  entity: ElectionEntities;
  onVoteChange: (entity: ElectionEntities, value: number) => void;
}

const CandidateCard: React.FC<Props> = ({ entity, onVoteChange }) => {
  const [votes, setVotes] = useState(0);
  const maxVotes = 5;


  const handleChange = (value: number) => {
    setVotes(value);
    onVoteChange(entity, value);
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
              onClick={() => handleChange(Math.max(0, votes - 1))}
            />
            <Text style={{ fontSize: 18, fontWeight: 600 }}>{votes}</Text>
            <Button
              shape="circle"
              icon={<PlusOutlined />}
              onClick={() => handleChange(Math.min(maxVotes, votes + 1))}
            />
          </Space>

          <Text type="success" strong>{votes} phiếu bầu</Text>
        </Row>

        <Slider
          min={0}
          max={maxVotes}
          step={1}
          value={votes}
          onChange={handleChange}
          style={{ marginTop: 16 }}
          marks={{
            0: "0",
            [Math.floor(maxVotes / 2)]: Math.floor(maxVotes / 2),
            [maxVotes]: "TỐI ĐA",
          }}
        />
      </div>
    </Card>
  );
};

export default CandidateCard;
