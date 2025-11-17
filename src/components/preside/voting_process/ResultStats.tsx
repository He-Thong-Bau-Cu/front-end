import { Card, Row, Col, Typography } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  SolutionOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import "../../../style/preside/ElectionResults.model.css";

const { Text } = Typography;

const ResultStats = ({ stats }: any) => {
  const items = [
    {
      icon: <UserOutlined />,
      label: "Tổng cử tri",
      value: stats.totalVoters.toLocaleString(),
      color: "#1890ff",
    },
    {
      icon: <TeamOutlined />,
      label: "Đã bỏ phiếu",
      value: stats.voted.toLocaleString(),
      color: "#52c41a",
    },
    {
      icon: <SolutionOutlined />,
      label: "Chưa bỏ phiếu",
      value: stats.notVoted.toLocaleString(),
      color: "#faad14",
    },
    {
      icon: <LineChartOutlined />,
      label: "Tỷ lệ tham gia",
      value: `${stats.percent.toFixed(2)}%`,
      color: "#722ed1",
    },
  ];

  return (
    <Row gutter={[16, 16]} justify="space-between">
      {items.map((item, i) => (
        <Col xs={24} sm={12} md={12} lg={6} key={i}>
          <Card className="stat-card">
            <div className="stat-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <div className="stat-info">
              <Text className="stat-label">{item.label}</Text>
              <div className="stat-number">{item.value}</div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ResultStats;
