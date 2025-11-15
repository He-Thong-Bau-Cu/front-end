import { Row, Col } from "antd";
import HeaderOverview from "../../components/head_of_the_organizing_committee/dashboard/HeaderOverview";
import StatCard from "../../components/head_of_the_organizing_committee/dashboard/StatCard";
import EventProgress from "../../components/head_of_the_organizing_committee/dashboard/EventProgress";
import TaskAssignments from "../../components/head_of_the_organizing_committee/dashboard/TaskAssignments";
import RecentActivity from "../../components/head_of_the_organizing_committee/dashboard/RecentActivity";
import UpcomingEvents from "../../components/head_of_the_organizing_committee/dashboard/UpcomingEvents";
import "../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";
import { OrganizerUser } from "@/types/Organizer.interface";
import { StatCardData } from "@/types/Organizer.interface";
import { EventProgressData } from "@/types/Organizer.interface";
import { TaskItem } from "@/types/Organizer.interface";
import { ActivityItem } from "@/types/Organizer.interface";
import { UpcomingEvent } from "@/types/Organizer.interface";
import { useNavigate } from "react-router-dom";
// =============================
// 🧭 COMPONENT PAGE
// =============================

export default function OrganizerDashboardPage() {
  const navigate = useNavigate();
  
  const user: OrganizerUser = {
    name: "Nhân viên Lưu Hồng Nhật",
    role: "Trưởng ban tổ chức Hội đồng Bầu cử khóa 10",
  };

  const handleCreateMeeting = () => {
    // Navigate sang trang danh sách cuộc họp với query param để mở modal
    navigate("/head_of_the_Organizing_committee/list_meeting?openModal=true");
  };

  const stats: StatCardData[] = [
    { label: "Sự kiện Sắp diễn ra", value: 2 },
    { label: "Sự kiện Đang hoạt động", value: 1, highlight: true },
    { label: "Tổng số Đại biểu/Cử tri", value: 150 },
    { label: "Vấn đề cần xử lý", value: 0 },
  ];

  const progress: EventProgressData = {
    title: "Bầu cử Hội đồng Quản trị 2025",
    checkinPercent: 65,
    votePercent: 45,
    checkinText: "98 / 150 đã check-in",
    voteText: "68 / 150 đã bỏ phiếu",
  };


  const tasks: TaskItem[] = [
    { id: "t1", label: "Chuẩn bị tài liệu cho cuộc họp BKS", variant: "checkbox" },
    { id: "t2", label: "Gửi email nhắc nhở lần 2", variant: "checkbox" },
    { id: "t3", label: "Setup bàn check-in", variant: "square", done: true, squareColor: "#1677ff" },
  ];


  const activities: ActivityItem[] = [
    { id: "a1", content: 'Bạn đã Bắt đầu sự kiện "Bầu cử HĐQT 2025".', type: "start" },
    { id: "a2", content: "5 đại biểu mới vừa check-in thành công.", type: "group" },
    { id: "a3", content: "Bạn đã gửi thông báo hệ thống.", type: "notify" },
  ];

  const upcoming: UpcomingEvent[] = [
    {
      id: "u1",
      name: "Bầu cử Ban kiểm soát 2025",
      time: "Bắt đầu: 10:00 - 15/11/2025",
      status: "Chưa bắt đầu",
      linkText: "Chuẩn bị",
    },
    {
      id: "u2",
      name: "Họp bất thường về Kế hoạch sáp nhập",
      time: "Bắt đầu: 09:00 - 20/11/2025",
      status: "Chưa bắt đầu",
      linkText: "Chuẩn bị",
    },
  ];

  return (
    <div className="organizer-wrap">
      {/* Header */}
      <HeaderOverview
        userName={user.name}
        userNote={user.role}
        onCreateMeeting={handleCreateMeeting}
      />

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {stats.map((s, i) => (
          <Col xs={24} md={12} lg={6} key={i}>
            <StatCard {...s} />
          </Col>
        ))}
      </Row>

      {/* Progress + tasks */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <EventProgress
            eventTitle={progress.title}
            checkinPercent={progress.checkinPercent}
            votePercent={progress.votePercent}
            checkinText={progress.checkinText}
            voteText={progress.voteText}
          />
          <div style={{ height: 16 }} />
          <UpcomingEvents events={upcoming} />
        </Col>

        <Col xs={24} lg={8}>
          <TaskAssignments tasks={tasks} />
          <div style={{ height: 16 }} />
          <RecentActivity items={activities} />
        </Col>
       
      </Row>

    </div>
  );
}
