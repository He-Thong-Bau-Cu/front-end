import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Select,
  DatePicker,
  Row,
  Col,
  Tag,
  Avatar,
  Descriptions,
  Space,
  Divider,
  Table,
  Modal,
  message,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import "@/style/secretary/MettingInfo.model.css";
import { ElectionTypes } from "@/types/ElectionTypes.interface";
import { Threshols } from "@/types/Threshols.interface";
import { VotingMethods } from "@/types/VotingMethods.interface";
import VotingMethodsService from "@/services/VotingMethodsService";
import ElectionTypesService from "@/services/ElectionTypesService";
import ThresholdsService from "@/services/ThresholdsService";
import VotingMethodModal from "./VotingMethodModal";
import VotingMethodSelectModal from "./VotingMethodSelectModal";
import ThresholdModal from "./ThresholdModal";
const { Title, Text } = Typography;

interface Props {
  onChange: (data: any) => void;
  data?: any;
  electionentities?: any;
  meeting?: any;
  disabled?: boolean;
}

interface MeetingFormValues {
  decisionName?: string;
  decisionNumber?: string;
  location?: string;
  method?: string;
  methodName?: string;
  type?: any;
  threshold?: any;
  thresholdName?: string;
  authorizationStart?: Dayjs | null;
  authorizationEnd?: Dayjs | null;
  candidates?: any[];
}

