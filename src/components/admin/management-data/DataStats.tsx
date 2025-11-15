import { Card, Col, Row, Typography } from "antd";
import {
  DatabaseOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import "@/style/admin/ManagementData.model.css";

const { Text } = Typography;

const DataStats = () => {
  const stats = [
    {
      icon: <DatabaseOutlined style={{ fontSize: 73, color: "#2ecc71" }} />,
      title: "2.4 GB",
      desc: "Dung lượng sử dụng",
      sub: "Hoạt động tốt (65% capacity)",
      subcolor: "#22c55e",
      subIcon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 73, color: "#ffcc00" }} />,
      title: "127ms",
      desc: "Thời gian phản hồi TB",
      sub: "Hiệu năng tốt",
      subcolor: "#22c55e",
      subIcon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
    {
      icon: <ClockCircleOutlined style={{ fontSize: 73, color: "#ff8c00" }} />,
      title: "8h",
      desc: "Sao lưu lần cuối cùng",
      sub: "Cần sao lưu",
      subcolor: "#f59e0b",
      subIcon: <ExclamationCircleOutlined style={{ color: "#f59e0b" }} />,
    },
    {
      icon: <SafetyCertificateOutlined style={{ fontSize: 73, color: "#16a34a" }} />,
      title: "99.9%",
      desc: "Tỷ lệ bảo mật",
      sub: "An toàn",
      subcolor: "#22c55e",
      subIcon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
  ];

  return (
    <Row gutter={[16, 16]} style={{ paddingTop: "30px" }}>
      {stats.map((item, index) => (
        <Col xs={24} sm={12} md={6} key={index}>
          <Card
            bordered={false}
            className="stat-card"
            style={{
              borderTop: `4px solid ${item.subcolor}`,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              padding: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {item.icon}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", lineHeight: 1.4 }}>
                <Text strong style={{ fontSize: 32, lineHeight: 1.2, color: "#000", marginBottom: 4 }}>{item.title}</Text>
                <div style={{ fontSize: 14.5, color: "#333", lineHeight: 1.4, marginBottom:2 }}>{item.desc}</div>
                <div style={{ fontSize: 13, color: item.subcolor, lineHeight: 1.4 }}>{item.subIcon} {item.sub}</div>
              </div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DataStats;
