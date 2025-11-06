import { Card, Col, Row, Typography } from "antd";
import {
  DatabaseOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import "@/style/admin/ManagementData.model.css";

const { Text } = Typography;

const DataStats = () => {
  const stats = [
    {
      icon: <DatabaseOutlined style={{ fontSize: 28, color: "#2ecc71" }} />,
      title: "2.4 GB",
      desc: "Dung lượng sử dụng",
      sub: "Hoạt động tốt (65% capacity)",
      color: "#16a34a",
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 28, color: "#ffcc00" }} />,
      title: "127ms",
      desc: "Thời gian phản hồi TB",
      sub: "Hiệu năng tốt",
      color: "#ca8a04",
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 28, color: "#ff8c00" }} />,
      title: "8h",
      desc: "Sao lưu lần cuối cùng",
      sub: "Cần sao lưu",
      color: "#f97316",
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 28, color: "#16a34a" }} />,
      title: "99.9%",
      desc: "Tỷ lệ bảo mật",
      sub: "An toàn",
      color: "#15803d",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {stats.map((item, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            bordered={false}
            className="stat-card"
            style={{
              borderTop: `4px solid ${item.color}`,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {item.icon}
              <div>
                <Text strong style={{ fontSize: 18 }}>{item.title}</Text>
                <div style={{ fontSize: 13, color: "#333" }}>{item.desc}</div>
                <div style={{ fontSize: 12, color: "#65a30d" }}>{item.sub}</div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DataStats;
