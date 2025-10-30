import { Tag } from "antd";

interface Props {
  status: "upcoming" | "active" | "ended";
}

export default function MeetingStatusTag({ status }: Props) {
  const styleMap = {
    upcoming: { color: "#1677ff", bg: "#e6f4ff", text: "Sắp diễn ra" },
    active: { color: "#ff4d4f", bg: "#fff1f0", text: "Đang hoạt động" },
    ended: { color: "#595959", bg: "#f5f5f5", text: "Đã kết thúc" },
  }[status];

  return (
    <Tag
      color={styleMap.bg}
      style={{ color: styleMap.color, fontWeight: 600, borderRadius: 6 }}
    >
      {styleMap.text}
    </Tag>
  );
}
