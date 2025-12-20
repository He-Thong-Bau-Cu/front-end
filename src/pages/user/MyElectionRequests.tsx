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
  DatePicker,
  Row,
  Col,
  Select,
  Typography,
  Layout,
  Spin,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
  LeftOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import ElectionService from "@/services/ElectionService";
import SystemService from "@/services/SystemService";
import ElectionParticipantsService from "@/services/ElectionParticipantsService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import ElectionEntitiesService from "@/services/ElectionEntitiesService";
import MeetingService from "@/services/MeetingService";
import VotingRightService from "@/services/VotingRightService";
import DecisionService from "@/services/DecisionService";
import ViewDecisionModal from "@/components/preside/management-decision/ViewDecisionModal";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import HomeHeader from "@/components/homepage/HomeHeader";
import { USER_ROLE } from "@/enums/STATUS";
import { formatDate } from "@/utils/format";

const { Title, Text } = Typography;
const { Option } = Select;
const FORMAT = "YYYY-MM-DD HH:mm:ss";

// Map status từ English sang tiếng Việt
const statusMap: { [key: string]: { text: string; color: string } } = {
  APPROVED_SIGNED: { text: "Đã phê duyệt", color: "green" },
  WAIT_APPROVAL: { text: "Chờ duyệt", color: "yellow" },
  REJECTED: { text: "Từ chối", color: "red" },
  WAIT_ENTER_DATA: { text: "Chờ nhập dữ liệu", color: "orange" },
  DRAFT: { text: "Lưu nháp", color: "default" },
  REQUEST_FROM_USER: { text: "Yêu cầu từ user", color: "blue" },
};

