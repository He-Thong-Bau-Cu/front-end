import { Table, Button, Space, Typography } from "antd";
import {
  EyeOutlined,
  IdcardOutlined,
  EditOutlined,
} from "@ant-design/icons";
import MeetingStatusTag from "./MeetingStatusTag";
import { Meeting } from "@/types/Meeting.interface";
import { useNavigate } from "react-router-dom";   // ✅ Thêm import này

const { Text } = Typography;

interface Props {
  meetings: Meeting[];
  rowSelection?: any;
}

export default function MeetingTable({ meetings, rowSelection }: Props) {
  const navigate = useNavigate(); // ✅ Khởi tạo hook điều hướng

  const handleIssueCard = (record: Meeting) => {
    // Nếu bạn muốn gửi thêm id cuộc họp, có thể thêm query
    navigate(`/head_of_the_Organizing_committee/create-delegate-card?meetingId=${record.id}`);
  };

  const columns = [
    {
      title: "TÊN CUỘC HỌP",
      dataIndex: "name",
      key: "name",
      render: (_: any, record: Meeting) => (
        <div>
          <Text strong className="meeting-name">{record.name}</Text>
          <div className="meeting-desc">{record.description}</div>
        </div>
      ),
    },
    { title: "THỜI GIAN", dataIndex: "time", key: "time" },
    { title: "ĐỊA ĐIỂM", dataIndex: "location", key: "location" },
    {
      title: "THAM DỰ",
      dataIndex: "participants",
      key: "participants",
      align: "center" as const,
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      align: "center" as const,
      render: (s: Meeting["status"]) => <MeetingStatusTag status={s} />,
    },
    {
      title: "THAO TÁC",
      key: "action",
      align: "center" as const,
      render: (_: any, record: Meeting) => {
        const isEnded = record.status === "ended";
        const isUpcoming = record.status === "upcoming";

        return (
          <Space>
            <Button icon={<EyeOutlined />} type="text" />

            {/* Nút Phát hành thẻ có màu tùy theo trạng thái */}
            <Button
              icon={<IdcardOutlined />}
              className={isEnded ? "issue-btn-disabled" : "issue-btn"}
              disabled={isEnded}
              onClick={() => !isEnded && handleIssueCard(record)}  // ✅ Điều hướng khi bấm
            >
              Phát hành thẻ
            </Button>

            {/* Icon bút chỉ hiển thị khi sắp diễn ra */}
            {isUpcoming && (
              <Button
                icon={<EditOutlined />}
                className="edit-btn"
                type="text"
              />
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={meetings}
      rowKey="id"
      pagination={false}
      className="meeting-table"
      bordered={false}
      rowSelection={{
        type: "checkbox",
        ...rowSelection,
      }}
    />
  );
}
