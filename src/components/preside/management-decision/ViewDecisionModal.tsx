import React, { useState } from "react";
import {
  Modal,
  Typography,
  Spin,
  Tabs,
  Descriptions,
  Tag,
  Table,
  Button,
  Space,
  message,
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
import FileService from "@/services/FileService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
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
  documents?: any[];
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
  documents = [],
  meeting = {},
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [openCandidateModal, setOpenCandidateModal] = useState(false);

  const handleViewCandidate = (record: any) => {
    setSelectedCandidate(record);
    setOpenCandidateModal(true);
  };

  const downloadUrlFile = async (data: any) => {
    try {

      const blob = new Blob([data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Danh_sach_uy_quyen.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải file!");
    }
  };



  const downloadUrlFileSign = async (data: any) => {
    try {
      const response = await FileService.getSignedFile(data.fileUrl);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Danh_sach_uy_quyen_da_ky.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải file!");
    }
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
    { title: "Vai trò", dataIndex: ["roleId", "roleName"] },
    {
      title: "Cổ phần", dataIndex: "percent",
      render: (percent: number) => (percent !== undefined ? `${percent}%` : `${0}%`),
    },
  ];

  const organizerColumns = [
    { title: "Họ tên", dataIndex: ["userId", "fullName"] },
    { title: "Email", dataIndex: ["userId", "email"] },
    { title: "Số điện thoại", dataIndex: ["userId", "phone"] },
    { title: "Vai trò", dataIndex: ["roleId", "roleName"] },
  ];
  const STATUS_MAP: any = {
    WAIT_ENTER_DATA: { label: "Chờ nhập dữ liệu", color: "gold" },
    WAIT_APPROVAL: { label: "Chờ duyệt", color: "blue" },
    APPROVED_SIGNED: { label: "Đã duyệt", color: "green" },
    DRAFT: { label: "Bản nháp", color: "default" },
    REQUEST_EDIT: { label: "Yêu cầu chỉnh sửa", color: "red" },
  };
  const TYPE_LABELS: Record<string, string> = {
    "signed-documents": "Tài liệu nghị quyết đã ký",
    "delegation-delegator-signed": "Tài liệu ủy quyền cử tri đã ký",
    "delegation-summary-signed": "Tài liệu tóm tắt ủy quyền chủ tọa đã ký",
    "voter-signed-ballots": "Tài liệu phiếu bầu cử đã ký của cử tri",
    default: "Tài liệu đính kèm",
    // Thêm bao nhiêu loại cũng được
  };



  const attachmentColumns = [
    { title: "Tên tài liệu", dataIndex: "title" },
    {
      title: "Loại tài liệu", dataIndex: "type",
      render: (type: string) => TYPE_LABELS[type] || "Không xác định",
    },

    {
      title: "Tải xuống",
      dataIndex: "fileUrl",
      render: (_: string, record: any) => (
        <a
          onClick={() => downloadUrlFileSign(record)}
          style={{ cursor: "pointer" }}
        >
          📄 {record.title}
        </a>


      )
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
                    <UserOutlined /> Danh sách cử tri
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
                    dataSource={documents}
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
