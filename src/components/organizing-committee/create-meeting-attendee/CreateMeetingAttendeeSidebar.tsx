import { Card, Typography, List, Tag, Spin, Empty } from "antd";
import {
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
  HistoryOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import MeetingService from "@/services/MeetingService";
import dayjs from "dayjs";

const { Text } = Typography;

interface MeetingAttendee {
  _id: string;
  participantId: {
    userId: {
      fullName: string;
      username: string;
    };
  };
  attended: boolean;
  checkInTime: string;
}

const CreateMeetingAttendeeSidebar: React.FC<{ refreshTrigger?: number }> = ({ refreshTrigger }) => {
  const [meetingAttendees, setMeetingAttendees] = useState<MeetingAttendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, attended: 0 });

  useEffect(() => {
    fetchMeetingAttendees();
  }, [refreshTrigger]);

  const fetchMeetingAttendees = async () => {
    try {
      const meetingId = localStorage.getItem("currentMeetingId");
      if (!meetingId) {
        return;
      }

      setLoading(true);

      // Lấy thông tin cuộc họp
      try {
        const meetingResponse = await MeetingService.getById(meetingId);
        if (meetingResponse?.data) {
          setMeetingInfo(meetingResponse.data);
        }
      } catch (err) {
        console.warn("Không thể lấy thông tin cuộc họp:", err);
      }

      // Lấy danh sách người tham dự
      const response = await MeetingAttendeeService.getByMeetingId(meetingId);
      if (response?.success && response?.data) {
        const data = Array.isArray(response.data) ? response.data : [];
        setMeetingAttendees(data);
        
        // Tính thống kê
        const attended = data.filter((p: MeetingAttendee) => p.attended).length;
        setStats({
          total: data.length,
          attended: attended,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách người tham dự:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY | HH:mm");
  };

  return (
    <div className="checkin-sidebar">
      {/* Sự kiện */}
      <Card className="checkin-card">
        <h3 className="sidebar-title-qr">
          <CalendarOutlined /> Cuộc họp
        </h3>
        {meetingInfo ? (
          <>
            <p className="sidebar-event-name">
              {meetingInfo.electionId?.title || meetingInfo.electionId?.decisionName || "N/A"}
            </p>
            <p className="sidebar-event-time">
              {meetingInfo.meetingDate
                ? dayjs(meetingInfo.meetingDate).format("DD/MM/YYYY | HH:mm")
                : "N/A"}
            </p>
          </>
        ) : (
          <p className="sidebar-event-name">Chưa chọn cuộc họp</p>
        )}
      </Card>

      {/* Thống kê */}
      <Card className="checkin-card" bordered={false}>
        <h3 className="sidebar-title-qr">
          <BarChartOutlined /> Thống kê
        </h3>
        <p style={{ marginBottom: 0 }}>Đã thêm vào danh sách</p>
        <div style={{ marginTop: 8 }}>
          <Text strong style={{ fontSize: 18 }}>
            {stats.total}
          </Text>
          <Text style={{ marginLeft: 8, color: "#666" }}>
            / {stats.attended} đã check-in
          </Text>
        </div>
      </Card>

      {/* Danh sách người tham dự */}
      <Card className="checkin-card" bordered={false}>
        <h3 className="sidebar-title-pr">
          <HistoryOutlined /> Danh sách tham dự ({meetingAttendees.length})
        </h3>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin />
          </div>
        ) : meetingAttendees.length === 0 ? (
          <Empty description="Chưa có người tham dự" style={{ padding: "20px 0" }} />
        ) : (
          <List
            dataSource={meetingAttendees.slice(0, 10)}
            renderItem={(item: MeetingAttendee) => (
              <List.Item style={{ padding: "8px 0", border: "none" }}>
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Text strong style={{ fontSize: 13 }}>
                      {item.participantId?.userId?.fullName || "N/A"}
                    </Text>
                    <Tag color={item.attended ? "green" : "default"}>
                      {item.attended ? "Đã check-in" : "Chưa check-in"}
                    </Tag>
                  </div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {formatDate(item.checkInTime)}
                  </Text>
                </div>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

export default CreateMeetingAttendeeSidebar;

