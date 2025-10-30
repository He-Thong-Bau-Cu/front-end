import React, { useState, useMemo } from "react";
import { Button, Input, Space, Card, Pagination } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MeetingFilterBar from "../../components/head_of_the_organizing_committee/meeting_list/MeetingFilterBar";
import MeetingTable from "../../components/head_of_the_organizing_committee/meeting_list/MeetingTable";
import "../../style/head-of-the-organizing-committee/MeetingList.model.css";
import { Meeting } from "@/types/Meeting.interface";

/* ======= Hàm xóa dấu tiếng Việt ======= */
const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
};

export default function MeetingListPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "ended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const pageSize = 5;

  const meetings: Meeting[] = [
    {
      id: "1",
      name: "Bầu cử Hội đồng Quản trị 2025",
      description: "Bầu thành viên HĐQT nhiệm kỳ mới",
      time: "09:00, 15/11/2025",
      location: "Hội trường lớn, Trụ sở chính",
      participants: 150,
      status: "upcoming",
    },
    {
      id: "2",
      name: "Họp bất thường về Kế hoạch Sáp nhập",
      description: "Thảo luận và bỏ phiếu tín nhiệm",
      time: "14:00, 20/10/2025",
      location: "Trực tuyến",
      participants: 25,
      status: "active",
    },
    {
      id: "3",
      name: "Tổng kết Kinh doanh Quý 3",
      description: "Báo cáo và định hướng Q4",
      time: "09:00, 05/10/2025",
      location: "Phòng họp A, Tầng 5",
      participants: 15,
      status: "ended",
    },
  ];

  /* ======= Bộ lọc dữ liệu ======= */
  const filteredMeetings = useMemo(() => {
    const query = removeVietnameseTones(search.toLowerCase());
    return meetings.filter((m) => {
      const matchSearch =
        removeVietnameseTones(m.name.toLowerCase()).includes(query) ||
        removeVietnameseTones(m.description.toLowerCase()).includes(query);
      const matchFilter = filter === "all" ? true : m.status === filter;
      return matchSearch && matchFilter;
    });
  }, [search, filter, meetings]);

  const paginated = filteredMeetings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  /* ======= Row Selection ======= */
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <div className="meeting-page">
      {/* ===== Thanh lọc & tìm kiếm ===== */}
      <Card className="meeting-filter-card" bordered={false}>
        <div className="filter-card-content">
          <Space className="filter-left" size="middle">
            <Input.Search
              placeholder="Tìm kiếm theo tên cuộc họp..."
              className="meeting-search"
              value={search}
              onChange={(e) => {
                setCurrentPage(1);
                setSearch(e.target.value);
              }}
            />
            <MeetingFilterBar filter={filter} setFilter={setFilter} />
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="meeting-add-btn"
          >
            Tạo Cuộc họp mới
          </Button>
        </div>
      </Card>

      {/* ===== Table + Pagination cùng Card ===== */}
      <Card className="meeting-table-card" bordered={false}>
        <MeetingTable meetings={paginated} rowSelection={rowSelection} />

        <div className="meeting-footer">
          Hiển thị {(currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredMeetings.length)} trên{" "}
          {filteredMeetings.length}
        </div>

        <div className="meeting-pagination-inline">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredMeetings.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </Card>
    </div>
  );
}
