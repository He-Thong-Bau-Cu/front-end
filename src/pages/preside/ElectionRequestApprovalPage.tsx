import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Select,
  message,
  Typography,
  Layout,
  Spin,
} from "antd";
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ElectionService from "@/services/ElectionService";
import SystemService from "@/services/SystemService";
import { formatDate } from "@/utils/format";
import HomeHeader from "@/components/homepage/HomeHeader";
import { USER_ROLE } from "@/enums/STATUS";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

// Map status từ English sang tiếng Việt
const statusMap: { [key: string]: { text: string; color: string } } = {
  REQUEST_FROM_USER: { text: "Yêu cầu từ user", color: "blue" },
  REJECTED: { text: "Đã từ chối", color: "red" },
  WAIT_ENTER_DATA: { text: "Chờ nhập dữ liệu", color: "orange" },
  WAIT_APPROVAL: { text: "Chờ duyệt", color: "yellow" },
  APPROVED_SIGNED: { text: "Đã phê duyệt", color: "green" },
  DRAFT: { text: "Lưu nháp", color: "default" },
};

const ElectionRequestApprovalPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [userList, setUserList] = useState<any[]>([]);
  const [boardOfControlRoleId, setBoardOfControlRoleId] = useState<string>("");
  const [secretaryRoleId, setSecretaryRoleId] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");

  const userId = localStorage.getItem("userId");

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
          const boardOfControlRole = roles.find((r: any) => r.roleCode === USER_ROLE.BOARD_OF_CONTROL);
          const secretaryRole = roles.find((r: any) => r.roleCode === USER_ROLE.PRESIDE_SECRETARY);

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
    loadElectionRequests(1, pagination.pageSize);
  }, []);

  useEffect(() => {
    if (searchText === "") {
      loadElectionRequests(1, pagination.pageSize);
      return;
    }
    const timer = setTimeout(() => {
      loadElectionRequests(1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const loadElectionRequests = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await ElectionService.getElectionRequestsForApproval({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
      });

      if (response.success && response.data) {
        setData(response.data.content || []);
        setPagination({
          current: response.data.page || page,
          pageSize: response.data.limit || limit,
          total: response.data.totalItems || 0,
        });
      }
    } catch (error: any) {
      notify(error?.message || "Không thể tải danh sách yêu cầu", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: any) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
    setApproveModalOpen(false);
  };

  const handleApprove = (record: any) => {
    setSelectedRecord(record);
    setViewModalOpen(true);
    setApproveModalOpen(true);

    // Tìm thư ký và kiểm soát viên từ participants
    const secretary = record.participants?.find((p: any) => {
      const roleCode = p.roleId?.roleCode || (p.roleId?.roleCode === undefined && p.roleId === secretaryRoleId);
      return roleCode === USER_ROLE.PRESIDE_SECRETARY || p.roleId?._id === secretaryRoleId;
    });
    const boardOfControl = record.participants?.find((p: any) => {
      const roleCode = p.roleId?.roleCode || (p.roleId?.roleCode === undefined && p.roleId === boardOfControlRoleId);
      return roleCode === USER_ROLE.BOARD_OF_CONTROL || p.roleId?._id === boardOfControlRoleId;
    });

    form.setFieldsValue({
      secretaryId: secretary?.userId?._id || secretary?.userId || undefined,
      boardOfControlId: boardOfControl?.userId?._id || boardOfControl?.userId || undefined,
    });
  };

  const handleReject = (record: any) => {
    setSelectedRecord(record);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const submitApprove = async () => {
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
        setViewModalOpen(false);
        form.resetFields();
        // Gọi lại hàm fetchData để cập nhật danh sách
        await loadElectionRequests(pagination.current, pagination.pageSize);
        // Cập nhật selectedRecord để ẩn nút từ chối nếu modal vẫn mở
        if (selectedRecord) {
          setSelectedRecord({
            ...selectedRecord,
            statusData: "APPROVED_SIGNED",
          });
        }
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
      message.error("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      showLoading();
      const response = await ElectionService.rejectElectionRequest(
        selectedRecord._id,
        rejectReason
      );

      if (response.success) {
        notify("Từ chối yêu cầu thành công!", "success");
        setRejectModalOpen(false);
        setRejectReason("");
        loadElectionRequests(pagination.current, pagination.pageSize);
      } else {
        notify(response.message || "Từ chối yêu cầu thất bại", "error");
      }
    } catch (error: any) {
      notify(error?.message || "Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      hideLoading();
    }
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    loadElectionRequests(current, pageSize);
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
      title: "SỐ QUYẾT ĐỊNH",
      dataIndex: "decisionNumber",
      key: "decisionNumber",
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "TÊN QUYẾT ĐỊNH",
      dataIndex: "decisionName",
      key: "decisionName",
    },
    {
      title: "TRẠNG THÁI",
      dataIndex: "statusData",
      key: "statusData",
      render: (statusData: string) => {
        const statusInfo = statusMap[statusData] || {
          text: statusData,
          color: "default",
        };
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        );
      },
    },
    {
      title: "NGÀY TẠO",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: Date | string) => {
        if (!date) return "-";
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDate(dateObj) || "-";
      },
    },
    {
      title: "THAO TÁC",
      key: "actions",
      render: (_: any, record: any) => {
        // Ẩn nút từ chối nếu đã phê duyệt
        const isApproved = record.statusData === "APPROVED_SIGNED" ||
                          record.statusData === "WAIT_ENTER_DATA" ||
                          record.statusData === "WAIT_APPROVAL";
        return (
          <Space>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              Xem
            </Button>
            {!isApproved && (
              <>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record)}
                >
                  Duyệt
                </Button>
                <Button
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record)}
                >
                  Từ chối
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <Layout
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #fafcfb 100%)",
        minWidth: "100vw",
        paddingBottom: "32px",
        position: "relative",
      }}
    >
      <HomeHeader />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          paddingTop: 50,
        }}
      >
        <Card
          style={{
            borderRadius: 12,
            width: "90%",
          }}
          title={
            <Title level={5} style={{ margin: 0, paddingLeft: 20 }}>
              📋 Phê duyệt yêu cầu cuộc bầu cử
            </Title>
          }
        >
          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <Input
              placeholder="Tìm kiếm theo số quyết định, tên quyết định..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Button onClick={() => loadElectionRequests(pagination.current, pagination.pageSize)}>
              Làm mới
            </Button>
          </div>

          <Spin spinning={loading}>
            {data.length === 0 && !loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Không có yêu cầu nào cần phê duyệt</p>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={data}
                rowKey="_id"
                loading={loading}
                pagination={{
                  current: pagination.current,
                  pageSize: pagination.pageSize,
                  total: pagination.total,
                  showSizeChanger: true,
                  showTotal: (total) => `Tổng ${total} yêu cầu`,
                }}
                onChange={handleTableChange}
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* Modal Xem chi tiết */}
      <Modal
        title={approveModalOpen ? "Duyệt yêu cầu cuộc bầu cử" : "Chi tiết yêu cầu cuộc bầu cử"}
        open={viewModalOpen}
        onCancel={() => {
          setViewModalOpen(false);
          setApproveModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
        centered
      >
        {selectedRecord && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Số quyết định:</Text>
                <div>{selectedRecord.decisionNumber}</div>
              </Col>
              <Col span={12}>
                <Text strong>Tên nghị quyết:</Text>
                <div>{selectedRecord.decisionName || selectedRecord.title}</div>
              </Col>
              <Col span={12}>
                <Text strong>Thời gian bắt đầu:</Text>
                <div>{formatDate(selectedRecord.startDate) || "-"}</div>
              </Col>
              <Col span={12}>
                <Text strong>Thời gian kết thúc:</Text>
                <div>{formatDate(selectedRecord.endDate) || "-"}</div>
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <div>
                  <Tag color={statusMap[selectedRecord.statusData]?.color || "default"}>
                    {statusMap[selectedRecord.statusData]?.text || selectedRecord.statusData}
                  </Tag>
                </div>
              </Col>
              {selectedRecord.rejectReason && (
                <Col span={24}>
                  <Text strong>Lý do từ chối:</Text>
                  <div>{selectedRecord.rejectReason}</div>
                </Col>
              )}
            </Row>

            {approveModalOpen && (
              <Form
                form={form}
                layout="vertical"
                onFinish={submitApprove}
              >
                <Form.Item
                  name="secretaryId"
                  label="Thư ký chủ tọa"
                  rules={[
                    { required: true, message: "Vui lòng chọn thư ký" },
                  ]}
                >
                  <Select
                    placeholder="Chọn thư ký"
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      const label = typeof option?.label === 'string'
                        ? option.label
                        : String(option?.children || '');
                      return label.toLowerCase().includes(input.toLowerCase());
                    }}
                  >
                    {userList
                      .filter((user) => {
                        // Lọc bỏ user hiện tại
                        if (user._id === userId) return false;
                        // Lọc bỏ user đã chọn làm kiểm soát viên
                        const boardOfControlId = form.getFieldValue("boardOfControlId");
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
                  label="Kiểm soát viên"
                  rules={[
                    { required: true, message: "Vui lòng chọn kiểm soát viên" },
                  ]}
                >
                  <Select
                    placeholder="Chọn kiểm soát viên"
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      const label = typeof option?.label === 'string'
                        ? option.label
                        : String(option?.children || '');
                      return label.toLowerCase().includes(input.toLowerCase());
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
                        </Option>
                      ))}
                  </Select>
                </Form.Item>

                <div style={{ textAlign: "right", marginTop: 24 }}>
                  <Button
                    onClick={() => {
                      setApproveModalOpen(false);
                      setViewModalOpen(false);
                      form.resetFields();
                    }}
                    style={{ marginRight: 12 }}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{
                      backgroundColor: "#5C9D52",
                      borderColor: "#5C9D52",
                    }}
                  >
                    Duyệt
                  </Button>
                </div>
              </Form>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Từ chối */}
      <Modal
        title="Từ chối yêu cầu"
        open={rejectModalOpen}
        onOk={submitReject}
        okButtonProps={{ danger: true }}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectReason("");
        }}
      >
        <TextArea
          rows={4}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </Layout>
  );
};

export default ElectionRequestApprovalPage;

