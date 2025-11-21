import React, { useEffect, useState } from "react";
import { Card, message, Button, Table, Input, Space, Tag, Spin, Empty, Typography, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import MeetingAttendeeService from "@/services/MeetingAttendeeService";
import ElectionParticipantService from "@/services/ElectionParticipantsService";
import MeetingService from "@/services/MeetingService";
import { BaseResponse } from "@/types/BaseResponse.interface";
import type { ColumnsType } from "antd/es/table";

const { Title, Text } = Typography;

interface Participant {
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
    roleName: string;
  };
  electionId: {
    _id: string;
    title: string;
  };
}

interface MeetingAttendee {
  _id: string;
  participantId: {
    _id: string;
    userId: {
      fullName: string;
    };
  };
  attended: boolean;
}

const CreateMeetingAttendeePanel: React.FC<{ onMeetingAttendeeAdded?: () => void }> = ({ onMeetingAttendeeAdded }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [attendeeStatusMap, setAttendeeStatusMap] = useState<Map<string, boolean>>(new Map());
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
        message.warning("Vui lòng chọn cuộc bầu cử trước khi thêm người tham dự");
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
        message.warning("Chưa có cuộc họp nào được tạo cho cuộc bầu cử này");
        return;
      }

      setMeetingId(meetingData._id);
      setMeetingInfo(meetingData);

      // Lấy danh sách participants đã có trong meeting và trạng thái attended
      const attendeesResponse: BaseResponse<any> = await MeetingAttendeeService.getByMeetingId(meetingData._id);
      if (attendeesResponse?.success && attendeesResponse?.data) {
        const statusMap = new Map<string, boolean>();
        (attendeesResponse.data as MeetingAttendee[]).forEach((a: MeetingAttendee) => {
          const participantId = a.participantId._id;
          statusMap.set(participantId, a.attended === true);
        });
        setAttendeeStatusMap(statusMap);
      }

      // Lấy danh sách election participants
      const participantsResponse: any = await ElectionParticipantService.getElectionParticipantByElectionId(currentElectionId);
      if (participantsResponse && Array.isArray(participantsResponse)) {
        setParticipants(participantsResponse as any);
      } else if (participantsResponse?.data && Array.isArray(participantsResponse.data)) {
        setParticipants(participantsResponse.data as any);
      }
    } catch (error: any) {
      console.error("Lỗi:", error);
      message.error(error?.response?.data?.message || "Không thể tải dữ liệu");
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


  const filteredParticipants = participants.filter((p) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      p.userId.fullName?.toLowerCase().includes(searchLower) ||
      p.userId.username?.toLowerCase().includes(searchLower) ||
      p.userId.email?.toLowerCase().includes(searchLower) ||
      p.userId.phone?.toLowerCase().includes(searchLower)
    );
  });

  const columns: ColumnsType<Participant> = [
    {
      title: "Họ và tên",
      dataIndex: ["userId", "fullName"],
      key: "fullName",
      width: 200,
      fixed: "left",
    },
    {
      title: "Mã định danh",
      dataIndex: ["userId", "username"],
      key: "username",
      width: 150,
    },
    {
      title: "Email",
      dataIndex: ["userId", "email"],
      key: "email",
      width: 200,
    },
    {
      title: "Số điện thoại",
      dataIndex: ["userId", "phone"],
      key: "phone",
      width: 150,
    },
    {
      title: "Đơn vị / Nhóm",
      dataIndex: ["userId", "department"],
      key: "department",
      width: 150,
    },
    {
      title: "Vai trò",
      dataIndex: ["roleId", "roleName"],
      key: "roleName",
      width: 150,
      render: (roleName: string) => <Tag color="blue">{roleName || "N/A"}</Tag>,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 120,
      fixed: "right",
      render: (_: any, record: Participant) => {
        const attended = attendeeStatusMap.get(record._id);
        const isAttended = attended === true;
        
        return (
          <Tag color={isAttended ? "green" : "default"}>
            {isAttended ? "Đã checkin" : "Chưa checkin"}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card
      className="manage-container"
      style={{
        borderRadius: 12,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
          Danh sách người tham dự cuộc họp
        </Title>
        <Text type="secondary">
          Xem trạng thái của người tham gia cuộc họp.
        </Text>
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
      ) : filteredParticipants.length === 0 ? (
        <Empty
          description={
            searchText
              ? "Không tìm thấy người tham gia nào phù hợp"
              : "Chưa có người tham gia trong cuộc bầu cử này"
          }
          style={{ padding: "40px 0" }}
        />
      ) : (
        <>
          <style>{`
            .ant-pagination-prev,
            .ant-pagination-next {
              display: none !important;
            }
          `}</style>
          <Table
            columns={columns}
            dataSource={filteredParticipants}
            rowKey="_id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `Tổng ${total} người tham gia`,
              showPrevNextJumpers: false,
              showLessItems: false,
              hideOnSinglePage: false,
              simple: false,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        </>
      )}
    </Card>
  );
};

export default CreateMeetingAttendeePanel;