const MeetingInfo: React.FC<Props> = ({
  onChange,
  data,
  electionentities,
  meeting,
  disabled = false,
}) => {
  const [form] = Form.useForm<MeetingFormValues>();
  const [typeOther, setTypeOther] = useState(false);
  const [voteMethod, setVoteMethod] = useState<string>("");
  const [types, setTypes] = useState<ElectionTypes[] | null>(null);
  const [thresholds, setThresholds] = useState<Threshols[] | null>(null);
  const [methods, setMethods] = useState<VotingMethods[] | null>(null);
  const [isVotingMethodSelectModalOpen, setIsVotingMethodSelectModalOpen] =
    useState(false);
  const [isVotingMethodModalOpen, setIsVotingMethodModalOpen] = useState(false);
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedThreshold, setSelectedThreshold] = useState<Threshols | null>(
    null
  );
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [editCandidateIndex, setEditCandidateIndex] = useState<number | null>(
    null
  );
  const [searchText, setSearchText] = useState<string>("");
  // Removed complex state flags to simplify logic
  const isMountedRef = useRef(true);
  /* ===========================================================
     FETCH DATA ONCE
  ============================================================ */
  const fetchData = async () => {
    try {
      const res = await VotingMethodsService.searchVotingMethod({});
      const type = await ElectionTypesService.searchElectionType({});
      const th = await ThresholdsService.searchThreshold({});
      setTypes(type);
      setMethods(res);
      setThresholds(th);
    } catch (error) {
      console.error("Error fetching voting methods:", error);
      setMethods([]);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (isMounted) {
          await fetchData();
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading data:", error);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Simple useEffect for electionentities - no complex dependencies
  useEffect(() => {
    let isMounted = true;

    if (electionentities && Array.isArray(electionentities) && electionentities.length > 0 && isMounted) {
      try {
        const loadedCandidates = electionentities.map((c: any) => ({
          _id: c._id,
          title: c.title || "",
          description: c.description || "",
          metaData: {
            fullName: c.metaData?.fullName || "",
            age: c.metaData?.age || "",
            department: c.metaData?.department || "",
            position: c.metaData?.position || "",
            experience: c.metaData?.experience || "",
            achievements: c.metaData?.achievements || "",
            image: c.metaData?.image || c.metaData?.imageUrl || "",
          },
          fileUrl: c.fileUrl || c.file || "",
        }));

        if (isMounted) {
          setCandidates(loadedCandidates);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading candidates:", error);
        }
      }
    }

    return () => {
      isMounted = false;
    };
  }, [electionentities]);

  // Emit change when candidates change - with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current) {
        try {
          const values = form.getFieldsValue(true);
          values.candidates = candidates;
          onChange(values);
        } catch (error) {
          console.error("Error emitting candidates change:", error);
        }
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [candidates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (data?.data) {
      const d = data.data;

      try {
        form.setFieldsValue({
          decisionNumber: d?.election?.decisionNumber,
          decisionName: d?.election?.decisionName,
          method: d?.meetingInfo.methodDetails?._id,
          methodName: d?.meetingInfo.methodDetails?.methodName,
          type: d?.meetingInfo.typeDetails?._id,
          threshold: d?.meetingInfo?.thresholdDetails?._id,
          thresholdName: d?.meetingInfo?.thresholdDetails?.thresholdName,
          authorizationStart: d?.election?.delegationStart
            ? dayjs(d.election.delegationStart)
            : null,
          authorizationEnd: d?.election?.delegationEnd
            ? dayjs(d.election.delegationEnd)
            : null,
        });

        setVoteMethod(d?.meetingInfo.methodDetails?._id);

        if (d?.meetingInfo?.thresholdDetails?._id) {
          loadThresholdData(d.meetingInfo.thresholdDetails._id);
        }
        if (meeting?.location) {
          form.setFieldsValue({
            location: meeting.location,
          });
        }

        // Emit change once after all updates
        timeoutId = setTimeout(() => {
          try {
            const values = form.getFieldsValue(true);
            values.candidates = candidates;
            onChange(values);
          } catch (error) {
            console.error("Error emitting change:", error);
          }
        }, 100);
      } catch (error) {
        console.error("Error setting form values:", error);
      }
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [data, meeting]);

  const loadThresholdData = async (thresholdId: string) => {
    try {
      const threshold = await ThresholdsService.getThresholdById(thresholdId);
      setSelectedThreshold(threshold);
    } catch (error) {
      console.error("Error loading threshold:", error);
    }
  };

  /* ===========================================================
     EMIT VALUE TO PARENT (NHƯ DIGITALSIGNMODAL)
  ============================================================ */
  const emitChange = useCallback((updatedCandidates?: any[]) => {
    try {
      const values = form.getFieldsValue(true);
      values.candidates = updatedCandidates !== undefined ? updatedCandidates : candidates;
      onChange(values);
    } catch (error) {
      console.error("Error in emitChange:", error);
    }
  }, [candidates, form, onChange]);

  const handleVotingMethodSelect = useCallback((methodId: string, methodName: string) => {
    if (!isMountedRef.current) return;

    setVoteMethod(methodId);
    form.setFieldsValue({ method: methodId, methodName: methodName });
    setCandidates([]);
    setIsVotingMethodSelectModalOpen(false);

    // Emit change after state updates
    setTimeout(() => {
      if (isMountedRef.current) {
        try {
          const values = form.getFieldsValue(true);
          values.candidates = [];
          onChange(values);
        } catch (error) {
          console.error("Error in handleVotingMethodSelect:", error);
        }
      }
    }, 50);
  }, [form, onChange]);

  const handleCandidatesModalSubmit = (newCandidates: any[]) => {
    let updatedCandidates: any[] = [];

    if (editCandidateIndex !== null && editCandidateIndex >= 0) {
      updatedCandidates = [...candidates];
      const existingCandidate = updatedCandidates[editCandidateIndex];
      // Giữ lại _id từ candidate cũ nếu có
      updatedCandidates[editCandidateIndex] = {
        ...newCandidates[0], // Lấy candidate đầu tiên từ modal (vì edit chỉ edit 1 candidate)
        _id: existingCandidate?._id, // Giữ lại _id nếu có
      };
      setEditCandidateIndex(null);
    } else {
      // Thêm mới: merge với candidates hiện có, giữ lại _id của candidates cũ
      updatedCandidates = newCandidates.map((newCandidate, index) => {
        // Tìm candidate cũ tại cùng index (nếu có)
        const existingCandidate = candidates[index];
        if (existingCandidate && existingCandidate._id) {
          // Nếu candidate cũ có _id, giữ lại _id và merge data
          return {
            ...newCandidate,
            _id: existingCandidate._id,
          };
        }
        // Candidate mới, không có _id
        return newCandidate;
      });
    }

    console.log("Before setCandidates:", candidates);
    console.log("New candidates to set:", updatedCandidates);
    setCandidates(updatedCandidates);

    // Emit ngay với updatedCandidates để tránh dùng state cũ
    emitChange(updatedCandidates); // Emit về parent để lưu vào meetingInfo.candidates
  };

  const selectedMethodName =
    methods?.find((m) => m._id === voteMethod)?.methodName || "";

  const handleThresholdSelect = useCallback((
    thresholdId: string,
    thresholdName: string
  ) => {
    if (!isMountedRef.current) return;

    form.setFieldsValue({ threshold: thresholdId, thresholdName: thresholdName });
    loadThresholdData(thresholdId);
    setIsThresholdModalOpen(false);

    // Emit change after state updates
    setTimeout(() => {
      if (isMountedRef.current) {
        try {
          const values = form.getFieldsValue(true);
          values.candidates = candidates;
          onChange(values);
        } catch (error) {
          console.error("Error in handleThresholdSelect:", error);
        }
      }
    }, 50);
  }, [form, candidates, onChange]);

  // Xử lý View candidate
  const handleViewCandidate = (candidate: any, index: number) => {
    setSelectedCandidate({ ...candidate, index });
    setViewModalVisible(true);
  };

  // Xử lý Edit candidate - mở modal với candidate đã chọn
  const handleEditCandidate = (index: number) => {
    setEditCandidateIndex(index);
    setIsVotingMethodModalOpen(true);
  };

  // Xử lý Delete candidate
  const handleDeleteCandidate = (index: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa nội dung bầu chọn này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => {
        const newCandidates = candidates.filter((_, i) => i !== index);
        setCandidates(newCandidates);
        // Emit ngay với newCandidates để tránh dùng state cũ
        emitChange(newCandidates);
        message.success("Đã xóa nội dung bầu chọn");
      },
    });
  };

  // Lọc candidates theo search text
  const filteredCandidates = candidates.filter((candidate) => {
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
    <Card
      className="meeting-side-card"
      title={
        <div className="card-header">
          <Text style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
            📄 Nội dung Quyết định
          </Text>
        </div>
      }
    >
      {/* Form KHÔNG submit, chỉ emitChange */}
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          {/* ĐỊA ĐIỂM */}
          <Col span={12}>
            <Form.Item
              label="Số nghị quyết"
              name="decisionNumber"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input disabled={disabled} placeholder="Nhập số nghị quyết" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Tên nghị quyết"
              name="decisionName"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input disabled={disabled} placeholder="Nhập tên nghị quyết" />
            </Form.Item>
          </Col>

          {/* ĐỊA ĐIỂM */}
          <Col span={12}>
            <Form.Item
              label="Địa điểm"
              name="location"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input placeholder="Nhập địa điểm tổ chức" disabled={disabled} />
            </Form.Item>
          </Col>

          {/* PHƯƠNG THỨC BẦU CỬ */}
          <Col span={12}>
            {/* Hidden field for method ID */}
            <Form.Item name="method" hidden>
              <Input disabled={disabled} />
            </Form.Item>
            <Form.Item
              label="Hình thức bầu cử"
              name="methodName"
              rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
            >
              <Input
                placeholder="Chọn hình thức bầu cử"
                readOnly
                disabled={disabled}
                value={selectedMethodName}
                onClick={() => !disabled && setIsVotingMethodSelectModalOpen(true)}
                style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                suffix={
                  <FolderOutlined
                    style={{ color: disabled ? "#ccc" : "#52c41a", cursor: disabled ? "not-allowed" : "pointer" }}
                    onClick={() => !disabled && setIsVotingMethodSelectModalOpen(true)}
                  />
                }
              />
            </Form.Item>
          </Col>

          {/* THỂ LOẠI BẦU CỬ */}
          <Col span={12}>
            <Form.Item label="Thể loại bầu cử" name="type" required>
              {!typeOther ? (
                <Select
                  placeholder="Chọn thể loại"
                  disabled={disabled}
                  onChange={(v) => {
                    if (disabled) return;
                    if (v === "other") {
                      setTypeOther(true);

                      form.setFieldsValue({
                        type: {
                          typeName: "",
                          typeCode: "",
                          description: "",
                        },
                      });
                    } else {
                      setTypeOther(false);
                      form.setFieldsValue({ type: v });
                    }
                    emitChange();
                  }}
                >
                  <Select.Option value="other">Khác…</Select.Option>
                  {types?.map((item) => (
                    <Select.Option key={item._id} value={item._id}>
                      {item.typeName}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <>
                  <Form.Item
                    label="Tên thể loại"
                    name={["type", "typeName"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Tên thể loại" disabled={disabled} />
                  </Form.Item>

                  <Form.Item
                    label="Mã thể loại"
                    name={["type", "typeCode"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Mã thể loại" disabled={disabled} />
                  </Form.Item>

                  <Form.Item label="Mô tả" name={["type", "description"]}>
                    <Input.TextArea rows={2} disabled={disabled} />
                  </Form.Item>

                  <Button type="link" onClick={() => !disabled && setTypeOther(false)} disabled={disabled}>
                    ← Quay lại
                  </Button>
                </>
              )}
            </Form.Item>
          </Col>
          {/* NGƯỠNG THÔNG QUA */}
          <Col span={12}>
            {/* Hidden field for threshold ID */}
            <Form.Item name="threshold" hidden>
              <Input disabled={disabled} />
            </Form.Item>
            <Form.Item label="Ngưỡng thông qua" name="thresholdName" required>
              <Input
                placeholder="Chọn ngưỡng thông qua"
                readOnly
                disabled={disabled}
                value={selectedThreshold?.thresholdName || ""}
                onClick={() => !disabled && setIsThresholdModalOpen(true)}
                style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                suffix={
                  <FolderOutlined
                    style={{ color: disabled ? "#ccc" : "#52c41a", cursor: disabled ? "not-allowed" : "pointer" }}
                    onClick={() => !disabled && setIsThresholdModalOpen(true)}
                  />
                }
              />
            </Form.Item>
          </Col>

          {/* NGÀY BẮT ĐẦU */}
          <Col span={12}>
            <Form.Item
              label="Ngày bắt đầu ủy quyền"
              name="authorizationStart"
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled={disabled}
                disabledDate={(d) => d && d < dayjs().startOf("day")}
              />
            </Form.Item>
          </Col>

          {/* NGÀY KẾT THÚC */}
          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc ủy quyền"
              name="authorizationEnd"
              rules={[{ required: true }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled={disabled}
                disabledDate={(d) => {
                  const start = form.getFieldValue("authorizationStart");
                  if (!start) return d && d < dayjs().startOf("day");
                  return d && d < start;
                }}
              />
            </Form.Item>
          </Col>

          {/* DANH SÁCH BẦU CHỌN */}
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
                  <Text
                    strong
                    style={{ fontSize: 15, display: "block", marginBottom: 4 }}
                  >
                    📄 Danh sách bầu chọn
                  </Text>
                  {voteMethod && candidates.length > 0 && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Tổng: {candidates.length} nội dung bầu chọn
                    </Text>
                  )}
                </div>
                {voteMethod && (
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <Input
                      placeholder="Tìm kiếm..."
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => !disabled && setSearchText(e.target.value)}
                      allowClear
                      disabled={disabled}
                      style={{ width: 250 }}
                    />
                    <a
                      className="add-link"
                      onClick={() => {
                        if (disabled) return;
                        setEditCandidateIndex(null);
                        setIsVotingMethodModalOpen(true);
                      }}
                      style={{
                        cursor: disabled ? "not-allowed" : "pointer",
                        whiteSpace: "nowrap",
                        opacity: disabled ? 0.5 : 1,
                        pointerEvents: disabled ? "none" : "auto"
                      }}
                    >
                      + Thêm mới
                    </a>
                  </div>
                )}
              </div>

              {!voteMethod ? (
                <Card>
                  <p
                    style={{
                      color: "#ff4d4f",
                      margin: 0,
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    ⚠️ Vui lòng chọn hình thức bầu cử để quản lý danh sách bầu
                    chọn
                  </p>
                </Card>
              ) : (
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
                    const hasFile = filteredCandidates.some((c) => c.file);

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
                          record.file ? (
                            <Tooltip title="Có tài liệu đính kèm">
                              <Tag
                                icon={<FileTextOutlined />}
                                color="green"
                                style={{ cursor: "pointer" }}
                              >
                                File
                              </Tag>
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
                                disabled={disabled}
                                onClick={() => !disabled && handleViewCandidate(record, index)}
                                style={{
                                  color: disabled ? "#ccc" : "#52c41a",
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa">
                              <Button
                                type="text"
                                icon={<EditOutlined />}
                                size="small"
                                disabled={disabled}
                                onClick={() => !disabled && handleEditCandidate(index)}
                                style={{
                                  color: disabled ? "#ccc" : "#f59e0b",
                                }}
                              />
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                size="small"
                                disabled={disabled}
                                onClick={() => !disabled && handleDeleteCandidate(index)}
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
                        ? `${range[0]}-${range[1]} của ${total} kết quả (Tổng: ${candidates.length})`
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
                          Chưa có nội dung bầu chọn. Nhấn "Thêm mới" ở trên để thêm.
                        </p>
                      </div>
                    ),
                  }}
                />
              )}
            </div>
          </Col>
        </Row>
      </Form>

      {/* Modal chọn hình thức bầu cử */}
      <VotingMethodSelectModal
        open={isVotingMethodSelectModalOpen}
        onCancel={() => setIsVotingMethodSelectModalOpen(false)}
        onSelect={handleVotingMethodSelect}
        selectedMethodId={voteMethod}
      />

      {/* Modal quản lý danh sách bầu chọn */}
      <VotingMethodModal
        open={isVotingMethodModalOpen}
        onCancel={() => {
          setIsVotingMethodModalOpen(false);
          setEditCandidateIndex(null);
        }}
        onSubmit={(newCandidates) => {
          handleCandidatesModalSubmit(newCandidates);
        }}
        methods={methods || []}
        selectedMethodId={voteMethod}
        initialCandidates={
          editCandidateIndex !== null && editCandidateIndex >= 0
            ? [candidates[editCandidateIndex]] // Chỉ truyền candidate đang edit
            : candidates // Truyền tất cả nếu thêm mới
        }
      />

      {/* Modal xem chi tiết candidate */}
      <Modal
        open={viewModalVisible}
        title={
          <span style={{ fontSize: "18px", fontWeight: 600 }}>
            Chi tiết nội dung bầu chọn
          </span>
        }
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedCandidate(null);
        }}
        footer={[
          <Button
            key="close"
            onClick={() => {
              setViewModalVisible(false);
              setSelectedCandidate(null);
            }}
          >
            Đóng
          </Button>,
        ]}
        width={700}
        destroyOnClose
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
              {selectedCandidate.metaData?.fullName && (
                <>
                  <Descriptions.Item label="Họ và tên">
                    {selectedCandidate.metaData.fullName}
                  </Descriptions.Item>
                  {selectedCandidate.metaData.age && (
                    <Descriptions.Item label="Tuổi">
                      {selectedCandidate.metaData.age}
                    </Descriptions.Item>
                  )}
                  {selectedCandidate.metaData.department && (
                    <Descriptions.Item label="Phòng ban">
                      {selectedCandidate.metaData.department}
                    </Descriptions.Item>
                  )}
                  {selectedCandidate.metaData.position && (
                    <Descriptions.Item label="Vị trí">
                      {selectedCandidate.metaData.position}
                    </Descriptions.Item>
                  )}
                  {selectedCandidate.metaData.experience && (
                    <Descriptions.Item label="Kinh nghiệm">
                      {selectedCandidate.metaData.experience}
                    </Descriptions.Item>
                  )}
                  {selectedCandidate.metaData.achievements && (
                    <Descriptions.Item label="Thành tích">
                      {selectedCandidate.metaData.achievements}
                    </Descriptions.Item>
                  )}
                </>
              )}
              {selectedCandidate.file && (
                <Descriptions.Item label="File đính kèm">
                  <Tag icon={<FileTextOutlined />} color="green">
                    Có tài liệu đính kèm
                  </Tag>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Modal quản lý ngưỡng thông qua */}
      <ThresholdModal
        open={isThresholdModalOpen}
        onCancel={() => setIsThresholdModalOpen(false)}
        onSelect={handleThresholdSelect}
        selectedThresholdId={form.getFieldValue("threshold")}
      />
    </Card>
  );
};

export default React.memo(MeetingInfo);
