import React, { useEffect, useState } from "react";
import { Card, Button, Table, Input, Space, Tag, Spin, Empty, Typography, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import MeetingService from "@/services/MeetingService";
import { BaseResponse } from "@/types/BaseResponse.interface";
import type { ColumnsType } from "antd/es/table";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDateNoOffset } from "@/utils/format";

const { Title, Text } = Typography;

interface MeetingAttendeeData {
  _id: string;
  meetingId: any;
  participantId: {
    _id: string;
    userId: {
      _id: string;
      fullName: string;
      username: string;
      email: string;
      phone: string;
      position: string;
      department: string;
    };
    roleId: {
      _id: string;
      roleName: string;
      roleCode: string;
    };
    electionId: {
      _id: string;
      title: string;
    };
  };
  attended: boolean;
  checkInTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

const CreateMeetingAttendeePanel: React.FC<{ onMeetingAttendeeAdded?: () => void }> = ({ onMeetingAttendeeAdded }) => {
  const { notify } = useNotification();
  const [attendees, setAttendees] = useState<MeetingAttendeeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [electionId, setElectionId] = useState<string | null>(null);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentElectionId = localStorage.getItem("currentElectionId");
      if (!currentElectionId) {
        notify("Vui lòng chọn cuộc bầu cử trước khi thêm người tham dự", "warning");
        return;
      }

      setElectionId(currentElectionId);
      setLoading(true);

      // Mỗi cuộc bầu cử chỉ có một cuộc họp -> tìm meeting theo electionId
      const meetingResponse: BaseResponse<any> = await MeetingService.getByElectionId(currentElectionId);
      const meetingData = Array.isArray(meetingResponse?.data)
        ? meetingResponse?.data?.[0]
        : meetingResponse?.data;

      if (!meetingData?._id) {
        notify("Chưa có cuộc họp nào được tạo cho cuộc bầu cử này", "warning");
        return;
      }

      setMeetingId(meetingData._id);
      setMeetingInfo(meetingData);

      // Lấy danh sách meeting attendees từ bảng meetingAttendee
      const attendeesResponse: BaseResponse<any> = await MeetingAttendeeService.getByMeetingId(meetingData._id);
      if (attendeesResponse?.success && attendeesResponse?.data) {
        const attendeesArray = Array.isArray(attendeesResponse.data)
          ? attendeesResponse.data
          : [attendeesResponse.data];

        // Lọc và map dữ liệu từ meetingAttendee
        const validAttendees = attendeesArray
          .filter((a: any) => a?.participantId && a.participantId?.userId)
          .map((a: any) => ({
            _id: a._id,
            meetingId: a.meetingId,
            participantId: {
              _id: a.participantId._id,
              userId: a.participantId.userId || {},
              roleId: a.participantId.roleId || {},
              electionId: a.participantId.electionId || {},
            },
            attended: a.attended === true,
            checkInTime: a.checkInTime,
            createdAt: a.createdAt,
            updatedAt: a.updatedAt,
          }));

        setAttendees(validAttendees);
      } else {
        setAttendees([]);
      }
    } catch (error: any) {
      console.error("Lỗi:", error);
      notify(error?.response?.data?.message || "Không thể tải dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  const electionOptionValue =
    typeof meetingInfo?.electionId === "object"
      ? meetingInfo?.electionId?._id
      : meetingInfo?.electionId || electionId || undefined;

  const electionOptionLabel =
    typeof meetingInfo?.electionId === "object"
      ? meetingInfo?.electionId?.title ||
        meetingInfo?.electionId?.decisionName ||
        `Cuộc bầu cử ${meetingInfo?.electionId?._id || ""}`
      : meetingInfo?.electionId
      ? `Cuộc bầu cử ${meetingInfo.electionId}`
      : undefined;


  const filteredAttendees = attendees.filter((a) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    const userId = a.participantId?.userId || {};
    return (
      userId.fullName?.toLowerCase().includes(searchLower) ||
      userId.username?.toLowerCase().includes(searchLower) ||
      userId.email?.toLowerCase().includes(searchLower) ||
      userId.phone?.toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<MeetingAttendeeData> = [
    {
      title: "Họ và tên",
      key: "fullName",
      width: 200,
      fixed: "left",
      render: (_: any, record: MeetingAttendeeData) => (
        <span style={{ fontWeight: 500 }}>
          {record.participantId?.userId?.fullName || "N/A"}
        </span>
      ),
    },
    {
      title: "Mã định danh",
      key: "username",
      width: 150,
      render: (_: any, record: MeetingAttendeeData) => (
        <span style={{ color: "#666" }}>
          {record.participantId?.userId?.username || "N/A"}
        </span>
      ),
    },
    {
      title: "Email",
      key: "email",
      width: 200,
      render: (_: any, record: MeetingAttendeeData) => (
        <span>{record.participantId?.userId?.email || "N/A"}</span>
      ),
    },
    {
      title: "Số điện thoại",
      key: "phone",
      width: 150,
      render: (_: any, record: MeetingAttendeeData) => (
        <span>{record.participantId?.userId?.phone || "N/A"}</span>
      ),
    },
    {
      title: "Đơn vị / Nhóm",
      key: "department",
      width: 150,
      render: (_: any, record: MeetingAttendeeData) => (
        <span>{record.participantId?.userId?.department || "N/A"}</span>
      ),
    },
    {
      title: "Chức vụ",
      key: "position",
      width: 150,
      render: (_: any, record: MeetingAttendeeData) => (
        <span>{record.participantId?.userId?.position || "N/A"}</span>
      ),
    },
    {
      title: "Vai trò",
      key: "roleName",
      width: 150,
      render: (_: any, record: MeetingAttendeeData) => {
        const roleName = record.participantId?.roleId?.roleName || "N/A";
        return <Tag color="blue">{roleName}</Tag>;
      },
    },
    {
      title: "Thời gian check-in",
      key: "checkInTime",
      width: 180,
      render: (_: any, record: MeetingAttendeeData) => {
        if (record.attended && record.checkInTime) {
          return (
            <span style={{ color: "#52c41a" }}>
              {formatDateNoOffset(record.checkInTime)}
            </span>
          );
        }
        return <span style={{ color: "#999" }}>Chưa check-in</span>;
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      fixed: "right",
      render: (_: any, record: MeetingAttendeeData) => {
        const isAttended = record.attended === true;
        return (
          <Tag color={isAttended ? "success" : "default"} style={{ fontWeight: 500 }}>
            {isAttended ? "✓ Đã check-in" : "○ Chưa check-in"}
          </Tag>
        );
      },
    },
  ];

  // Tính thống kê
  const stats = {
    total: attendees.length,
    attended: attendees.filter((a) => a.attended).length,
    notAttended: attendees.filter((a) => !a.attended).length,
  };

  return (
    <Card
      className="manage-container"
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        border: "none",
      }}
      bodyStyle={{ padding: "32px" }}
    >
      <div style={{ marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0, marginBottom: 8, color: "#1a1a1a" }}>
          Danh sách người tham dự cuộc họp
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          Xem trạng thái check-in và thông tin chi tiết của người tham gia cuộc họp.
        </Text>
      </div>

      {/* Thống kê */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <Card
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            border: "none",
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Tổng số</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.total}</div>
          </div>
        </Card>
        <Card
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
            border: "none",
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Đã check-in</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.attended}</div>
          </div>
        </Card>
        <Card
          style={{
            flex: 1,
            background: "linear-gradient(135deg, #faad14 0%, #ffc53d 100%)",
            border: "none",
            borderRadius: 12,
          }}
          bodyStyle={{ padding: "20px" }}
        >
          <div style={{ color: "#fff" }}>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 8 }}>Chưa check-in</div>
            <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.notAttended}</div>
          </div>
        </Card>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
          Cuộc bầu cử:
        </label>
        <Select
          style={{ width: "100%", maxWidth: 420 }}
          value={electionOptionValue}
          disabled
          suffixIcon={null}
          placeholder={loading ? "Đang tải..." : "Chưa chọn cuộc bầu cử"}
        >
          {electionOptionValue && (
            <Select.Option value={electionOptionValue}>
              {electionOptionLabel || "Cuộc bầu cử đã chọn"}
            </Select.Option>
          )}
        </Select>
      </div>

