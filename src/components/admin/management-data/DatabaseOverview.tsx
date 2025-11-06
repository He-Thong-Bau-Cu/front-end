import { Card, Col, Row, Button, Typography } from "antd";
import {
  TeamOutlined,
  PieChartOutlined,
  FileProtectOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "@/style/admin/ManagementData.model.css";

const { Text } = Typography;

const DatabaseOverview = () => {
  const databasesTop = [
    { icon: <TeamOutlined />, name: "Người dùng", records: "1,234", time: "2h", size: "156 MB" },
    { icon: <PieChartOutlined />, name: "Bầu cử", records: "24", time: "1h", size: "45 MB" },
    { icon: <FileProtectOutlined />, name: "Phiếu bầu", records: "25,678", time: "30m", size: "892 MB" },
    { icon: <BarChartOutlined />, name: "Phân tích", records: "5,432", time: "15m", size: "234 MB" },
  ];

  const databaseBottom = [
    { icon: <ClockCircleOutlined />, name: "Nhật ký", records: "12,345", time: "5m", size: "567 MB" },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span role="img" aria-label="folder">📁</span>
          <strong>Tổng quan cơ sở dữ liệu</strong>
        </div>
      }
      extra={
        <Button icon={<ReloadOutlined />} className="refresh-btn">
          Làm mới
        </Button>
      }
      className="database-card"
      bodyStyle={{ padding: "16px 24px 20px 24px" }} // 👈 thêm padding trong
    >
      {/* Hàng trên 4 card */}
      <Row gutter={[16, 16]} style={{ marginBottom: "12px" }}>
        {databasesTop.map((item, i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
            <Card bordered={false} hoverable className="db-item">
              <div className="db-left">
                <div className="db-icon">{item.icon}</div>
                <div className="db-info">
                  <Text strong className="db-name">{item.name}</Text>
                  <p className="db-records">{item.records} records</p>
                  <p className="db-updated">Last updated: {item.time} ago</p>
                </div>
              </div>
              <div className="db-size">{item.size}</div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Hàng dưới 1 card */}
      <Row gutter={[16, 16]}>
        {databaseBottom.map((item, i) => (
          <Col xs={24} sm={12} md={8} lg={6} key={i}>
            <Card bordered={false} hoverable className="db-item">
              <div className="db-left">
                <div className="db-icon">{item.icon}</div>
                <div className="db-info">
                  <Text strong className="db-name">{item.name}</Text>
                  <p className="db-records">{item.records} records</p>
                  <p className="db-updated">Last updated: {item.time} ago</p>
                </div>
              </div>
              <div className="db-size">{item.size}</div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default DatabaseOverview;
