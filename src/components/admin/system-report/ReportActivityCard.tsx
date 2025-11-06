import React from "react";
import { Card, Typography } from "antd";
import {
  CheckCircleFilled,
  WarningFilled,
  FileTextOutlined,
  UserOutlined,
  HeartFilled,
  StarOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import "../../../style/admin/SystemReport.model.css";

const { Text } = Typography;

const activities = [
  {
    icon: <CheckCircleFilled />,
    iconColor: "#22c55e",
    iconBg: "#dcfce7",
    title: "Bầu cử hoàn thành",
    desc: '"Bầu cử lớp trưởng K18" đã kết thúc thành công',
    time: "5 phút trước",
  },
  {
    icon: <UserOutlined />,
    iconColor: "#3b82f6",
    iconBg: "#dbeafe",
    title: "Người dùng mới",
    desc: "124 cử tri mới đăng ký tham gia hệ thống",
    time: "1 giờ trước",
  },
  {
    icon: <FileTextOutlined />,
    iconColor: "#f59e0b",
    iconBg: "#fef3c7",
    title: "Báo cáo được tạo",
    desc: "Báo cáo tháng 3/2024 đã được xuất thành công",
    time: "2 giờ trước",
  },
  {
    icon: <HeartFilled />,
    iconColor: "#f472b6",
    iconBg: "#fce7f3",
    title: "Bầu cử mới",
    desc: '"Bầu BCH Khoa CNTT" đã được tạo và kích hoạt',
    time: "3 giờ trước",
  },
  {
    icon: <WarningFilled />,
    iconColor: "#dc2626",
    iconBg: "#fee2e2",
    title: "Cảnh báo hệ thống",
    desc: "Load cao phát hiện, đã xử lý tự động",
    time: "5 giờ trước",
  },
];

const ReportActivityCard: React.FC = () => {
  return (
    <Card
      className="report-activity-card"
      bordered={false}
      title={
        <div className="report-activity-card-header">
          <div className="report-activity-card-title">
            <StarOutlined className="report-activity-card-title-icon" />
            Hoạt động gần đây
          </div>
          <ReloadOutlined className="report-activity-card-refresh-icon" />
        </div>
      }
    >
      <div className="report-activity-list">
        {activities.map((item, index) => (
          <div key={index} className="report-activity-item">
            <div
              className="report-activity-icon-wrapper"
              style={{ backgroundColor: item.iconBg }}
            >
              <div className="report-activity-icon" style={{ color: item.iconColor }}>
                {item.icon}
              </div>
            </div>
            <div className="report-activity-content">
              <Text strong className="report-activity-title">
                {item.title}
              </Text>
              <Text type="secondary" className="report-activity-desc">
                {item.desc}
              </Text>
            </div>
            <Text type="secondary" className="report-activity-time">
              {item.time}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ReportActivityCard;
