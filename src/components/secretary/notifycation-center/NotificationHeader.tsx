import { Button, Space, Typography } from "antd";
const { Text } = Typography;

interface HeaderProps {
  filter: "all" | "unread" | "system";
  setFilter: (f: "all" | "unread" | "system") => void;
  onMarkAllAsRead: () => void; // ✅ thêm prop
}

export default function NotificationHeader({
  filter,
  setFilter,
  onMarkAllAsRead,
}: HeaderProps) {
  return (
    <div className="nc-header">
      <div className="nc-header-left">
        <Text className="nc-title">Trung tâm Thông báo</Text>

        <Space className="nc-filter-row">
          <Button
            className={`nc-filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            className={`nc-filter-btn ${filter === "unread" ? "active" : ""}`}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc
          </Button>
          <Button
            className={`nc-filter-btn ${filter === "system" ? "active" : ""}`}
            onClick={() => setFilter("system")}
          >
            Hệ thống
          </Button>
        </Space>
      </div>

      <Button
        type="text"
        className="nc-mark-all"
        onClick={onMarkAllAsRead} // ✅ gọi hàm đánh dấu
      >
        Đánh dấu tất cả là đã đọc
      </Button>
    </div>
  );
}
