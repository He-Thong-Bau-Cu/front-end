import React from "react";
import { Card, Typography } from "antd";
import { ResolutionData } from "./VotingTypes";
import "../../../style/voter/ResolutionVoting.model.css";

const { Title, Paragraph, Text } = Typography;

interface Props {
  data: ResolutionData;
}

const ResolutionContent: React.FC<Props> = ({ data }) => (
  <Card bordered={false} className="resolution-card">
    <Title level={5} className="section-title">
      Nội dung Nghị quyết
    </Title>

    <div className="resolution-intro">
      <Title level={5} style={{ marginBottom: 4 }}>
        {data.title}
      </Title>
      <Text type="secondary">
        Nghị quyết số: {data.code} — Ngày: {data.date}
      </Text>
    </div>

    {data.clauses.map((c, i) => (
      <Paragraph key={i}>
        {c.title && <b>{c.title}</b>} {c.content}
      </Paragraph>
    ))}
  </Card>
);

export default ResolutionContent;