const MyElectionRequests: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [userList, setUserList] = useState<any[]>([]);
  const [boardOfControlRoleId, setBoardOfControlRoleId] = useState<string>("");
  const [secretaryRoleId, setSecretaryRoleId] = useState<string>("");
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [voters, setVoters] = useState<any[]>([]);
  const [organize, setOrganize] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [meeting, setMeeting] = useState<any | null>(null);
  const [viewDecisionData, setViewDecisionData] = useState<any>(null);

  const userId = localStorage.getItem("userId");

  // Load danh sách user và roleId để chọn thư ký và kiểm soát viên
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
    if (isModalOpen) {
      loadData();
    }
  }, [isModalOpen]);

  // Giờ hành chính
  const WORK_START = 8;
  const WORK_END = 17;

  const disabledTime = () => {
    return {
      disabledHours: () => {
        const hours: number[] = [];
        for (let h = 0; h < 24; h++) {
          if (h < WORK_START || h >= WORK_END) hours.push(h);
        }
        return hours;
      },
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };
  };

  // Logic ngày bắt đầu tối thiểu: Hiện tại + 30 ngày
  // (Dùng startOf('day') để reset giờ về 00:00:00 cho dễ so sánh)
  const todayPlus30 = dayjs().add(30, "day").startOf("day");

  useEffect(() => {
    loadMyRequests(1, pagination.pageSize);
  }, [statusFilter]);

  useEffect(() => {
    if (searchText === "" && statusFilter === "") {
      return;
    }
    const timer = setTimeout(() => {
      loadMyRequests(1, pagination.pageSize);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchText]);

  const loadMyRequests = async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await ElectionService.getMyElectionRequests({
        page,
        limit,
        textSearch: searchText.trim() || undefined,
        statusData: statusFilter || undefined,
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

  const handleCreate = async (values: any) => {
    try {
      showLoading();

      if (!boardOfControlRoleId || !secretaryRoleId) {
        notify("Đang tải thông tin vai trò, vui lòng thử lại sau", "error");
        hideLoading();
        return;
      }

      // Tạo participants array
      const participants = [];

      if (values.secretaryId) {
        participants.push({
          userId: values.secretaryId,
          roleId: secretaryRoleId,
          position: "Thư ký chủ tọa",
        });
      }

      if (values.boardOfControlId) {
        participants.push({
          userId: values.boardOfControlId,
          roleId: boardOfControlRoleId,
          position: "Kiểm soát viên",
        });
      }

      if (participants.length === 0) {
        notify("Vui lòng chọn ít nhất một thành viên (thư ký hoặc kiểm soát viên)", "error");
        hideLoading();
        return;
      }

      const body = {
        decisionNumber: values.decisionNumber,
        decisionName: values.decisionName,
        title: values.decisionName,
        startDate: values.startDate?.format(FORMAT),
        endDate: values.endDate?.format(FORMAT),
        participants: participants,
      };

      let response;
      if (isEditMode && editingRecord) {
        // Cập nhật election request và đổi status về REQUEST_FROM_USER
        const updateBody = {
          decisionNumber: values.decisionNumber,
          decisionName: values.decisionName,
          title: values.decisionName,
          startDate: values.startDate?.format(FORMAT),
          endDate: values.endDate?.format(FORMAT),
          statusData: "REQUEST_FROM_USER",
          rejectReason: null, // Xóa lý do từ chối khi gửi lại
        };
        response = await ElectionService.updateElection(editingRecord._id, updateBody);

        if (response.success) {
          // Cập nhật participants: xóa participants cũ và tạo mới
          try {
            // Lấy danh sách participants hiện tại
            const currentParticipants = await ElectionParticipantsService.getByElectionId(editingRecord._id);

            // Xóa participants cũ (secretary và board of control)
            const secretaryParticipant = currentParticipants.find(
              (p: any) => p.roleId?.roleCode === USER_ROLE.PRESIDE_SECRETARY
            );
            const boardOfControlParticipant = currentParticipants.find(
              (p: any) => p.roleId?.roleCode === USER_ROLE.BOARD_OF_CONTROL
            );

            // Tạo lại participants mới
            if (values.secretaryId) {
              await ElectionParticipantsService.createParticipant({
                electionId: editingRecord._id,
                userId: values.secretaryId,
                roleId: secretaryRoleId,
                position: "Thư ký chủ tọa",
                status: "PENDING",
              });
            }

            if (values.boardOfControlId) {
              await ElectionParticipantsService.createParticipant({
                electionId: editingRecord._id,
                userId: values.boardOfControlId,
                roleId: boardOfControlRoleId,
                position: "Kiểm soát viên",
                status: "PENDING",
              });
            }
          } catch (participantError: any) {
            console.error("Error updating participants:", participantError);
            // Không throw error, chỉ log vì election đã được cập nhật
          }

          notify(
            response.message || "Cập nhật và gửi lại yêu cầu thành công!",
            "success"
          );
        } else {
          notify(response.message || "Cập nhật yêu cầu thất bại", "error");
        }
      } else {
        // Tạo mới
        response = await ElectionService.createElectionRequest(body);
        if (response.success) {
          notify(
            response.message ||
            "Tạo yêu cầu thành công! Đang chờ phê duyệt từ chủ tịch hội đồng quản trị.",
            "success"
          );
        } else {
          notify(response.message || "Tạo yêu cầu thất bại", "error");
        }
      }

      if (response.success) {
        setIsModalOpen(false);
        setIsEditMode(false);
        setEditingRecord(null);
        form.resetFields();
        loadMyRequests(pagination.current, pagination.pageSize);
      }
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đã có lỗi xảy ra. Vui lòng thử lại.";
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  const handleViewDecision = async (record: any) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      setViewRecord(record);

      // Load các dữ liệu cần thiết cho ViewDecisionModal
      const data1 = await ElectionDocumentService.getDocumentByElectionId(record._id);
      setDocuments(data1);

      const data3 = await ElectionEntitiesService.getElectionEntitiesByElectionId(record._id);
      setEntities(data3);

      const data4 = await ElectionParticipantsService.getByElectionId(record._id);
      const roleId1List: any = data4.filter((p: any) => p.roleId.roleCode === "VOTER");
      const otherRolesList: any = data4.filter((p: any) => p.roleId.roleCode !== "VOTER");
      setOrganize(otherRolesList ? otherRolesList : []);

      const data5 = await MeetingService.getByElectionId(record._id);
      setMeeting(data5.data[0] ? data5.data[0] : null);

      const v = await VotingRightService.getVotingRightByElectionId(record._id);
      roleId1List.forEach((voter: any) => {
        const votingRight = v.find(
          (vr: any) => vr.voterId.userId === voter.userId._id
        );
        if (votingRight) {
          voter.percent = votingRight.shares;
          voter.statusVoter = votingRight.voterId.status;
        } else {
          voter.percent = 0;
          voter.statusVoter = "INACTIVE";
        }
      });
      setVoters(roleId1List);

      // Gọi API để lấy chi tiết decision
      const decisionDetail = await DecisionService.getElectionById(record._id);
      setViewDecisionData(decisionDetail.data);
    } catch (err: any) {
      notify(err.message, "error");
      setViewModalOpen(false);
      setViewDecisionData(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setIsEditMode(true);
    setIsModalOpen(true);

    // Điền form với dữ liệu từ record
    form.setFieldsValue({
      decisionNumber: record.decisionNumber,
      decisionName: record.decisionName || record.title,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      // Lấy secretaryId và boardOfControlId từ participants nếu có
      secretaryId: record.participants?.find((p: any) => p.roleId?.roleCode === USER_ROLE.PRESIDE_SECRETARY)?.userId?._id,
      boardOfControlId: record.participants?.find((p: any) => p.roleId?.roleCode === USER_ROLE.BOARD_OF_CONTROL)?.userId?._id,
    });
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    loadMyRequests(current, pageSize);
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
      render: (date: Date | string) => formatDate(date) || "-",
    },
    {
      title: "THAO TÁC",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDecision(record)}
          >
            Xem chi tiết
          </Button>
          {record.statusData === "REJECTED" && (
            <Button
              size="small"
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              style={{
                backgroundColor: "#5C9D52",
                borderColor: "#5C9D52",
              }}
            >
              Sửa và gửi lại
            </Button>
          )}
        </Space>
      ),
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
      {/* Decorative background elements */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "40%",
          height: "40%",
          background:
            "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "30%",
          height: "30%",
          background:
            "radial-gradient(circle, rgba(18, 77, 45, 0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Title level={5} style={{ margin: 0, paddingLeft: 20 }}>
                📋 Yêu cầu tạo cuộc bầu cử của tôi
              </Title>
              <Button
                type="default"
                size="middle"
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
                style={{
                  borderRadius: 8,
                  fontWeight: 500,
                  color: "#124d2d",
                  border: "1.5px solid #3ca860",
                  background: "#f6ffed",
                }}
              >
                Quay lại
              </Button>
            </div>
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
              placeholder="Tìm kiếm theo tên quyết định..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Select
                value={statusFilter}
                onChange={(value) => {
                  setStatusFilter(value);
                  setPagination({
                    current: 1,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                  });
                }}
                style={{ width: 180 }}
                placeholder="Lọc theo trạng thái"
              >
                <Option value="">Tất cả trạng thái</Option>
                <Option value="REQUEST_FROM_USER">Yêu cầu từ user</Option>
                <Option value="WAIT_APPROVAL">Chờ duyệt</Option>
                <Option value="APPROVED_SIGNED">Đã phê duyệt</Option>
                <Option value="REJECTED">Từ chối</Option>
                <Option value="WAIT_ENTER_DATA">Chờ nhập dữ liệu</Option>
                <Option value="DRAFT">Lưu nháp</Option>
              </Select>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalOpen(true)}
                style={{
                  backgroundColor: "#5C9D52",
                  borderColor: "#5C9D52",
                }}
              >
                Tạo yêu cầu mới
              </Button>
            </div>
          </div>

          <Spin spinning={loading}>
            {data.length === 0 && !loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Không có dữ liệu yêu cầu nào</p>
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

      {/* Modal Tạo yêu cầu mới */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <FileTextOutlined style={{ fontSize: 20, color: "#5C9D52" }} />
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              {isEditMode ? "Sửa và gửi lại yêu cầu" : "Tạo yêu cầu cuộc bầu cử mới"}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingRecord(null);
          form.resetFields();
        }}
        footer={null}
        width={750}
        centered
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleCreate}
          style={{ marginTop: 20 }}
        >
          {/* Hiển thị lý do từ chối nếu đang sửa */}
          {isEditMode && editingRecord?.rejectReason && (
            <div
              style={{
                padding: "12px 16px",
                marginBottom: 20,
                backgroundColor: "#fff2f0",
                border: "1px solid #ffccc7",
                borderRadius: 6,
              }}
            >
              <Text strong style={{ color: "#ff4d4f", display: "block", marginBottom: 8 }}>
                Lý do từ chối:
              </Text>
              <Text style={{ color: "#ff4d4f" }}>{editingRecord.rejectReason}</Text>
            </div>
          )}
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Form.Item
                name="decisionNumber"
                label="Số quyết định"
                rules={[
                  { required: true, message: "Vui lòng nhập số quyết định" },
                ]}
              >
                <Input placeholder="VD: QĐ-15/2025/QH-16" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="decisionName"
                label="Tên nghị quyết"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nghị quyết" },
                ]}
              >
                <Input placeholder="Nhập tên nghị quyết" />
              </Form.Item>
            </Col>

            {/* DATE RANGE - ĐÃ CẬP NHẬT LOGIC */}
            <Row gutter={20} style={{ width: "100%" }}>
              {/* Thời gian bắt đầu */}
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Thời gian bắt đầu"
                  rules={[{ required: true, message: "Vui lòng chọn thời gian bắt đầu" }]}
                >
                  <DatePicker
                    showTime={{
                      format: "HH:mm",
                      disabledTime,   // Áp dụng giới hạn giờ hành chính
                    }}
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Chọn thời gian bắt đầu"
                    // Không cho chọn ngày trước hiện tại + 30 ngày
                    disabledDate={(current) => current && current < todayPlus30}
                    onChange={(value) => {
                      form.setFieldsValue({ startDate: value }); // Cập nhật ngay để end date check
                      if (value) {
                        notify(
                          "Chú ý: Ngày bắt đầu và ngày kết thúc phải cách ngày hiện tại tối thiểu 30 ngày.",
                          "info"
                        );
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              {/* Thời gian kết thúc */}
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Thời gian kết thúc"
                  dependencies={["startDate"]}
                  rules={[
                    { required: true, message: "Vui lòng chọn thời gian kết thúc" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const start = getFieldValue("startDate");
                        if (!value || !start) return Promise.resolve();

                        // Cho phép cùng ngày nhưng giờ phải sau
                        if (value.isBefore(start)) {
                          return Promise.reject(
                            "Thời gian kết thúc phải sau thời gian bắt đầu"
                          );
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <DatePicker
                    showTime={{
                      format: "HH:mm",
                      disabledTime, // Áp dụng giới hạn giờ hành chính
                    }}
                    format={FORMAT}
                    style={{ width: "100%" }}
                    placeholder="Chọn thời gian kết thúc"
                    // Logic chặn ngày cho endDate
                    disabledDate={(current) => {
                      const start = form.getFieldValue("startDate");
                      // Nếu chưa chọn start thì disable ngày < todayPlus30
                      if (!start) return current && current < todayPlus30;
                      // Nếu đã chọn start thì disable các ngày trước start
                      return current && current < start.startOf("day");
                    }}
                    onChange={(value) => {
                      const nowLimit = todayPlus30;
                      const start = form.getFieldValue("startDate");
                      // Nếu người dùng chọn ngày kết thúc trong quá khứ so với giới hạn, tự sửa
                      if (!value || value.isBefore(nowLimit)) {
                        const fixed = start && start.isAfter(nowLimit) ? start : nowLimit;
                        form.setFieldsValue({ endDate: fixed });
                        notify("Thời gian không hợp lệ, hệ thống đã tự điều chỉnh về thời gian hợp lệ", "warning");
                        return;
                      }
                      form.setFieldsValue({ endDate: value });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Thư ký */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.boardOfControlId !== currentValues.boardOfControlId
              }
            >
              {({ getFieldValue }) => {
                const boardOfControlId = getFieldValue("boardOfControlId");
                return (
                  <Col span={24}>
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
                        onChange={(value) => {
                          // Nếu chọn thư ký trùng với kiểm soát viên, clear kiểm soát viên
                          if (value && value === boardOfControlId) {
                            form.setFieldsValue({ boardOfControlId: undefined });
                          }
                        }}
                      >
                        {userList
                          .filter((user) => {
                            // Lọc bỏ user hiện tại
                            if (user._id === userId) return false;
                            // Lọc bỏ user đã chọn làm kiểm soát viên
                            return !boardOfControlId || user._id !== boardOfControlId;
                          })
                          .map((user) => (
                            <Option key={user._id} value={user._id}>
                              {user.fullName} - {user.email}
                              {typeof user.currentElectionCount === "number" && (
                                <span style={{ color: "#999", marginLeft: 8 }}>
                                  {/* (Đang tham gia {user.currentElectionCount} kỳ) */}
                                </span>
                              )}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }}
            </Form.Item>

            {/* Kiểm soát viên */}
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.secretaryId !== currentValues.secretaryId
              }
            >
              {({ getFieldValue }) => {
                const secretaryId = getFieldValue("secretaryId");
                return (
                  <Col span={24}>
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
                        onChange={(value) => {
                          // Nếu chọn kiểm soát viên trùng với thư ký, clear thư ký
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
                            return !secretaryId || user._id !== secretaryId;
                          })
                          .map((user) => (
                            <Option key={user._id} value={user._id}>
                              {user.fullName} - {user.email}
                            </Option>
                          ))}
                      </Select>
                    </Form.Item>
                  </Col>
                );
              }}
            </Form.Item>
          </Row>

          <div style={{ textAlign: "right", marginTop: 24 }}>
            <Button
              onClick={() => {
                setIsModalOpen(false);
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
                fontWeight: 600,
              }}
            >
              {isEditMode ? "Gửi lại yêu cầu" : "Gửi yêu cầu"}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal Xem chi tiết - Sử dụng ViewDecisionModal giống màn quản lý quyết định */}
      <ViewDecisionModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewDecisionData(null);
        }}
        data={viewDecisionData}
        loading={viewLoading}
        voters={voters}
        organize={organize}
        documents={documents}
        electionentities={entities}
        meeting={meeting}
      />
    </Layout>
  );
};

export default MyElectionRequests;
