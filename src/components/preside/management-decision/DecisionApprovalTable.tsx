import {
  Card,
  Input,
  Button,
  Table,
  Tag,
  Space,
  Modal,
  message,
  Pagination,
  Row,
  Col,
  Typography,
  Form,
  Select,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ElectionService from "@/services/ElectionService";
import SystemService from "@/services/SystemService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDate } from "@/utils/format";
import { USER_ROLE } from "@/enums/STATUS";

const { Text } = Typography;
const { Option } = Select;

const statusMap: Record<string, { text: string; color: string }> = {
  APPROVED_SIGNED: {
    text: "Đã được chủ tịch hội đồng quản trị duyệt",
    color: "green",
  },
  WAIT_APPROVAL: {
    text: "Đã được chủ tịch hội đồng quản trị duyệt",
    color: "green",
  },
  REJECTED: { text: "Từ chối", color: "red" },
  WAIT_ENTER_DATA: {
    text: "Đã được chủ tịch hội đồng quản trị duyệt",
    color: "green",
  },
  DRAFT: { text: "Đã được chủ tịch hội đồng quản trị duyệt", color: "green" },
  REQUEST_FROM_USER: { text: "Yêu cầu từ người dùng", color: "blue" },
};

const DecisionApprovalTable = () => {
  const location = useLocation();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDecisionData, setViewDecisionData] = useState<any>(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [userList, setUserList] = useState<any[]>([]);
  const [boardOfControlRoleId, setBoardOfControlRoleId] = useState<string>("");
  const [secretaryRoleId, setSecretaryRoleId] = useState<string>("");
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const userId = localStorage.getItem("userId");

  // Lấy electionId từ route state hoặc localStorage
  const electionId =
    location.state?.electionId ||
    localStorage.getItem("currentElectionId") ||
    undefined;
  const isSystemPreside = !electionId; // Nếu không có electionId thì là chủ tọa hệ thống

  // Load danh sách user và roleId
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load users
        const res = await ElectionService.getElectionUser();
        setUserList(res || []);

        // Load roleId từ roleCode
        const roleResponse = await SystemService.getRole({
          page: 1,
          limit: 100,
        });
        if (roleResponse.success && roleResponse.data) {
          const roles = roleResponse.data.content || [];
          const boardOfControlRole = roles.find(
            (r: any) => r.roleCode === USER_ROLE.BOARD_OF_CONTROL
          );
          const secretaryRole = roles.find(
            (r: any) => r.roleCode === USER_ROLE.PRESIDE_SECRETARY
          );

          if (boardOfControlRole) {
            setBoardOfControlRoleId(boardOfControlRole._id);
          }
          if (secretaryRole) {
            setSecretaryRoleId(secretaryRole._id);
          }
        }
      } catch (err: any) {
        notify(err.message, "error");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    loadDecisions(1, pagination.pageSize);
  }, []);

  useEffect(() => {
    if (searchText === "") {
      loadDecisions(1, pagination.pageSize);
      return;
    }
    const timer = setTimeout(() => {
      loadDecisions(1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const loadDecisions = async (page = 1, limit = 10) => {
    setLoading(true);
    try {
      const response = await ElectionService.getElectionRequestsForApproval({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        electionId: electionId, // Truyền electionId nếu có (chủ tọa của cuộc bầu cử cụ thể)
      });

      if (response.success && response.data) {
        setData(response.data.content || []);
        setPagination({
          current: response.data.page || page,
          pageSize: response.data.limit || limit,
          total: response.data.totalItems || 0,
        });
      }
    } catch (err: any) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: any) => {
    setViewDecisionData(record);
    setViewModalOpen(true);
    setApproveModalOpen(false);
  };

  const handleApprove = (record: any) => {
    setSelectedRecord(record);
    setApproveModalOpen(true);

    // Tìm thư ký và ban kiểm soát từ participants
    const secretary = record.participants?.find((p: any) => {
      if (!p.roleId) return false;
      const roleCode = typeof p.roleId === "object" ? p.roleId.roleCode : null;
      const roleId = typeof p.roleId === "object" ? p.roleId._id : p.roleId;
      return (
        roleCode === USER_ROLE.PRESIDE_SECRETARY || roleId === secretaryRoleId
      );
    });
    const boardOfControl = record.participants?.find((p: any) => {
      if (!p.roleId) return false;
      const roleCode = typeof p.roleId === "object" ? p.roleId.roleCode : null;
      const roleId = typeof p.roleId === "object" ? p.roleId._id : p.roleId;
      return (
        roleCode === USER_ROLE.BOARD_OF_CONTROL ||
        roleId === boardOfControlRoleId
      );
    });

    const secretaryUserId = secretary?.userId;
    const boardOfControlUserId = boardOfControl?.userId;

    form.setFieldsValue({
      secretaryId:
        typeof secretaryUserId === "object"
          ? secretaryUserId._id
          : secretaryUserId || undefined,
      boardOfControlId:
        typeof boardOfControlUserId === "object"
          ? boardOfControlUserId._id
          : boardOfControlUserId || undefined,
    });
  };

  const handleReject = (record: any) => {
    setSelectedRecord(record);
    setRejectModalOpen(true);
    setRejectReason("");
  };

  const submitApprove = async () => {
    if (!selectedRecord) return;
    try {
      const values = await form.validateFields();
      showLoading();

      const response = await ElectionService.approveElectionRequest(
        selectedRecord._id,
        values.secretaryId,
        values.boardOfControlId
      );

      if (response.success) {
        notify("Duyệt yêu cầu thành công!", "success");
        setApproveModalOpen(false);
        form.resetFields();
        loadDecisions(pagination.current, pagination.pageSize);
      } else {
        notify(response.message || "Duyệt yêu cầu thất bại", "error");
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Validation errors
        return;
      }
      notify(error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      hideLoading();
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) {
      return message.error("Vui lòng nhập lý do từ chối!");
    }
    if (!selectedRecord) return;
    try {
      showLoading();
      const response = await ElectionService.rejectElectionRequest(
        selectedRecord._id,
        rejectReason
      );
      if (response.success) {
        notify("Đã từ chối quyết định", "success");
        setRejectModalOpen(false);
        setRejectReason("");
        loadDecisions(pagination.current, pagination.pageSize);
      } else {
        notify(response.message || "Không thể từ chối", "error");
      }
    } catch (err: any) {
      notify(err.message || "Không thể từ chối", "error");
    } finally {
      hideLoading();
    }
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination((prev) => ({ ...prev, current: page, pageSize }));
    loadDecisions(page, pageSize);
  };

  const columns = [
    {
      title: "STT",
      width: 70,
      align: "center" as const,
      render: (_: any, __: any, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Mã quyết định",
      dataIndex: "decisionNumber",
      key: "decisionNumber",
    },
    {
      title: "Tên quyết định",
      dataIndex: "decisionName",
      key: "decisionName",
    },
    {
      title: "Trạng thái",
      dataIndex: "statusData",
      key: "statusData",
      render: (status: string) => {
        let statusInfo;
        if (status === "REQUEST_FROM_USER") {
          statusInfo = statusMap[status];
        } else if (status === "REJECTED") {
          // Nếu là REJECTED thì hiển thị "Từ chối"
          statusInfo = statusMap[status];
        } else {
          // Tất cả các trạng thái khác đều hiển thị "Đã được chủ tịch hội đồng quản trị duyệt"
          statusInfo = {
            text: "Đã được chủ tịch hội đồng quản trị duyệt",
            color: "green",
          };
        }
        return (
          <Tag color={statusInfo?.color || "default"}>
            {statusInfo?.text || status}
          </Tag>
        );
      },
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date | string) => formatDate(date) || "-",
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record)}>
            Xem
          </Button>
          {record.statusData === "REQUEST_FROM_USER" && (
            <>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record)}
                style={{
                  backgroundColor: "#52c41a",
                  borderColor: "#52c41a",
                }}
              >
                Phê duyệt
              </Button>
              <Button
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                Từ chối
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 4,
              height: 24,
              background: "linear-gradient(180deg, #52c41a 0%, #73d13d 100%)",
              borderRadius: 2,
            }}
          />
          <Text strong style={{ fontSize: 16 }}>
            {isSystemPreside
              ? "Phê duyệt yêu cầu cuộc bầu cử"
              : "Phê duyệt dữ liệu cuộc bầu cử"}
          </Text>
        </div>
      }
    >
      <div style={{ marginBottom: 12, display: "flex", gap: 8 }}>
        <Input
          placeholder="Tìm kiếm quyết định..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
        />
        <Button
          onClick={() => loadDecisions(pagination.current, pagination.pageSize)}
        >
          Làm mới
        </Button>
      </div>

      <Table
        rowKey="_id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Tổng ${total} yêu cầu`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
      />

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)",
              }}
            >
              <EyeOutlined style={{ fontSize: 20, color: "#fff" }} />
            </div>
            <div>
              <div
                style={{ fontSize: "20px", fontWeight: 600, color: "#1890ff" }}
              >
                Chi tiết yêu cầu cuộc bầu cử
              </div>
              <div style={{ fontSize: 13, color: "#8c8c8c", marginTop: 2 }}>
                Thông tin đầy đủ về yêu cầu tạo cuộc bầu cử
              </div>
            </div>
          </div>
        }
        open={viewModalOpen}
        onCancel={() => setViewModalOpen(false)}
        footer={[
          <Button
            key="close"
            size="large"
            onClick={() => setViewModalOpen(false)}
            style={{
              minWidth: 120,
              height: 40,
              borderRadius: 6,
              fontWeight: 500,
            }}
          >
            Đóng
          </Button>,
        ]}
        width={900}
        centered
        styles={{
          body: {
            padding: "24px",
          },
        }}
      >
        {viewDecisionData && (
          <div>
            {/* Header Info Box */}
            <div
              style={{
                background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                padding: 24,
                borderRadius: 16,
                marginBottom: 24,
                border: "1px solid #91d5ff",
                boxShadow: "0 4px 12px rgba(24, 144, 255, 0.15)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  background: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                }}
              />
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <div style={{ marginBottom: 10 }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      Số quyết định
                    </Text>
                  </div>
                  <Text
                    strong
                    style={{ fontSize: 18, color: "#0050b3", display: "block" }}
                  >
                    {viewDecisionData.decisionNumber || "-"}
                  </Text>
                </Col>
                <Col span={12}>
                  <div style={{ marginBottom: 10 }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      Trạng thái
                    </Text>
                  </div>
                  <Tag
                    color={
                      statusMap[viewDecisionData.statusData]?.color || "default"
                    }
                    style={{
                      fontSize: 14,
                      padding: "6px 16px",
                      borderRadius: 6,
                      fontWeight: 500,
                    }}
                  >
                    {statusMap[viewDecisionData.statusData]?.text ||
                      viewDecisionData.statusData}
                  </Tag>
                </Col>
                <Col span={24}>
                  <div style={{ marginBottom: 10 }}>
                    <Text
                      type="secondary"
                      style={{ fontSize: 13, fontWeight: 500 }}
                    >
                      Tên nghị quyết
                    </Text>
                  </div>
                  <Text
                    strong
                    style={{ fontSize: 16, color: "#0050b3", lineHeight: 1.5 }}
                  >
                    {viewDecisionData.decisionName ||
                      viewDecisionData.title ||
                      "-"}
                  </Text>
                </Col>
              </Row>
            </div>

            {/* Thông tin chi tiết */}
            <div
              style={{
                background: "linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)",
                padding: 24,
                borderRadius: 16,
                marginBottom: 24,
                border: "1px solid #e8e8e8",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 4,
                    height: 20,
                    background:
                      "linear-gradient(180deg, #1890ff 0%, #40a9ff 100%)",
                    borderRadius: 2,
                  }}
                />
                <Text strong style={{ fontSize: 17, color: "#262626" }}>
                  Thông tin chi tiết
                </Text>
              </div>
              <Row gutter={[20, 20]}>
                <Col span={12}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        Thời gian bắt đầu
                      </Text>
                    </div>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#262626",
                      }}
                    >
                      {formatDate(viewDecisionData.startDate) || "-"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        Thời gian kết thúc
                      </Text>
                    </div>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#262626",
                      }}
                    >
                      {formatDate(viewDecisionData.endDate) || "-"}
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div
                    style={{
                      background: "#fff",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid #e8e8e8",
                      boxShadow: "0 1px 4px rgba(0, 0, 0, 0.02)",
                    }}
                  >
                    <div style={{ marginBottom: 8 }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        Ngày tạo
                      </Text>
                    </div>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: "#262626",
                      }}
                    >
                      {viewDecisionData.createdAt || "-"}
                    </Text>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Lý do từ chối */}
            {viewDecisionData.rejectReason && (
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #fff2f0 0%, #ffe7e5 100%)",
                  padding: 20,
                  borderRadius: 16,
                  marginBottom: 24,
                  border: "1px solid #ffccc7",
                  boxShadow: "0 2px 8px rgba(255, 77, 79, 0.1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: 100,
                    height: 100,
                    background: "rgba(255, 77, 79, 0.1)",
                    borderRadius: "50%",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <CloseOutlined style={{ fontSize: 18, color: "#cf1322" }} />
                  <Text strong style={{ fontSize: 16, color: "#cf1322" }}>
                    Lý do từ chối
                  </Text>
                </div>
                <div
                  style={{
                    background: "#fff",
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid #ffccc7",
                  }}
                >
                  <Text
                    style={{ fontSize: 14, lineHeight: 1.8, color: "#595959" }}
                  >
                    {viewDecisionData.rejectReason}
                  </Text>
                </div>
              </div>
            )}

            {/* Thành viên tham gia */}
            {viewDecisionData.participants &&
              viewDecisionData.participants.length > 0 && (
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f6ffed 0%, #f0f9e8 100%)",
                    padding: 24,
                    borderRadius: 16,
                    border: "1px solid #b7eb8f",
                    boxShadow: "0 2px 8px rgba(82, 196, 26, 0.1)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 20,
                        background:
                          "linear-gradient(180deg, #52c41a 0%, #73d13d 100%)",
                        borderRadius: 2,
                      }}
                    />
                    <Text strong style={{ fontSize: 17, color: "#262626" }}>
                      Thành viên tham gia
                    </Text>
                    <Tag
                      color="green"
                      style={{
                        marginLeft: 8,
                        borderRadius: 12,
                        padding: "2px 10px",
                        fontSize: 12,
                      }}
                    >
                      {viewDecisionData.participants.length} người
                    </Tag>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 14,
                    }}
                  >
                    {viewDecisionData.participants.map(
                      (p: any, index: number) => (
                        <div
                          key={index}
                          style={{
                            padding: 16,
                            background: "#fff",
                            borderRadius: 12,
                            border: "1px solid #d9f7be",
                            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                            transition: "all 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-2px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 0, 0, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 6px rgba(0, 0, 0, 0.06)";
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 16,
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#fff",
                                fontWeight: "bold",
                                fontSize: 18,
                                boxShadow: "0 2px 8px rgba(82, 196, 26, 0.3)",
                              }}
                            >
                              {index + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <Text
                                strong
                                style={{
                                  fontSize: 15,
                                  color: "#389e0d",
                                  display: "block",
                                  marginBottom: 6,
                                }}
                              >
                                {p.roleId?.roleName ||
                                  p.position ||
                                  "Thành viên"}
                              </Text>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                  flexWrap: "wrap",
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 14,
                                    color: "#262626",
                                    fontWeight: 500,
                                  }}
                                >
                                  {p.userId?.fullName || "-"}
                                </Text>
                                {p.userId?.email && (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 13 }}
                                  >
                                    • {p.userId.email}
                                  </Text>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Modal Phê duyệt */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <CheckOutlined style={{ fontSize: 20, color: "#52c41a" }} />
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              Phê duyệt yêu cầu cuộc bầu cử
            </span>
          </div>
        }
        open={approveModalOpen}
        onCancel={() => {
          setApproveModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={650}
        centered
      >
        {selectedRecord && (
          <div>
            {/* Thông tin quyết định */}
            <div
              style={{
                background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                padding: 20,
                borderRadius: 8,
                marginBottom: 24,
                border: "1px solid #bae6fd",
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={24}>
                  <Text strong style={{ fontSize: 14, color: "#0369a1" }}>
                    Số quyết định:
                  </Text>
                  <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                    {selectedRecord.decisionNumber}
                  </div>
                </Col>
                <Col span={24}>
                  <Text strong style={{ fontSize: 14, color: "#0369a1" }}>
                    Tên nghị quyết:
                  </Text>
                  <div style={{ marginTop: 4, fontSize: 15, fontWeight: 500 }}>
                    {selectedRecord.decisionName || selectedRecord.title}
                  </div>
                </Col>
              </Row>
            </div>

            <Form form={form} layout="vertical" onFinish={submitApprove}>
              <Form.Item
                name="secretaryId"
                label={
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    Thư ký chủ tọa <span style={{ color: "red" }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: "Vui lòng chọn thư ký" }]}
              >
                <Select
                  placeholder="Chọn thư ký chủ tọa"
                  allowClear
                  showSearch
                  size="large"
                  style={{ borderRadius: 6 }}
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  onChange={(value) => {
                    // Nếu chọn thư ký trùng với ban kiểm soát, clear ban kiểm soát
                    const boardOfControlId =
                      form.getFieldValue("boardOfControlId");
                    if (value && value === boardOfControlId) {
                      form.setFieldsValue({ boardOfControlId: undefined });
                    }
                  }}
                >
                  {userList
                    .filter((user) => {
                      // Lọc bỏ user hiện tại
                      if (user._id === userId) return false;
                      // Lọc bỏ user đã chọn làm ban kiểm soát
                      const boardOfControlId =
                        form.getFieldValue("boardOfControlId");
                      return !boardOfControlId || user._id !== boardOfControlId;
                    })
                    .map((user) => (
                      <Option key={user._id} value={user._id}>
                        {user.fullName} - {user.email}
                        {typeof user.currentElectionCount === "number" && (
                          <span style={{ color: "#999", marginLeft: 8 }}>
                            (Đang tham gia {user.currentElectionCount} kỳ)
                          </span>
                        )}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="boardOfControlId"
                label={
                  <span style={{ fontSize: 15, fontWeight: 500 }}>
                    Ban kiểm soát <span style={{ color: "red" }}>*</span>
                  </span>
                }
                rules={[
                  { required: true, message: "Vui lòng chọn ban kiểm soát" },
                ]}
              >
                <Select
                  placeholder="Chọn ban kiểm soát"
                  allowClear
                  showSearch
                  size="large"
                  style={{ borderRadius: 6 }}
                  filterOption={(input, option) => {
                    const label =
                      typeof option?.label === "string"
                        ? option.label
                        : String(option?.children || "");
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                  onChange={(value) => {
                    // Nếu chọn ban kiểm soát trùng với thư ký, clear thư ký
                    const secretaryId = form.getFieldValue("secretaryId");
                    if (value && value === secretaryId) {
                      form.setFieldsValue({ secretaryId: undefined });
                    }
                  }}
                >
                  {userList
                    .filter((user) => {
                      // Lọc bỏ user hiện tại
                      if (user._id === userId) return false;
                      // Lọc bỏ user đã chọn làm thư ký
                      const secretaryId = form.getFieldValue("secretaryId");
                      return !secretaryId || user._id !== secretaryId;
                    })
                    .map((user) => (
                      <Option key={user._id} value={user._id}>
                        {user.fullName} - {user.email}
                        {typeof user.currentElectionCount === "number" && (
                          <span style={{ color: "#999", marginLeft: 8 }}>
                            (Đang tham gia {user.currentElectionCount} kỳ)
                          </span>
                        )}
                      </Option>
                    ))}
                </Select>
              </Form.Item>

              <div
                style={{
                  textAlign: "right",
                  marginTop: 32,
                  paddingTop: 20,
                  borderTop: "1px solid #f0f0f0",
                }}
              >
                <Space>
                  <Button
                    size="large"
                    onClick={() => {
                      setApproveModalOpen(false);
                      form.resetFields();
                    }}
                    style={{ minWidth: 100 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    icon={<CheckOutlined />}
                    style={{
                      backgroundColor: "#52c41a",
                      borderColor: "#52c41a",
                      minWidth: 120,
                      fontWeight: 500,
                    }}
                  >
                    Phê duyệt
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* Modal Từ chối */}
      <Modal
        open={rejectModalOpen}
        title="Từ chối quyết định"
        onOk={submitReject}
        okButtonProps={{ danger: true }}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
      >
        <Input.TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </Card>
  );
};

export default DecisionApprovalTable;
