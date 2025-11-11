import React from "react";
import { Table, Tag, Card } from "antd";

interface VoterItem {
  id: number;
  name: string;
  email: string;
  voted: boolean;
  voteTime?: string;
}

export default function VotingProcess() {
  const voters: VoterItem[] = [
    { id: 1, name: "Nguyễn Văn A", email: "vana@example.com", voted: true, voteTime: "10:45:21" },
    { id: 2, name: "Trần Thị B", email: "thib@example.com", voted: false },
    { id: 3, name: "Lê Minh C", email: "minhc@example.com", voted: true, voteTime: "10:40:18" },
    { id: 4, name: "Phạm Gia D", email: "giad@example.com", voted: false },
  ];

  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <b>{text}</b>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Trạng thái",
      key: "voted",
      render: (_: any, record: VoterItem) =>
        record.voted ? (
          <Tag color="green">Đã bầu</Tag>
        ) : (
          <Tag color="default">Chưa bầu</Tag>
        ),
    },
    {
      title: "Thời gian",
      key: "voteTime",
      render: (_: any, record: VoterItem) => (record.voted ? record.voteTime : "--"),
    },
  ];

  return (
    <Card
      title="Danh sách cử tri trong cuộc bầu cử"
      style={{
        borderRadius: 16,
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        padding: 8,
        background: "#ffffff",
      }}
    >
      <Table
        columns={columns}
        dataSource={voters}
        rowKey="id"
        pagination={{ pageSize: 6 }}
        style={{
          borderRadius: 12,
        }}
      />
    </Card>
  );
}
