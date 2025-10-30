import React from "react";
import { Card, Typography } from "antd";
import {
  HistoryOutlined,
  PlayCircleFilled,
  TeamOutlined,
  MailFilled,
} from "@ant-design/icons";
import "../../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title } = Typography;

export interface ActivityItem {
  id: string;
  /** Loại hoạt động để hiển thị icon */
  type?: "start" | "group" | "notify";
  /** Nội dung có thể chứa <strong> để bôi đậm giống ảnh */
  content: React.ReactNode;
}

interface RecentActivityProps {
  items: ActivityItem[];
}

const renderIcon = (type?: ActivityItem["type"]) => {
  switch (type) {
    case "start":
      return <PlayCircleFilled className="activity-bullet" />;
    case "group":
      return <TeamOutlined className="activity-bullet" />;
    case "notify":
      return <MailFilled className="activity-bullet" />;
    default:
      return <PlayCircleFilled className="activity-bullet" />;
  }
};

export default function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Card className="elevated activity-card" bodyStyle={{ padding: 0 }}>
      {/* Header với icon và đường kẻ mảnh */}
      <div className="activity-header activity-header--with-divider">
        <HistoryOutlined className="activity-headicon" />
        <Title level={5} className="activity-title">
          Hoạt động gần đây
        </Title>
      </div>

      {/* Danh sách hoạt động */}
      <div className="activity-body">
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`activity-row ${
              idx !== 0 ? "activity-row--with-divider" : ""
            }`}
          >
            {renderIcon(item.type)}
            <div className="activity-text">{item.content}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
