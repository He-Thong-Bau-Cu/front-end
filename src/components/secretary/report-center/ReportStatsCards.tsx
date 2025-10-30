import { Card, Row, Col, Typography } from "antd";
import { ReportStat } from "../../../types/ReportCenter.interface";
const { Text } = Typography;

export default function ReportStatsCards({ stats }: { stats: ReportStat[] }) {
  return (
    <Row gutter={[16, 16]} className="rc-stats-row">
      {stats.map((item, i) => (
        <Col xs={24} sm={12} lg={6} key={i}>
          <Card bordered={false} className="rc-stat-card">
            <div className="rc-stat-left-border" />
            <div className="rc-stat-content">
              <div className="rc-stat-title">{item.title}</div>
              <div className="rc-stat-value">{item.value}</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}