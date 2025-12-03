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
  Avatar,
  Input,
  Tooltip,
} from "antd";

import {
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined,
  SolutionOutlined,
  EyeOutlined,
  DownloadOutlined,
  SearchOutlined,
  EditOutlined,
} from "@ant-design/icons";
import CandidateDetailModal from "./CandidateDetailModal";
import FileService from "@/services/FileService";
import { useNotification } from "@/contexts/NotificationContext";
import { Col } from "antd/lib";
const { Title, Text } = Typography;

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
  const [searchText, setSearchText] = useState<string>("");
  const { notify } = useNotification();
  const handleViewCandidate = (record: any) => {
    setSelectedCandidate(record);
    setOpenCandidateModal(true);
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
    } catch (err: any) {
      notify(err.message, "error");
    }
  };

  const downloadUrlFileSign1 = async (data: any) => {
    try {
      const response = await FileService.getSignedFile(data.fileUrl);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Tai_lieu_lien_quan.pdf";
      a.click();

      URL.revokeObjectURL(url);
    } catch (err: any) {
      notify(err.message, "error");
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
      title: "Trạng Thái", dataIndex: "statusVoter",
      render: (status: string) => {
        switch (status) {
          case "ACTIVE":
            return <Tag color="green">Hoạt động</Tag>;
          case "INACTIVE":
            return <Tag color="orange">Không hoạt động</Tag>;
          case "AUTHORIZED":
            return <Tag color="red">Được ủy quyền</Tag>;
          default:
            return <Tag color="default">Không rõ</Tag>;
        }
      }
    },
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
    "election-documents-important": "Tài liệu quan trọng về bầu cử",
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
        <Button
          icon={<DownloadOutlined />}
          onClick={() => downloadUrlFileSign(record)}
          style={{ cursor: "pointer" }}
        >

        </Button>

      )
    },
  ];

  // Lọc candidates theo search text
  const filteredCandidates = electionentities.filter((candidate) => {
    if (!searchText.trim()) return true;
    const search = searchText.toLowerCase().trim();
    const title = (candidate.title || "").toLowerCase();
    const description = (candidate.description || "").toLowerCase();
    const fullName = (candidate.metaData?.fullName || "").toLowerCase();
    const department = (candidate.metaData?.department || "").toLowerCase();
    const position = (candidate.metaData?.position || "").toLowerCase();

    return (
      title.includes(search) ||
      description.includes(search) ||
      fullName.includes(search) ||
      department.includes(search) ||
      position.includes(search)
    );
  });

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
              background: "#f4fdefff",
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
                    <SolutionOutlined /> Danh sách bầu chọn
                  </span>
                ),
                children: (
                  <div style={{ padding: 5 }}>
                    <Col span={24}>
                      <div style={{ marginTop: 16 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 12,
                          }}
                        >
                          <div style={{ flex: 1 }}>

                            {data?.votingMethodId?._id && electionentities.length > 0 && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Tổng: {electionentities.length} nội dung bầu chọn
                              </Text>
                            )}
                          </div>
                          {data?.votingMethodId?._id && (
                            <div
                              style={{ display: "flex", alignItems: "center", gap: 12 }}
                            >
                              <Input
                                placeholder="Tìm kiếm..."
                                prefix={<SearchOutlined />}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                allowClear
                                style={{ width: 250 }}
                              />
                            </div>
                          )}
                        </div>

                        <Table
                          columns={(() => {
                            // Kiểm tra xem cột nào có dữ liệu từ filteredCandidates
                            const hasTitle = filteredCandidates.some(
                              (c) => c.title || c.description
                            );
                            const hasCandidateInfo = filteredCandidates.some(
                              (c) => c.metaData?.fullName
                            );
                            const hasDetails = filteredCandidates.some(
                              (c) => c.metaData?.experience || c.metaData?.achievements
                            );
                            const hasFile = filteredCandidates.some((c) => c.fileUrl && c.fileUrl.trim() !== "");

                            const columns: any[] = [
                              {
                                title: "STT",
                                key: "index",
                                width: 70,
                                align: "center" as const,
                                render: (_: any, __: any, index: number) => (
                                  <Tag
                                    color="green"
                                    style={{
                                      margin: 0,
                                      minWidth: 32,
                                      textAlign: "center",
                                    }}
                                  >
                                    {index + 1}
                                  </Tag>
                                ),
                              },
                            ];

                            // Chỉ thêm cột Tiêu đề nếu có dữ liệu
                            if (hasTitle) {
                              columns.push({
                                title: "Tiêu đề / Mô tả",
                                dataIndex: "title",
                                key: "title",
                                width: 250,
                                render: (text: string, record: any, index: number) => (
                                  <div>
                                    <Text
                                      strong
                                      style={{
                                        fontSize: 14,
                                        display: "block",
                                        marginBottom: 4,
                                      }}
                                    >
                                      {text || `Ứng viên ${index + 1}`}
                                    </Text>
                                    {record.description && (
                                      <Text
                                        type="secondary"
                                        ellipsis={{ tooltip: record.description }}
                                        style={{ fontSize: 12, display: "block" }}
                                      >
                                        {record.description}
                                      </Text>
                                    )}
                                  </div>
                                ),
                              });
                            }

                            // Chỉ thêm cột Thông tin ứng viên nếu có dữ liệu
                            if (hasCandidateInfo) {
                              columns.push({
                                title: "Thông tin ứng viên",
                                key: "candidateInfo",
                                width: 300,
                                render: (_: any, record: any) => {
                                  if (!record.metaData?.fullName) {
                                    return (
                                      <Text
                                        type="secondary"
                                        style={{ fontStyle: "italic" }}
                                      >
                                        Chưa có thông tin
                                      </Text>
                                    );
                                  }
                                  return (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: 12,
                                      }}
                                    >
                                      <Avatar
                                        size={48}
                                        src={record.metaData?.image}
                                        icon={<UserOutlined />}
                                        style={{
                                          background:
                                            "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                                          flexShrink: 0,
                                        }}
                                      />
                                      <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text
                                          strong
                                          style={{
                                            display: "block",
                                            fontSize: 14,
                                            marginBottom: 6,
                                            lineHeight: 1.5,
                                          }}
                                        >
                                          {record.metaData.fullName}
                                        </Text>
                                        <Space
                                          size={[4, 4]}
                                          wrap
                                          style={{ marginTop: 0 }}
                                        >
                                          {record.metaData.age && (
                                            <Tag
                                              color="green"
                                              style={{ margin: 0, fontSize: 11 }}
                                            >
                                              {record.metaData.age} tuổi
                                            </Tag>
                                          )}
                                          {record.metaData.department && (
                                            <Tag
                                              color="green"
                                              style={{ margin: 0, fontSize: 11 }}
                                            >
                                              {record.metaData.department}
                                            </Tag>
                                          )}
                                          {record.metaData.position && (
                                            <Tag
                                              color="orange"
                                              style={{ margin: 0, fontSize: 11 }}
                                            >
                                              {record.metaData.position}
                                            </Tag>
                                          )}
                                        </Space>
                                      </div>
                                    </div>
                                  );
                                },
                              });
                            }

                            // Chỉ thêm cột Kinh nghiệm/Thành tích nếu có dữ liệu
                            if (hasDetails) {
                              columns.push({
                                title: "Kinh nghiệm / Thành tích",
                                key: "details",
                                width: 250,
                                render: (_: any, record: any) => {
                                  const hasExperience = record.metaData?.experience;
                                  const hasAchievements = record.metaData?.achievements;
                                  if (!hasExperience && !hasAchievements) {
                                    return (
                                      <Text
                                        type="secondary"
                                        style={{ fontStyle: "italic", fontSize: 12 }}
                                      >
                                        -
                                      </Text>
                                    );
                                  }
                                  return (
                                    <div style={{ lineHeight: 1.6 }}>
                                      {hasExperience && (
                                        <div style={{ marginBottom: 8 }}>
                                          <Tag
                                            color="purple"
                                            style={{ marginBottom: 4, fontSize: 11 }}
                                          >
                                            Kinh nghiệm
                                          </Tag>
                                          <div>
                                            <Text
                                              ellipsis={{
                                                tooltip: record.metaData.experience,
                                              }}
                                              style={{ fontSize: 12, display: "block" }}
                                            >
                                              {record.metaData.experience}
                                            </Text>
                                          </div>
                                        </div>
                                      )}
                                      {hasAchievements && (
                                        <div>
                                          <Tag
                                            color="cyan"
                                            style={{ marginBottom: 4, fontSize: 11 }}
                                          >
                                            Thành tích
                                          </Tag>
                                          <div>
                                            <Text
                                              ellipsis={{
                                                tooltip: record.metaData.achievements,
                                              }}
                                              style={{ fontSize: 12, display: "block" }}
                                            >
                                              {record.metaData.achievements}
                                            </Text>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                },
                              });
                            }

                            // Chỉ thêm cột File đính kèm nếu có dữ liệu
                            if (hasFile) {
                              columns.push({
                                title: "Tài liệu",
                                key: "file",
                                width: 100,
                                align: "center" as const,
                                render: (_: any, record: any) =>
                                  record.fileUrl && record.fileUrl.trim() !== "" ? (
                                    <Tooltip title="Có tài liệu đính kèm">
                                      <Button
                                        icon={<DownloadOutlined />}
                                        onClick={() => downloadUrlFileSign1(selectedCandidate)}
                                        style={{ cursor: "pointer", color: "green" }}
                                      >
                                      </Button>
                                    </Tooltip>
                                  ) : (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      -
                                    </Text>
                                  ),
                              });
                            }

                            // Luôn thêm cột Hành động
                            columns.push({
                              title: "Thao tác",
                              key: "action",
                              width: 140,
                              fixed: "right" as const,
                              align: "center" as const,
                              render: (_: any, record: any, index: number) => {
                                return (
                                  <Space size="small">
                                    <Tooltip title="Xem chi tiết">
                                      <Button
                                        type="text"
                                        icon={<EyeOutlined />}
                                        size="small"
                                        onClick={() => handleViewCandidate(record)}
                                        style={{
                                          color: "#52c41a",
                                        }}
                                      />
                                    </Tooltip>

                                  </Space>
                                );
                              },
                            });

                            return columns;
                          })()}
                          dataSource={filteredCandidates}
                          rowKey={(record) => {
                            // Use _id if available, otherwise create unique key
                            return record._id || `candidate-${record.title || Math.random()}`;
                          }}
                          pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total, range) =>
                              searchText
                                ? `${range[0]}-${range[1]} của ${total} kết quả (Tổng: ${electionentities.length})`
                                : `${range[0]}-${range[1]} của ${total} nội dung bầu chọn`,
                            pageSizeOptions: ["5", "10", "20", "50"],
                          }}
                          scroll={{ x: "max-content" }}
                          locale={{
                            emptyText: searchText ? (
                              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <SearchOutlined
                                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                                />
                                <p style={{ color: "#999", margin: 0, fontSize: 14 }}>
                                  Không tìm thấy kết quả phù hợp với "{searchText}"
                                </p>
                                <Button
                                  type="link"
                                  onClick={() => setSearchText("")}
                                  style={{ marginTop: 8 }}
                                >
                                  Xóa bộ lọc
                                </Button>
                              </div>
                            ) : (
                              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                                <FileTextOutlined
                                  style={{ fontSize: 48, color: "#d9d9d9", marginBottom: 16 }}
                                />
                                <p style={{ color: "#999", margin: 0, fontSize: 14 }}>
                                  Chưa có nội dung bầu chọn.
                                </p>
                              </div>
                            ),
                          }}
                        />
                      </div>
                    </Col>
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
      {/* <CandidateDetailModal
        open={openCandidateModal}
        onClose={() => setOpenCandidateModal(false)}
        data={selectedCandidate}
      /> */}

      <Modal
        open={openCandidateModal}
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Chi tiết nội dung bầu chọn
          </span>
        }
        onCancel={() => setOpenCandidateModal(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setOpenCandidateModal(false)}
          >
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedCandidate && (
          <div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tiêu đề">
                {selectedCandidate.title ||
                  `Ứng viên ${selectedCandidate.index + 1}`}
              </Descriptions.Item>
              {selectedCandidate.description && (
                <Descriptions.Item label="Mô tả">
                  {selectedCandidate.description}
                </Descriptions.Item>
              )}

              {/* Hiển thị theo type */}
              {(() => {
                const formType = selectedCandidate.formType || selectedCandidate.metaData?.type || "other";
                const metaData = selectedCandidate.metaData || {};

                if (formType === "person") {
                  // Hiển thị thông tin người
                  return (
                    <>
                      {metaData.image && (
                        <Descriptions.Item label="Ảnh">
                          <Avatar
                            size={100}
                            src={metaData.image}
                            icon={<UserOutlined />}
                          />
                        </Descriptions.Item>
                      )}
                      {metaData.fullName && (
                        <Descriptions.Item label="Họ và tên">
                          {metaData.fullName}
                        </Descriptions.Item>
                      )}
                      {metaData.age && (
                        <Descriptions.Item label="Tuổi">
                          {metaData.age}
                        </Descriptions.Item>
                      )}
                      {metaData.department && (
                        <Descriptions.Item label="Phòng ban">
                          {metaData.department}
                        </Descriptions.Item>
                      )}
                      {metaData.position && (
                        <Descriptions.Item label="Vị trí">
                          {metaData.position}
                        </Descriptions.Item>
                      )}
                      {metaData.experience && (
                        <Descriptions.Item label="Kinh nghiệm">
                          {metaData.experience}
                        </Descriptions.Item>
                      )}
                      {metaData.achievements && (
                        <Descriptions.Item label="Thành tích">
                          {metaData.achievements}
                        </Descriptions.Item>
                      )}
                    </>
                  );
                } else if (formType === "project") {
                  // Hiển thị thông tin dự án
                  return (
                    <>
                      {metaData.projectName && (
                        <Descriptions.Item label="Tên dự án">
                          {metaData.projectName}
                        </Descriptions.Item>
                      )}
                      {metaData.projectDescription && (
                        <Descriptions.Item label="Mô tả dự án">
                          {metaData.projectDescription}
                        </Descriptions.Item>
                      )}
                      {metaData.budget && (
                        <Descriptions.Item label="Ngân sách">
                          {metaData.budget}
                        </Descriptions.Item>
                      )}
                      {metaData.duration && (
                        <Descriptions.Item label="Thời gian thực hiện">
                          {metaData.duration}
                        </Descriptions.Item>
                      )}
                      {metaData.location && (
                        <Descriptions.Item label="Địa điểm">
                          {metaData.location}
                        </Descriptions.Item>
                      )}
                      {metaData.objectives && (
                        <Descriptions.Item label="Mục tiêu">
                          {metaData.objectives}
                        </Descriptions.Item>
                      )}
                      {metaData.benefits && (
                        <Descriptions.Item label="Lợi ích">
                          {metaData.benefits}
                        </Descriptions.Item>
                      )}
                    </>
                  );
                } else {
                  // Hiển thị tất cả các trường có sẵn cho type "other"
                  return (
                    <>
                      {metaData.image && (
                        <Descriptions.Item label="Ảnh">
                          <Avatar
                            size={100}
                            src={metaData.image}
                            icon={<UserOutlined />}
                          />
                        </Descriptions.Item>
                      )}
                      {metaData.fullName && (
                        <Descriptions.Item label="Họ và tên">
                          {metaData.fullName}
                        </Descriptions.Item>
                      )}
                      {metaData.age && (
                        <Descriptions.Item label="Tuổi">
                          {metaData.age}
                        </Descriptions.Item>
                      )}
                      {metaData.department && (
                        <Descriptions.Item label="Phòng ban">
                          {metaData.department}
                        </Descriptions.Item>
                      )}
                      {metaData.position && (
                        <Descriptions.Item label="Vị trí">
                          {metaData.position}
                        </Descriptions.Item>
                      )}
                      {metaData.experience && (
                        <Descriptions.Item label="Kinh nghiệm">
                          {metaData.experience}
                        </Descriptions.Item>
                      )}
                      {metaData.achievements && (
                        <Descriptions.Item label="Thành tích">
                          {metaData.achievements}
                        </Descriptions.Item>
                      )}
                      {metaData.projectName && (
                        <Descriptions.Item label="Tên dự án">
                          {metaData.projectName}
                        </Descriptions.Item>
                      )}
                      {metaData.projectDescription && (
                        <Descriptions.Item label="Mô tả dự án">
                          {metaData.projectDescription}
                        </Descriptions.Item>
                      )}
                      {metaData.budget && (
                        <Descriptions.Item label="Ngân sách">
                          {metaData.budget}
                        </Descriptions.Item>
                      )}
                      {metaData.duration && (
                        <Descriptions.Item label="Thời gian thực hiện">
                          {metaData.duration}
                        </Descriptions.Item>
                      )}
                      {metaData.location && (
                        <Descriptions.Item label="Địa điểm">
                          {metaData.location}
                        </Descriptions.Item>
                      )}
                      {metaData.objectives && (
                        <Descriptions.Item label="Mục tiêu">
                          {metaData.objectives}
                        </Descriptions.Item>
                      )}
                      {metaData.benefits && (
                        <Descriptions.Item label="Lợi ích">
                          {metaData.benefits}
                        </Descriptions.Item>
                      )}
                    </>
                  );
                }
              })()}

              {/* File đính kèm */}
              {(selectedCandidate.file || selectedCandidate.fileUrl) && (
                <Descriptions.Item label="File đính kèm">
                  <Tag icon={<FileTextOutlined />} color="green">
                    Có tài liệu đính kèm
                  </Tag>
                  {selectedCandidate.fileUrl && (
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={() => downloadUrlFileSign1(selectedCandidate)}
                      style={{ cursor: "pointer" }}
                    >
                    </Button>

                  )}
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </Modal>
  );
};

export default ViewDecisionModal;
