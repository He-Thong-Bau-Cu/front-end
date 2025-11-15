import {
  CloseCircleFilled,
  EyeOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import { Button, Descriptions, Divider, Modal, Pagination, Table, Tag, Tooltip, Typography } from "antd";
import dayjs from "dayjs";
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

  const handleViewDetail = (record: ReportArchiveItem) => {
    setSelectedItem(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
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
    { title: "LOẠI", dataIndex: "type", key: "type" },
    { title: "CUỘC BẦU CỬ", dataIndex: "event", key: "event" },
    { title: "NGÀY TẠO", dataIndex: "date", key: "date" },
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
          {/* <Tooltip title="Tải xuống">
            <DownloadOutlined className="ra-icon" />
          </Tooltip>
          <Tooltip title="Lịch sử">
            <HistoryOutlined className="ra-icon" />
          </Tooltip> */}
        </div>
      ),
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
              <Descriptions.Item label="Tóm tắt" span={2}>
                {selectedItem.summary || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Loại báo cáo">
                <Tag color="blue">{selectedItem.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={
                  selectedItem.status?.includes("Pending") ? "orange" :
                    selectedItem.status?.includes("Reviewed") ? "blue" :
                      selectedItem.status?.includes("Resolved") ? "green" :
                        selectedItem.status?.includes("Rejected") ? "red" : "default"
                }>
                  {selectedItem.status || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Mức độ nghiêm trọng">
                <Tag color={
                  selectedItem.severity === "high" ? "red" :
                    selectedItem.severity === "medium" ? "orange" :
                      selectedItem.severity === "low" ? "green" : "default"
                }>
                  {selectedItem.severity || "-"}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedItem.date}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày cập nhật">
                {selectedItem.updatedAt ? dayjs(selectedItem.updatedAt).format("DD/MM/YYYY HH:mm") : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày xem xét">
                {selectedItem.reviewedAt ? dayjs(selectedItem.reviewedAt).format("DD/MM/YYYY HH:mm") : "-"}
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
              <Descriptions.Item label="Mã lưu trữ" span={2}>
                <Text code>{selectedItem.id}</Text>
              </Descriptions.Item>
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