      {meetingInfo && (
        <div
          style={{
            display: "flex",
            gap: 16,
            marginBottom: 24,
            background: "#F9FDF9",
            padding: 16,
            borderRadius: 10,
            border: "1px solid #e0f2e9",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong>Cuộc họp</Text>
            <div>
              {meetingInfo.title ||
               meetingInfo.name ||
               (typeof meetingInfo.electionId === "object"
                 ? meetingInfo.electionId?.title || meetingInfo.electionId?.decisionName
                 : null) ||
               "Chưa cập nhật"}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong>Thời gian họp</Text>
            <div>
              {meetingInfo.meetingDate
                ? new Date(meetingInfo.meetingDate).toLocaleString("vi-VN")
                : "Chưa cập nhật"}
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong>Địa điểm</Text>
            <div>{meetingInfo.location || "Chưa cập nhật"}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Text strong>Trạng thái</Text>
            <div>{meetingInfo.status || "Đang chuẩn bị"}</div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, mã định danh, email, số điện thoại..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 500 }}
          allowClear
          size="large"
        />
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : filteredAttendees.length === 0 ? (
        <Empty
          description={
            searchText
              ? "Không tìm thấy người tham gia nào phù hợp"
              : "Chưa có người tham gia trong cuộc họp này"
          }
          style={{ padding: "40px 0" }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredAttendees}
          rowKey="_id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người tham gia`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          bordered
          style={{
            background: "#fff",
            borderRadius: 8,
          }}
        />
      )}
    </Card>
  );
};

export default CreateMeetingAttendeePanel;
