import React, { useState } from "react";
import { Badge, List, Avatar, Button, Typography, Empty, Tooltip, message } from "antd";
import { BellOutlined } from "@ant-design/icons";
import NotificationService from "@/services/NotificationService";
import { useNotification } from "@/contexts/NotificationContext";

const { Text } = Typography;

export interface INotification {
  _id: string;
  message: string;
  time?: string;
  read: boolean;
}

interface NotificationDropdownProps {
  userId?: string;
  notifications: INotification[];
  setNotifications: React.Dispatch<React.SetStateAction<INotification[]>>;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  userId,
  notifications,
  setNotifications,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;
  const [loading, setLoading] = useState(false);
  const {notify} = useNotification();

  const handleReadAllNotifications = async () => {
    try {
      setLoading(true);
      const body = { userId };
      const response = await NotificationService.markReadAll(body);

      if (response.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } else {
        notify(response.message || "Không thể đánh dấu đã đọc tất cả", "error");
      }
    } catch (e: any) {
      console.log(e.message);
    }finally {
      setLoading(false);
    }
  };

  const handleDeleteAllNotification = async () => {
    try {
      setLoading(true);
      const body = { userId };
      const response = await NotificationService.deleteAllNotifications(body);

      if (response.success) {
        setNotifications([]);
      } else {
        notify(response.message || "Không thể xóa tất cả thông báo", "error");
      }
    } catch (e: any) {
      console.log(e.message);
    }finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (item: INotification) => {
    try {
      const body = {
        userId,
        notificationId: item._id,
      };

      const response = await NotificationService.markReadOne(body);

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      } else {
        message.error(response.message || "Không thể đánh dấu thông báo là đã đọc");
      }
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <div style={{ minWidth: 340, maxWidth: 400, padding: 0 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(124, 179, 66, 0.2)",
          background: "linear-gradient(135deg, rgba(232, 245, 233, 0.95) 0%, rgba(241, 248, 244, 0.95) 100%)",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 16, color: "#124d2d" }}>
          <BellOutlined style={{ color: "#7cb342", marginRight: 8 }} /> Thông báo
        </span>

        <Tooltip title="Đánh dấu tất cả là đã đọc">
          <Button
            size="small"
            type="link"
            onClick={handleReadAllNotifications}
            disabled={unreadCount === 0}
            style={{ color: "#7cb342" }}
          >
            Đánh dấu đã đọc tất cả
          </Button>
        </Tooltip>
      </div>

      <div style={{ maxHeight: 350, overflowY: "auto" }}>
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo" style={{ margin: "32px 0" }} />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            loading={loading}
            renderItem={(item) => (
              <List.Item
                style={{
                  background: item.read ? "#fff" : "rgba(232, 245, 233, 0.5)",
                  cursor: "pointer",
                  borderLeft: item.read
                    ? "4px solid transparent"
                    : "4px solid #7cb342",
                  paddingLeft: 12,
                  transition: "all 0.2s ease",
                }}
                onClick={() => handleNotificationClick(item)}
                onMouseEnter={(e) => {
                  if (item.read) {
                    e.currentTarget.style.background = "#f5f5f5";
                  } else {
                    e.currentTarget.style.background = "rgba(232, 245, 233, 0.8)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.read) {
                    e.currentTarget.style.background = "#fff";
                  } else {
                    e.currentTarget.style.background = "rgba(232, 245, 233, 0.5)";
                  }
                }}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      style={{
                        background: item.read
                          ? "linear-gradient(135deg, #bdbdbd 0%, #9e9e9e 100%)"
                          : "linear-gradient(135deg, #7cb342 0%, #558b2f 100%)",
                      }}
                      icon={<BellOutlined />}
                    />
                  }
                  title={<Text strong={!item.read}>{item.message}</Text>}
                  description={
                    <span style={{ fontSize: 12, color: "#888" }}>
                      {item.time || ""}
                    </span>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {notifications.length > 0 && (
        <div
          style={{
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, rgba(232, 245, 233, 0.95) 0%, rgba(241, 248, 244, 0.95) 100%)",
            borderTop: "1px solid rgba(124, 179, 66, 0.2)",
          }}
        >
          <Tooltip title="Xóa tất cả thông báo">
            <Button
              size="small"
              type="link"
              danger
              onClick={handleDeleteAllNotification}
              style={{
                fontSize: 13,
                height: 20,
                padding: "0 6px",
              }}
            >
              Xóa tất cả
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
