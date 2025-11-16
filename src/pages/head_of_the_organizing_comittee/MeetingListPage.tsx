import React, { useState, useMemo, useEffect } from "react";
import { Button, Input, Space, Card, Pagination, message, Spin } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useSearchParams, useNavigate } from "react-router-dom";
import MeetingFilterBar from "../../components/head_of_the_organizing_committee/meeting_list/MeetingFilterBar";
import MeetingTable from "../../components/head_of_the_organizing_committee/meeting_list/MeetingTable";
import CreateMeetingModal from "../../components/head_of_the_organizing_committee/meeting_list/CreateMeetingModal";
import MeetingService from "@/services/MeetingService";
import { BaseResponse } from "@/types/BaseResponse.interface";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "upcoming" | "active" | "ended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasExistingMeeting, setHasExistingMeeting] = useState(false);
  const pageSize = 5;

  // Lấy cuộc bầu cử từ localStorage
  const currentElectionId = localStorage.getItem("currentElectionId") || "";

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response: BaseResponse<any> = await MeetingService.getByElectionId(currentElectionId);
      
      if (response.success && response.data) {
        const meetingsData = Array.isArray(response.data) ? response.data : [];
        
        // Map dữ liệu từ API sang format Meeting
        const mappedMeetings: Meeting[] = meetingsData.map((m: any) => ({
          id: String(m._id),
          name: m.title || "",
          description: m.description || "",
          time: m.meetingDate ? new Date(m.meetingDate).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }) : "",
          location: m.location || "",
          participants: m.participants || 0,
          status: mapStatusToMeetingStatus(m.status),
        }));
        
        setMeetings(mappedMeetings);
        
        // Kiểm tra xem đã có meeting chưa (mỗi cuộc bầu cử chỉ có 1 meeting)
        setHasExistingMeeting(mappedMeetings.length > 0);
      } else {
        message.error(response.message || "Không thể tải danh sách cuộc họp");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách cuộc họp:", error);
      message.error(error?.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách cuộc họp");
    } finally {
      setLoading(false);
    }
  };

  // Map status từ backend sang format Meeting
  const mapStatusToMeetingStatus = (status: string): "upcoming" | "active" | "ended" => {
    const statusMap: Record<string, "upcoming" | "active" | "ended"> = {
      "SCHEDULED": "upcoming",
      "UPCOMING": "upcoming",
      "PENDING": "upcoming",
      "ACTIVE": "active",
      "IN_PROGRESS": "active",
      "ENDED": "ended",
      "COMPLETED": "ended",
      "CANCELLED": "ended",
    };
    return statusMap[status] || "upcoming";
  };

  // Load danh sách meetings từ API
  useEffect(() => {
    if (currentElectionId) {
      fetchMeetings();
    } else {
      setLoading(false);
      message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentElectionId]);

  // Kiểm tra query param để tự động mở modal
  useEffect(() => {
    const openModal = searchParams.get("openModal");
    if (openModal === "true") {
      setIsCreateModalOpen(true);
      // Xóa query param sau khi mở modal
      searchParams.delete("openModal");
      navigate(`/head_of_the_Organizing_committee/list_meeting?${searchParams.toString()}`, { replace: true });
    }
  }, [searchParams, navigate]);

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
            onClick={() => setIsCreateModalOpen(true)}
            disabled={hasExistingMeeting} // Disable nếu đã có meeting
            title={hasExistingMeeting ? "Mỗi cuộc bầu cử chỉ có thể tạo 1 cuộc họp" : ""}
          >
            Tạo Cuộc họp mới
          </Button>
        </div>
      </Card>

      {/* ===== Table + Pagination cùng Card ===== */}
      <Card className="meeting-table-card" bordered={false}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        ) : (
          <MeetingTable meetings={paginated} rowSelection={rowSelection} />
        )}

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

      {/* Modal tạo cuộc họp mới */}
      <CreateMeetingModal
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          // Reload lại danh sách cuộc họp sau khi tạo thành công
          fetchMeetings();
        }}
      />
    </div>
  );
}
