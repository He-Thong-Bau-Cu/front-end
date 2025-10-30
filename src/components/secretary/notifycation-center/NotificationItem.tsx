import { Typography, Space } from "antd";
import {
  CheckCircleFilled,
  InfoCircleFilled,
  WarningFilled,
  CloseCircleFilled,
  CalendarFilled,
} from "@ant-design/icons";
import { NotificationItemData } from "../../../types/NotificationCenter.interface";

const { Text } = Typography;
export default function NotificationItem({ item }: { item: NotificationItemData }) {
  const renderIcon = () => {
    switch (item.iconType) {
      case "success":
        return <CheckCircleFilled style={{ color: "#52c41a" }} />;
      case "info":
        return <InfoCircleFilled style={{ color: "#1677ff" }} />;
      case "warning":
      case "mention":
        return <WarningFilled style={{ color: "#faad14" }} />;
      case "system":
        return <CalendarFilled style={{ color: "#597ef7" }} />;
      case "error":
        return <CloseCircleFilled style={{ color: "#ff4d4f" }} />;
      default:
        return <InfoCircleFilled />;
    }
  };

  return (
    <div
      className={`nc-item ${item.isUnread ? "nc-unread" : ""}`}
    >
      <Space align="start" className="nc-item-content">
        <div className="nc-icon">{renderIcon()}</div>
        <div className="nc-text">
          <Text className="nc-message">{item.title}</Text>
          <div className="nc-time">{item.time}</div>
        </div>
      </Space>
      <div className="nc-more">⋯</div>
    </div>
  );
}