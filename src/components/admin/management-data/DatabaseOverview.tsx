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
          <strong style={{ fontSize: 22.5 }}>Tổng quan cơ sở dữ liệu</strong>
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
                <div className="db-icon" style={{fontSize: 33} }>{item.icon}</div>

                <div className="db-info">
                  {/* Hàng 1: tiêu đề */}
                  <Text strong className="db-name" style={{fontSize: 16}}>{item.name}</Text>

                  {/* Hàng 2: số liệu + last updated + size */}
                  <div className="db-row">
                    <div className="db-col">
                      <span className="db-number" style={{fontSize: 14}}>{item.records}</span>
                    </div>
                    <div className="db-col dot" style={{fontSize: 14}}>•</div>
                    <div className="db-col">
                      <span className="db-updated-label" >Last updated:</span>
                    </div>
                    <div className="db-col size">{item.size}</div>
                  </div>

                  {/* Hàng 3: đơn vị + thời gian */}
                  <div className="db-row">
                    <div className="db-col" style={{fontSize: 14}}>
                      <span className="db-unit">records</span>
                    </div>
                    <div className="db-col"></div>
                    <div className="db-col">
                      <span className="db-updated-time" style={{fontSize: 14}}>{item.time} ago</span>
                    </div>
                  </div>
                </div>
              </div>
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
                  {/* Hàng 1: tiêu đề */}
                  <Text strong className="db-name">{item.name}</Text>

                  {/* Hàng 2: số liệu + last updated + size */}
                  <div className="db-row">
                    <div className="db-col">
                      <span className="db-number">{item.records}</span>
                    </div>
                    <div className="db-col dot">•</div>
                    <div className="db-col">
                      <span className="db-updated-label">Last updated:</span>
                    </div>
                    <div className="db-col size">{item.size}</div>
                  </div>

                  {/* Hàng 3: đơn vị + thời gian */}
                  <div className="db-row">
                    <div className="db-col">
                      <span className="db-unit">records</span>
                    </div>
                    <div className="db-col"></div>
                    <div className="db-col">
                      <span className="db-updated-time">{item.time} ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default DatabaseOverview;
