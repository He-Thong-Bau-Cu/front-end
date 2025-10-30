import React, { useMemo, useState } from "react";
import { Card } from "antd";
import NotificationHeader from "../../components/secretary/notifycation-center/NotificationHeader";
import NotificationSection from "../../components/secretary/notifycation-center/NotificationSection";
import { NotificationSectionData } from "../../types/NotificationCenter.interface";
import "../../style/secretary/NotificationCenter.model.css";
export default function NotificationCenterPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "system">("all");

  // ==== DỮ LIỆU THÔNG BÁO ====
  const [data, setData] = useState<NotificationSectionData[]>([
    {
      title: "HÔM NAY",
      items: [
        {
          id: "1",
          iconType: "success",
          title: "Chủ tọa đã phê duyệt yêu cầu ủy quyền UQ-003/2025 của bạn.",
          time: "5 phút trước",
          isUnread: true,
        },
        {
          id: "2",
          iconType: "info",
          title: "Cuộc bầu cử HĐQT 2025 sẽ kết thúc sau 24 giờ nữa.",
          time: "1 giờ trước",
          isUnread: true,
        },
        {
          id: "3",
          iconType: "mention",
          title:
            'Trần Thị B đã nhắc đến bạn trong tài liệu “Kế hoạch kinh doanh Q4”.',
          time: "3 giờ trước",
          isUnread: false,
        },
      ],
    },
    {
      title: "HÔM QUA",
      items: [
        {
          id: "4",
          iconType: "system",
          title:
            "Hệ thống sẽ được bảo trì theo lịch vào lúc 2:00 AM ngày 15/10/2025.",
          time: "14/10/2025",
          isUnread: true,
        },
        {
          id: "5",
          iconType: "error",
          title: "Chủ tọa đã từ chối yêu cầu ủy quyền UQ-004/2025 của bạn.",
          time: "14/10/2025",
          isUnread: false,
        },
      ],
    },
  ]);

  // ==== FILTER LOGIC ====
  const filteredSections = useMemo(() => {
    if (filter === "all") return data;
    if (filter === "unread") {
      return data
        .map((sec) => ({
          ...sec,
          items: sec.items.filter((i) => i.isUnread),
        }))
        .filter((sec) => sec.items.length > 0);
    }
    if (filter === "system") {
      return data
        .map((sec) => ({
          ...sec,
          items: sec.items.filter((i) => i.iconType === "system"),
        }))
        .filter((sec) => sec.items.length > 0);
    }
    return data;
  }, [filter, data]);

  // ==== MARK ALL AS READ ====
  const handleMarkAllAsRead = () => {
    const updated = data.map((sec) => ({
      ...sec,
      items: sec.items.map((item) => ({ ...item, isUnread: false })),
    }));
    setData(updated);
  };

  return (
    <div className="nc-page">
      <Card className="nc-card" bordered={false}>
        <NotificationHeader
          filter={filter}
          setFilter={setFilter}
          onMarkAllAsRead={handleMarkAllAsRead} // ✅ truyền hàm
        />

        {filteredSections.map((sec) => (
          <NotificationSection key={sec.title} section={sec} />
        ))}
      </Card>
    </div>
  );
}