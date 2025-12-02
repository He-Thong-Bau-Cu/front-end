import { Row, Col, Spin, message, Card, Typography, Statistic } from "antd";
import { useEffect, useState } from "react";
import { Pie, Column } from "@ant-design/plots";
import {
  UserOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import MeetingService from "@/services/MeetingService";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import BallotService from "@/services/BallotService";
import OrganizerInfo from "../../components/head_of_the_organizing_committee/dashboard/OrganizerInfo";
import "../../style/head-of-the-organizing-committee/OrganizerDashboard.model.css";

const { Title } = Typography;

interface DashboardStats {
  totalAttendees: number;
  checkedIn: number;
  voted: number;
  participationRate: number;
}

export default function OrganizerDashboardPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalAttendees: 0,
    checkedIn: 0,
    voted: 0,
    participationRate: 0,
  });

  const loadDashboardData = async (electionId: string) => {
    try {
      setLoading(true);

      // Lấy meeting của election
      const meetingResponse = await MeetingService.getByElectionId(electionId);
      let meeting = meetingResponse?.data || meetingResponse;

      // Nếu là array, lấy phần tử đầu tiên
      if (Array.isArray(meeting)) {
        meeting = meeting[0];
      }

      if (!meeting || !meeting._id) {
        setStats({
          totalAttendees: 0,
          checkedIn: 0,
          voted: 0,
          participationRate: 0,
        });
        return;
      }

      // Lấy tất cả attendees
      const attendeesResponse = await MeetingAttendeeService.getByMeetingId(meeting._id);
      const attendees = attendeesResponse?.data?.content || attendeesResponse?.content || [];
      const totalAttendees = attendees.length;
      const checkedIn = attendees.filter((a: any) => a.attended === true).length;

      // Lấy tất cả ballots
      const ballotsResponse = await BallotService.getAllBallotsByElectionId(electionId);
      const ballots = ballotsResponse || [];
      const voted = ballots.filter((b: any) => b.status === "CAST").length;

      const participationRate =
        totalAttendees > 0 ? Math.round((checkedIn / totalAttendees) * 100) : 0;

      setStats({
        totalAttendees,
        checkedIn,
        voted,
        participationRate,
      });
    } catch (error: any) {
      console.error("Error loading dashboard data:", error);
      message.error("Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const electionId = localStorage.getItem("currentElectionId");
    if (electionId) {
      loadDashboardData(electionId);
    } else {
      message.warning("Vui lòng chọn cuộc bầu cử từ trang chủ");
    }
  }, []);

  // Data cho biểu đồ Pie - Check-in status
  const checkinChartData = [
    { type: "Đã check-in", value: stats.checkedIn },
    { type: "Chưa check-in", value: stats.totalAttendees - stats.checkedIn },
  ];

  // Data cho biểu đồ Pie - Vote status
  const voteChartData = [
    { type: "Đã bỏ phiếu", value: stats.voted },
    { type: "Chưa bỏ phiếu", value: stats.totalAttendees - stats.voted },
  ];

  // Data cho biểu đồ Column - So sánh
  const comparisonChartData = [
    { type: "Tổng đại biểu", value: stats.totalAttendees },
    { type: "Đã check-in", value: stats.checkedIn },
    { type: "Đã bỏ phiếu", value: stats.voted },
  ];

  const pieConfig = {
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    label: {
      type: "outer",
      content: "{name}: {value} ({percentage})",
    },
    interactions: [{ type: "element-active" }],
    color: ["#52c41a", "#d9d9d9"],
  };

  const columnConfig = {
    xField: "type",
    yField: "value",
    color: "#1677ff",
    label: {
      position: "top" as const,
      style: {
        fill: "#666",
      },
    },
  };

  const electionId = localStorage.getItem("currentElectionId");

  return (
    <div className="organizer-dashboard-wrap">
      {/* Organizer Info Header */}
      <div style={{
        marginLeft: -10,
        marginRight: -10,
        paddingLeft: 42,
        paddingRight: 42,
        marginBottom: 24,
        width: 'calc(100% + 20px)',
        boxSizing: 'border-box'
      }}>
        <OrganizerInfo />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <Spin size="large" />
        </div>
      ) : electionId ? (
        <>
          {/* Stats Cards */}
          <Row gutter={[20, 20]} className="stats-row">
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-item">
                <Statistic
                  title="Tổng đại biểu"
                  value={stats.totalAttendees}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-item">
                <Statistic
                  title="Đã check-in"
                  value={stats.checkedIn}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-item">
                <Statistic
                  title="Đã bỏ phiếu"
                  value={stats.voted}
                  prefix={<FileDoneOutlined />}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="stat-card-item">
                <Statistic
                  title="Tỷ lệ tham gia"
                  value={stats.participationRate}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          <Row gutter={[20, 20]} className="charts-row">
            <Col xs={24} lg={8}>
              <Card title="Trạng thái Check-in" bordered={false} className="chart-card">
                <Pie data={checkinChartData} {...pieConfig} height={250} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Trạng thái Bỏ phiếu" bordered={false} className="chart-card">
                <Pie data={voteChartData} {...pieConfig} height={250} />
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="So sánh" bordered={false} className="chart-card">
                <Column data={comparisonChartData} {...columnConfig} height={250} />
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Card>
          <div style={{ textAlign: "center", padding: "60px 0", color: "#999" }}>
            Vui lòng chọn cuộc bầu cử từ trang chủ để xem thống kê
          </div>
        </Card>
      )}
    </div>
  );
}
