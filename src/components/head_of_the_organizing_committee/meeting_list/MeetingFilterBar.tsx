import { Button, Space } from "antd";

interface Props {
  filter: "all" | "upcoming" | "active" | "ended";
  setFilter: (f: "all" | "upcoming" | "active" | "ended") => void;
}

export default function MeetingFilterBar({ filter, setFilter }: Props) {
  return (
    <Space className="meeting-filters">
      <Button
        className={filter === "all" ? "filter-btn-active" : "filter-btn"}
        onClick={() => setFilter("all")}
      >
        Tất cả
      </Button>
      <Button
        className={filter === "upcoming" ? "filter-btn-active" : "filter-btn"}
        onClick={() => setFilter("upcoming")}
      >
        Sắp diễn ra
      </Button>
      <Button
        className={filter === "active" ? "filter-btn-active" : "filter-btn"}
        onClick={() => setFilter("active")}
      >
        Đang hoạt động
      </Button>
      <Button
        className={filter === "ended" ? "filter-btn-active" : "filter-btn"}
        onClick={() => setFilter("ended")}
      >
        Đã kết thúc
      </Button>
    </Space>
  );
}
