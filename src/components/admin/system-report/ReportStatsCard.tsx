import React from "react";
import { Row, Col, Typography } from "antd";
import {
  BarChartOutlined,
  TeamOutlined,
  FileTextOutlined,
  HeartFilled,
  CheckCircleFilled,
  WarningFilled,
  ArrowUpOutlined,
  ArrowDownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import "@/style/admin/SystemReport.model.css";

const { Title, Text } = Typography;

const stats = [
  {
    title: "TỔNG BẦU CỬ",
    value: 48,
    change: 12,
    changeType: "increase",
    icon: <BarChartOutlined />,
    iconColor: "#22c55e",
    iconBg: "#dcfce7",
  },
  {
    title: "TỔNG CỬ TRI",
    value: "15,432",
    change: 8.5,
    changeType: "increase",
    icon: <TeamOutlined />,
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
  },
  {
    title: "TỶ LỆ THAM GIA",
    value: "87.3%",
    change: 3.2,
    changeType: "increase",
    icon: <FileTextOutlined />,
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
  },
  {
    title: "PHIẾU BẦU",
    value: "13,472",
    change: 15,
    changeType: "increase",
    icon: <HeartFilled />,
    iconColor: "#f472b6",
    iconBg: "#fce7f3",
  },
  {
    title: "NGƯỜI DÙNG HOẠT ĐỘNG",
    value: "1,248",
    change: 0,
    changeType: "no-change",
    icon: <CheckCircleFilled />,
    iconColor: "#22c55e",
    iconBg: "#dcfce7",
  },
  {
    title: "LỖI HỆ THỐNG",
    value: 3,
    change: 70,
    changeType: "decrease",
    icon: <WarningFilled />,
    iconColor: "#dc2626",
    iconBg: "#fee2e2",
  },
];

const ReportStatsCard: React.FC = () => {
  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return <ArrowUpOutlined />;
      case "decrease":
        return <ArrowDownOutlined />;
      default:
        return <RightOutlined />;
    }
  };

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case "increase":
        return "#22c55e";
      case "decrease":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="report-stats-container">
      <Row gutter={[0, 20]} className="stats-row">
        {stats.map((item, index) => (
          <Col 
            key={index} 
            xs={24} 
            sm={12} 
            md={8}
            className="stats-col"
          >
            <div 
              className="report-stat-card"
              style={{ 
                borderLeft: `4px solid ${item.iconColor}`,
                paddingLeft: '16px'
              }}
            >
              <Text className="report-stat-title">{item.title}</Text>
              <div className="report-stat-icon-wrapper" style={{ backgroundColor: item.iconBg }}>
                <div className="report-stat-icon" style={{ color: item.iconColor }}>
                  {item.icon}
                </div>
              </div>
              <Title level={2} className="report-stat-value">
                {item.value}
              </Title>
              <div
                className="report-stat-change"
                style={{ color: getTrendColor(item.changeType) }}
              >
                {getTrendIcon(item.changeType)}{" "}
                {item.change > 0
                  ? `${item.change}% so với tháng trước`
                  : item.change < 0
                  ? `${item.change}% so với tháng trước`
                  : `${item.change}% không thay đổi`}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default ReportStatsCard;
