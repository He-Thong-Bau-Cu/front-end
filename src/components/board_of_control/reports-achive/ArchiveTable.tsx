import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import BoardControlService from "@/services/BoardControlService";
import { downloadBlob } from "@/utils/file";
import { formatDate } from "@/utils/format";
import {
  CloseCircleFilled,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { Button, Descriptions, Divider, Modal, Pagination, Table, Tag, Tooltip, Typography } from "antd";
import { useState } from "react";
import { ReportArchiveItem } from "../../../types/ReportArchive.interface";

const { Title, Text } = Typography;

interface Props {
  data: ReportArchiveItem[];
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function ArchiveTable({
  data,
  total,
  currentPage,
  pageSize,
  onPageChange,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReportArchiveItem | null>(null);
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();

  const handleViewDetail = (record: ReportArchiveItem) => {
    setSelectedItem(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  const handleDownload = async (record: ReportArchiveItem) => {
    const electionId = localStorage.getItem("currentElectionId");
    if (!electionId) {
      notify("Không tìm thấy cuộc bầu cử hiện tại", "warning");
      return;
    }
    try {
      showLoading();
      const blob = await BoardControlService.downloadArchiveReport(electionId, record.id);
      const fileName = `bao-cao-luu-tru-${record.id}-${Date.now()}.pdf`;
      downloadBlob(blob, fileName);
      notify("Tải xuống báo cáo thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Không thể tải xuống báo cáo", "error");
    } finally {
      hideLoading();
    }
  };

  const translateStatus = (status?: string) => {
    if (!status) return "-";

    const map: Record<string, string> = {
      PENDING: "Chờ xử lý",
      REVIEWED: "Đang xem xét",
      RESOLVED: "Đã xử lý",
      REJECTED: "Từ chối",
      ACTIVE: "Đang hiệu lực",

    };

    return map[status] || status;
  };


  const translateSeverity = (severity?: string) => {
    if (!severity) return "-";

    const map: Record<string, string> = {
      HIGH: "Cao",
      MEDIUM: "Trung bình",
      LOW: "Thấp",
    };

    return map[severity.toUpperCase()] || severity;
  };


  const columns = [
    {
      title: "STT",
      key: "stt",
      align: "center" as const,
      width: 80,
      render: (_: unknown, __: unknown, index: number) => {
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    { title: "TÊN BÁO CÁO", dataIndex: "name", key: "name" },
    { title: "CUỘC BẦU CỬ", dataIndex: "event", key: "event" },
    { title: "NGÀY TẠO", dataIndex: "date", key: "date" },
    {
      title: "TRẠNG THÁI",
      dataIndex: "status",
      key: "status",
      render: (status: string) => translateStatus(status),
    },
    {
      title: "HÀNH ĐỘNG",
      key: "actions",
      align: "center" as const,
      render: (_: unknown, record: ReportArchiveItem) => (
        <div className="ra-actions">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined
              className="ra-icon"
              onClick={() => handleViewDetail(record)}
              style={{ cursor: "pointer" }}
            />
          </Tooltip>

          {/* ❗ Chỉ hiện nút tải xuống khi đã ký */}
          {record.signer && record.signer !== "-" && (
            <Tooltip title="Tải xuống">
              <DownloadOutlined
                className="ra-icon"
                onClick={() => handleDownload(record)}
                style={{ cursor: "pointer" }}
              />
            </Tooltip>
          )}
        </div>
      )

    },
  ];

  return (
    <>
      <div className="ra-table-card">
        <div className="ra-result">
          Tìm thấy <b>{total}</b> kết quả
        </div>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          rowKey="id"
        />
        <div className="ra-pagination">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* Modal hiển thị chi tiết */}
      <Modal
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        centered
        className="archive-detail-modal"
        closeIcon={null}
        style={{ top: 60 }}
      >
        {selectedItem && (
          <>
            {/* Header */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "linear-gradient(135deg, #b7eb8f 0%, #52c41a 100%)",
              padding: "20px 24px",
              borderRadius: "8px 8px 0 0",
              margin: "-24px -24px 24px -24px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <FileTextOutlined style={{ fontSize: 24, color: "#fff" }} />
                <div>
                  <Title level={4} style={{ margin: 0, color: "#fff" }}>
                    {selectedItem.name}
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>
                    Mã lưu trữ: {selectedItem.id}
                  </Text>
                </div>
              </div>
              <Button
                type="text"
                icon={<CloseCircleFilled style={{ color: "#fff", fontSize: 20 }} />}
                onClick={handleCloseModal}
                style={{ color: "#fff" }}
              />
            </div>

            <Divider style={{ margin: "16px 0" }} />

            {/* Thông tin chi tiết */}
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Tên báo cáo" span={2}>
                {selectedItem.name}
              </Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>
                {selectedItem.description || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedItem.status === "PENDING" ? "orange" :
                      selectedItem.status === "REVIEWED" ? "blue" :
                        selectedItem.status === "RESOLVED" ? "green" :
                          selectedItem.status === "REJECTED" ? "red" :
                            selectedItem.status === "ACTIVE" ? "geekblue" :
                              "default"
                  }
                >
                  {translateStatus(selectedItem.status)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Mức độ nghiêm trọng">
                <Tag
                  color={
                    selectedItem.severity?.toUpperCase() === "HIGH" ? "red" :
                      selectedItem.severity?.toUpperCase() === "MEDIUM" ? "orange" :
                        selectedItem.severity?.toUpperCase() === "LOW" ? "green" :
                          "default"
                  }
                >
                  {translateSeverity(selectedItem.severity)}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tạo">
                {selectedItem.date}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {selectedItem.updatedAt ? formatDate(new Date(selectedItem.updatedAt)) : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xem xét">
                {selectedItem.reviewedAt ? formatDate(new Date(selectedItem.reviewedAt)) : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Cuộc bầu cử" span={2}>
                {selectedItem.event}
              </Descriptions.Item>
              {selectedItem.electionId?.decisionNumber && (
                <Descriptions.Item label="Số quyết định">
                  {selectedItem.electionId.decisionNumber}
                </Descriptions.Item>
              )}
              {selectedItem.electionId?.decisionName && (
                <Descriptions.Item label="Tên quyết định">
                  {selectedItem.electionId.decisionName}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Người tạo" span={2}>
                {selectedItem.createdBy?.fullName || selectedItem.createdBy?.username || "-"}
                {selectedItem.createdBy?.email && (
                  <Text type="secondary" style={{ display: "block", fontSize: 12, marginTop: 4 }}>
                    {selectedItem.createdBy.email}
                  </Text>
                )}
                {selectedItem.createdBy?.position && (
                  <Text type="secondary" style={{ display: "block", fontSize: 12 }}>
                    {selectedItem.createdBy.position}
                  </Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Người ký" span={2}>
                {selectedItem.signer !== "-" ? selectedItem.signer : "Chưa có người ký"}
              </Descriptions.Item>
              {selectedItem.fileUrl && (
                <Descriptions.Item label="File đính kèm" span={2}>
                  <a href={selectedItem.fileUrl} target="_blank" rel="noopener noreferrer">
                    {selectedItem.fileUrl}
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>

            <div style={{ textAlign: "right", marginTop: 24 }}>
              <Button
                onClick={handleCloseModal}
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  color: "#fff",
                  fontWeight: 600,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#3fa812";
                  e.currentTarget.style.borderColor = "#3fa812";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#52c41a";
                  e.currentTarget.style.borderColor = "#52c41a";
                }}
              >
                Đóng
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
