import React, { useState } from "react";
import {
  Modal,
  Typography,
  Spin,
  Tabs,
  Descriptions,
  Tag,
  Table,
  Divider,
  Button,
  Space,
} from "antd";

import {
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined,
  SolutionOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import CandidateDetailModal from "./CandidateDetailModal";

const { Title } = Typography;

interface ViewDecisionModalProps {
  open: boolean;
  onClose: () => void;
  onSign?: () => void;
  data?: any;
  loading?: boolean;

  voters?: any[];
  organize?: any[];
  electionentities?: any[];
  document?: any[];
  meeting?: any;
}

const ViewDecisionModal: React.FC<ViewDecisionModalProps> = ({
  open,
  onClose,
  onSign,
  data,
  loading = false,

  voters = [],
  organize = [],
  electionentities = [],
  document = [],
  meeting = {},
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);

  const handleViewCandidate = (record: any) => {
    setSelectedCandidate(record);
    setOpenCandidateModal(true);
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /* ========= TABLE COLUMNS =========== */
  const voterColumns = [
    { title: "Họ tên", dataIndex: ["userId", "fullName"] },
    { title: "Email", dataIndex: ["userId", "email"] },
    { title: "Số điện thoại", dataIndex: ["userId", "phone"] },
    { title: "Chức vụ", dataIndex: ["userId", "position"] },
    { title: "Số cổ phần", dataIndex: "shares" },
  ];

  const organizerColumns = [
    { title: "Họ tên", dataIndex: ["userId", "fullName"] },
    { title: "Email", dataIndex: ["userId", "email"] },
    { title: "Số điện thoại", dataIndex: ["userId", "phone"] },
    { title: "Chức vụ", dataIndex: ["userId", "position"] },
  ];
  const STATUS_MAP: any = {
    WAIT_ENTER_DATA: { label: "Chờ nhập dữ liệu", color: "gold" },
    WAIT_APPROVAL: { label: "Chờ duyệt", color: "blue" },
    SIGNED_APPROVED: { label: "Đã duyệt", color: "green" },
    DRAFT: { label: "Bản nháp", color: "default" },
    REQUEST_EDIT: { label: "Yêu cầu chỉnh sửa", color: "red" },
  };

  const attachmentColumns = [
    { title: "Tên tài liệu", dataIndex: "name" },
    {
      title: "Tải xuống",
      dataIndex: "url",
      render: (url: string, record: any) => (
        <a href={url} target="_blank" rel="noreferrer">
          📄 {record.name}
        </a>
      ),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={1150}
      centered
      styles={{
        body: { padding: 10 },
      }}
    >
      <Spin spinning={loading}>
        <div style={{ padding: "10px 5px" }}>
          {/* ================= HEADER ================= */}
          <div
            style={{
              background: "#f5f7fa",
              padding: 20,
              borderRadius: 8,
              marginBottom: 25,
              border: "1px solid #eee",
            }}
          >
            <Title level={4} style={{ margin: 0 }}>
              <FileTextOutlined style={{ marginRight: 8 }} />
              {data?.decisionName || "Thông tin nghị quyết"}
            </Title>

            <Descriptions
              column={2}
              style={{ marginTop: 15 }}
              styles={{
                label: { fontWeight: 600 },
                content: { fontSize: 14 },
              }}
            >
              <Descriptions.Item label="Số quyết định">
                {data?.decisionNumber}
              </Descriptions.Item>

              <Descriptions.Item label="Trạng thái">
                {STATUS_MAP[data?.statusData] ? (
                  <Tag color={STATUS_MAP[data.statusData].color}>
                    {STATUS_MAP[data.statusData].label}
                  </Tag>
                ) : (
                  <Tag color="default">{data?.statusData}</Tag>
                )}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian bắt đầu">
                {formatDateTime(meeting?.startDate || data?.startDate)}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian kết thúc">
                {formatDateTime(meeting?.endDate || data?.endDate)}
              </Descriptions.Item>

              <Descriptions.Item label="Thời gian ủy quyền">
                {formatDateTime(data?.delegationStart)}
              </Descriptions.Item>

              <Descriptions.Item label="Kết thúc ủy quyền">
                {formatDateTime(data?.delegationEnd)}
              </Descriptions.Item>

              <Descriptions.Item label="Hình thức bầu cử">
                {data?.votingMethodId?.methodName || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Thể loại bầu cử">
                {data?.typeId?.typeName || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Ngưỡng thông qua">
                {data?.thresholdId?.thresholdName || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Địa chỉ cuộc họp">
                {meeting?.location || "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* ================= TABS ================= */}
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: (
                  <span>
                    <SolutionOutlined /> Nội dung nghị quyết & Ứng viên
                  </span>
                ),
                children: (
                  <div style={{ padding: 5 }}>
                    <Table
                      dataSource={electionentities}
                      columns={[
                        { title: "Nội dung bầu chọn", dataIndex: "title" },
                        { title: "Mô tả", dataIndex: "description" },
                        {
                          title: "Xem chi tiết",
                          key: "view",
                          align: "center",
                          render: (_: any, record: any) => (
                            <Button
                              type="link"
                              icon={<EyeOutlined style={{ fontSize: 18 }} />}
                              onClick={() => handleViewCandidate(record)}
                            />
                          ),
                        },
                      ]}
                      rowKey={(r) => r._id || r.id || r.title}
                      pagination={{ pageSize: 10 }}
                    />
                  </div>
                ),
              },

              {
                key: "2",
                label: (
                  <span>
                    <UserOutlined /> Danh sách Voter
                  </span>
                ),
                children: (
                  <Table
                    dataSource={voters}
                    columns={voterColumns}
                    rowKey={(r) => r._id || r.id || r.userId}
                    pagination={{ pageSize: 10 }}
                  />
                ),
              },

              {
                key: "3",
                label: (
                  <span>
                    <TeamOutlined /> Ban tổ chức
                  </span>
                ),
                children: (
                  <Table
                    dataSource={organize}
                    columns={organizerColumns}
                    rowKey={(r) => r._id || r.id || r.userId}
                  />
                ),
              },

              {
                key: "5",
                label: (
                  <span>
                    <FileOutlined /> Tài liệu đính kèm
                  </span>
                ),
                children: (
                  <Table
                    dataSource={document}
                    columns={attachmentColumns}
                    rowKey={(r) => r._id || r.id || r.url}
                  />
                ),
              },
            ]}
          />

          {/* ================= FOOTER ================= */}
          <div style={{ marginTop: 20, textAlign: "right" }}>
            <Space>
              <Button onClick={onClose}>Đóng</Button>

              {data?.statusData === "WAIT_APPROVAL" && (
                <Button type="primary" onClick={onSign}>
                  Ký số
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Spin>

      {/* MODAL CHI TIẾT ỨNG VIÊN */}
      <CandidateDetailModal
        open={openCandidateModal}
        onClose={() => setOpenCandidateModal(false)}
        data={selectedCandidate}
      />
    </Modal>
  );
};

export default ViewDecisionModal;
