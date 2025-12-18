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
  Alert,
} from "antd";
import {
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  SearchOutlined,
  FolderOutlined,
  CalendarOutlined,
  BankOutlined,
  TeamOutlined,
  TrophyOutlined,
  ProjectOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  AimOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
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
import FileService from "@/services/FileService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { downloadBlob } from "@/utils/file";
const { Title, Text } = Typography;

interface Props {
  onChange: (data: any) => void;
  data?: any;
  electionentities?: any;
  meeting?: any;
  disabled?: boolean;
  electionId?: string; // ID của election để check hash
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
  electionId,
}) => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [form] = Form.useForm<MeetingFormValues>();
  const [voteMethod, setVoteMethod] = useState<string>("");
  const [types, setTypes] = useState<ElectionTypes[]>([]);
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
  const [electionStartDate, setElectionStartDate] = useState<Dayjs | null>(null);
  const [electionEndDate, setElectionEndDate] = useState<Dayjs | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [formType, setFormType] = useState<"person" | "project" | "other" | null>(null);
  /* ===========================================================
     FETCH DATA ONCE
  ============================================================ */
  const fetchData = async () => {
    try {
      const res: any = await VotingMethodsService.searchVotingMethod({});
      const type: any = await ElectionTypesService.searchElectionType({});
      const th: any = await ThresholdsService.searchThreshold({});

      // Đảm bảo types là array
      let typesArray: ElectionTypes[] = [];
      if (Array.isArray(type)) {
        typesArray = type;
      } else if (type && typeof type === 'object') {
        if (type.content && Array.isArray(type.content)) {
          typesArray = type.content;
        } else if (type.data?.content && Array.isArray(type.data.content)) {
          typesArray = type.data.content;
        } else if (type.data && Array.isArray(type.data)) {
          typesArray = type.data;
        }
      }
      setTypes(Array.isArray(typesArray) ? typesArray : []);

      // Đảm bảo methods là array
      let methodsArray: VotingMethods[] = [];
      if (Array.isArray(res)) {
        methodsArray = res;
      } else if (res && typeof res === 'object') {
        if (res.content && Array.isArray(res.content)) {
          methodsArray = res.content;
        } else if (res.data?.content && Array.isArray(res.data.content)) {
          methodsArray = res.data.content;
        } else if (res.data && Array.isArray(res.data)) {
          methodsArray = res.data;
        }
      }
      setMethods(Array.isArray(methodsArray) ? methodsArray : []);

      // Đảm bảo thresholds là array
      let thresholdsArray: Threshols[] = [];
      if (Array.isArray(th)) {
        thresholdsArray = th;
      } else if (th && typeof th === 'object') {
        if (th.content && Array.isArray(th.content)) {
          thresholdsArray = th.content;
        } else if (th.data?.content && Array.isArray(th.data.content)) {
          thresholdsArray = th.data.content;
        } else if (th.data && Array.isArray(th.data)) {
          thresholdsArray = th.data;
        }
      }
      setThresholds(Array.isArray(thresholdsArray) ? thresholdsArray : []);
    } catch (error) {
      console.error("Error fetching voting methods:", error);
      setMethods([]);
      setTypes([]);
      setThresholds([]);
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
        const loadedCandidates = electionentities.map((c: any) => {
          // Xác định formType từ metaData.type hoặc formType ở root, nếu không có thì tự động xác định
          let formType = c.formType || c.metaData?.type;
          if (!formType) {
            // Tự động xác định dựa trên dữ liệu
            if (c.metaData?.projectName || c.metaData?.projectDescription) {
              formType = "project";
            } else if (c.metaData?.fullName) {
              formType = "person";
            } else {
              formType = "other";
            }
          }

          return {
            _id: c._id,
            title: c.title || "",
            description: c.description || "",
            formType: formType, // Map formType từ dữ liệu backend
            metaData: {
              type: formType, // Đảm bảo type có trong metaData
              fullName: c.metaData?.fullName || "",
              age: c.metaData?.age || "",
              department: c.metaData?.department || "",
              position: c.metaData?.position || "",
              experience: c.metaData?.experience || "",
              achievements: c.metaData?.achievements || "",
              image: c.metaData?.image || c.metaData?.imageUrl || "",
              // Dữ liệu cho dự án
              projectName: c.metaData?.projectName || "",
              projectDescription: c.metaData?.projectDescription || "",
              budget: c.metaData?.budget || "",
              duration: c.metaData?.duration || "",
              location: c.metaData?.location || "",
              objectives: c.metaData?.objectives || "",
              benefits: c.metaData?.benefits || "",
            },
            fileUrl: c.fileUrl || c.file || "", // Lưu fileUrl từ backend
          };
        });

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

  // Helper function để xác định formType từ typeCode
  const getFormTypeFromTypeCode = useCallback((typeCode: string | undefined): "person" | "project" | "other" => {
    if (!typeCode) return "other";
    if (typeCode.startsWith("USER")) return "person";
    if (typeCode.startsWith("PRODUCT")) return "project";
    if (typeCode === "OTHER") return "other";
    return "other";
  }, []);

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

      // Lưu startDate và endDate của election để validate
      if (d?.election?.startDate) {
        setElectionStartDate(dayjs(d.election.startDate));
      }
      if (d?.election?.endDate) {
        setElectionEndDate(dayjs(d.election.endDate));
      }

      try {
        const typeId = d?.meetingInfo?.typeDetails?._id;

        form.setFieldsValue({
          decisionNumber: d?.election?.decisionNumber,
          decisionName: d?.election?.decisionName,
          method: d?.meetingInfo.methodDetails?._id,
          methodName: d?.meetingInfo.methodDetails?.methodName,
          type: typeId,
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

        // Set selectedTypeId và formType khi load data
        if (typeId) {
          setSelectedTypeId(typeId);
          // Tìm type object trong types array để lấy typeCode
          const typeObject = Array.isArray(types) ? types.find((t) => t._id === typeId) : null;
          if (typeObject?.typeCode) {
            const determinedFormType = getFormTypeFromTypeCode(typeObject.typeCode);
            setFormType(determinedFormType);
          } else if (d?.meetingInfo?.typeDetails?.typeCode) {
            // Fallback: nếu không tìm thấy trong types array, dùng typeCode từ data
            const determinedFormType = getFormTypeFromTypeCode(d.meetingInfo.typeDetails.typeCode);
            setFormType(determinedFormType);
          }
        }

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
  }, [data, meeting, types, getFormTypeFromTypeCode]);

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
    // Kiểm tra nếu hình thức bầu cử là YES_NO_ABSTAIN thì chỉ cho phép 1 bản ghi
    const selectedMethod = methods?.find((m) => m._id === voteMethod);
    const isYesNoMethod = selectedMethod?.methodCode === "YES_NO_ABSTAIN";

    if (isYesNoMethod) {
      // Nếu đang edit, chỉ cho phép sửa 1 bản ghi hiện có
      if (editCandidateIndex !== null && editCandidateIndex >= 0) {
        // Đang edit - OK, chỉ sửa 1 bản ghi
      } else {
        // Nếu đã có 1 candidate và đang thêm mới, không cho phép
        if (candidates.length >= 1) {
          notify("Hình thức bầu cử YES-NO chỉ cho phép 1 nội dung bầu chọn. Vui lòng chỉnh sửa bản ghi hiện có.", "warning");
          return;
        }
        // Nếu đang thêm mới và đã có 1 candidate từ newCandidates, chỉ lấy 1 bản ghi đầu tiên
        if (newCandidates.length > 1) {
          notify("Hình thức bầu cử YES-NO chỉ cho phép 1 nội dung bầu chọn. Chỉ bản ghi đầu tiên sẽ được lưu.", "warning");
          newCandidates = [newCandidates[0]];
        }
      }
    }

    let updatedCandidates: any[] = [];

    if (editCandidateIndex !== null && editCandidateIndex >= 0) {
      updatedCandidates = [...candidates];
      const existingCandidate = updatedCandidates[editCandidateIndex];
      updatedCandidates[editCandidateIndex] = {
        ...newCandidates[0],
        _id: existingCandidate?._id,
      };
      setEditCandidateIndex(null);
    } else {
      updatedCandidates = newCandidates.map((newCandidate, index) => {
        const existingCandidate = candidates[index];
        if (existingCandidate && existingCandidate._id) {
          return {
            ...newCandidate,
            _id: existingCandidate._id,
          };
        }
        return {
          ...newCandidate,
        };
      });
    }

    setCandidates(updatedCandidates);

    emitChange(updatedCandidates);
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
    // Xác định formType một cách chính xác
    let candidateFormType = candidate.formType || candidate.metaData?.type;

    // Nếu không có formType, tự động xác định từ dữ liệu
    if (!candidateFormType) {
      if (candidate.metaData?.projectName || candidate.metaData?.projectDescription || candidate.metaData?.budget) {
        candidateFormType = "project";
      } else if (candidate.metaData?.fullName || candidate.metaData?.department || candidate.metaData?.position) {
        candidateFormType = "person";
      } else {
        candidateFormType = "other";
      }
    }

    setSelectedCandidate({
      ...candidate,
      index,
      formType: candidateFormType, // Đảm bảo formType được lưu
      metaData: {
        ...candidate.metaData,
        type: candidateFormType, // Đảm bảo type trong metaData
      }
    });
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
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changedValues, allValues) => {
          // Trigger onChange khi có thay đổi, đặc biệt là ngày ủy quyền
          const values = form.getFieldsValue(true);
          values.candidates = candidates;
          onChange(values);
        }}
      >
        <Row gutter={16}>
          {/* SỐ NGHỊ QUYẾT VÀ TÊN NGHỊ QUYẾT - LUÔN DISABLED */}
          <Col span={12}>
            <Form.Item
              label="Số nghị quyết"
              name="decisionNumber"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input disabled={true} placeholder="Nhập số nghị quyết" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Tên nghị quyết"
              name="decisionName"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input disabled={true} placeholder="Nhập tên nghị quyết" />
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
              <Select
                placeholder="Chọn thể loại"
                disabled={disabled}
                onChange={(v) => {
                  if (disabled) return;
                  form.setFieldsValue({ type: v });

                  // Tìm type object để lấy typeCode
                  const selectedType = Array.isArray(types) ? types.find((t) => t._id === v) : null;
                  if (selectedType) {
                    setSelectedTypeId(v);
                    const determinedFormType = getFormTypeFromTypeCode(selectedType.typeCode);
                    setFormType(determinedFormType);
                    // Xóa danh sách candidates khi thay đổi type
                    setCandidates([]);
                  } else {
                    setSelectedTypeId(null);
                    setFormType(null);
                  }

                  emitChange();
                }}
              >
                {Array.isArray(types) && types.length > 0 ? (
                  types.map((item) => (
                    <Select.Option key={item._id} value={item._id}>
                      {item.typeName}
                    </Select.Option>
                  ))
                ) : null}
              </Select>
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
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu ủy quyền" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    // Phải từ ngày hiện tại trở đi
                    if (value.isBefore(dayjs().startOf("day"))) {
                      return Promise.reject("Ngày bắt đầu ủy quyền không được là ngày trong quá khứ");
                    }
                    // Phải trước hoặc bằng ngày bắt đầu cuộc bầu cử
                    if (electionStartDate && value.isAfter(electionStartDate, "day")) {
                      return Promise.reject(
                        `Ngày bắt đầu ủy quyền phải trước hoặc bằng ngày bắt đầu cuộc bầu cử (${electionStartDate.format("DD/MM/YYYY")})`
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled={disabled}
                disabledDate={(d) => {
                  if (!d) return false;
                  // Không cho chọn ngày trong quá khứ
                  if (d < dayjs().startOf("day")) return true;
                  // Không cho chọn sau startDate của election
                  if (electionStartDate && d.isAfter(electionStartDate, "day")) return true;
                  return false;
                }}
                onChange={(value) => {
                  // Reset ngày kết thúc khi thay đổi ngày bắt đầu
                  form.setFieldsValue({ authorizationEnd: null });
                  // Hiển thị thông báo info
                  if (value) {
                    notify(
                      "Chú ý: Ngày bắt đầu ủy quyền và ngày kết thúc ủy quyền phải kéo dài từ 10 ngày đổ lên nhé.",
                      "info"
                    );
                  }
                  // Trigger onChange để cập nhật state
                  const values = form.getFieldsValue(true);
                  values.candidates = candidates;
                  onChange(values);
                }}

                onBlur={(e) => {
                  const raw = (e.target as HTMLInputElement).value.trim();
                  if (!raw) return;

                  const parsed = dayjs(raw, "DD/MM/YYYY", true);

                  // ❌ Sai định dạng
                  if (!parsed.isValid()) {
                    notify("Ngày bắt đầu ủy quyền sai định dạng", "error");
                    return;
                  }

                  // ❌ Ngày trong quá khứ
                  if (parsed.isBefore(dayjs().startOf("day"))) {
                    notify("Ngày bắt đầu ủy quyền không được là ngày quá khứ", "error");
                    return;
                  }

                  // ❌ Ngày bắt đầu lớn hơn ngày start của cuộc bầu cử
                  if (electionStartDate && parsed.isAfter(electionStartDate, "day")) {
                    notify(
                      `Ngày bắt đầu ủy quyền phải trước hoặc bằng ngày bắt đầu cuộc bầu cử (${electionStartDate.format(
                        "DD/MM/YYYY"
                      )})`,
                      "error"
                    );
                    return;
                  }
                }}

              />
            </Form.Item>
          </Col>

          {/* NGÀY KẾT THÚC */}
          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc ủy quyền"
              name="authorizationEnd"
              dependencies={["authorizationStart"]}
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc ủy quyền" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value) return Promise.resolve();
                    const start = getFieldValue("authorizationStart");
                    if (!start) {
                      return Promise.reject("Vui lòng chọn ngày bắt đầu ủy quyền trước");
                    }
                    // Phải sau ngày bắt đầu ủy quyền
                    if (value.isBefore(start, "day") || value.isSame(start, "day")) {
                      return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu");
                    }
                    // Phải cách ngày bắt đầu ít nhất 10 ngày
                    const daysDiff = value.diff(start, "day");
                    if (daysDiff < 10) {
                      return Promise.reject("Ngày kết thúc ủy quyền phải cách ngày bắt đầu ít nhất 10 ngày");
                    }
                    // Không được vượt quá ngày kết thúc cuộc bầu cử
                    if (electionEndDate && value.isAfter(electionEndDate, "day")) {
                      return Promise.reject(
                        `Ngày kết thúc ủy quyền không được vượt quá ngày kết thúc cuộc bầu cử (${electionEndDate.format("DD/MM/YYYY")})`
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabled={disabled}
                disabledDate={(d) => {
                  if (!d) return false;
                  const start = form.getFieldValue("authorizationStart");
                  if (!start) {
                    // Nếu chưa chọn ngày bắt đầu, chỉ cho chọn từ ngày hiện tại
                    return d < dayjs().startOf("day");
                  }
                  // Không cho chọn trước hoặc bằng ngày bắt đầu ủy quyền
                  if (d.isBefore(start, "day") || d.isSame(start, "day")) return true;
                  // Phải cách ngày bắt đầu ít nhất 10 ngày
                  const daysDiff = d.diff(start, "day");
                  if (daysDiff < 10) return true;
                  // Không cho chọn sau ngày kết thúc cuộc bầu cử
                  if (electionEndDate && d.isAfter(electionEndDate, "day")) return true;
                  return false;
                }}
                onChange={(value) => {
                  // Hiển thị thông báo info
                  if (value) {
                    notify(
                      "Chú ý: Ngày bắt đầu ủy quyền và ngày kết thúc ủy quyền phải kéo dài từ 10 ngày đổ lên nhé.",
                      "info"
                    );
                  }
                  // Trigger form validation và onChange
                  form.validateFields(['authorizationEnd']);
                  const values = form.getFieldsValue(true);
                  values.candidates = candidates;
                  onChange(values);
                }}

                onBlur={(e) => {
                  const raw = (e.target as HTMLInputElement).value.trim();
                  if (!raw) return;

                  const start = form.getFieldValue("authorizationStart");

                  const parsed = dayjs(raw, "DD/MM/YYYY", true);

                  // ❌ Sai format
                  if (!parsed.isValid()) {
                    notify("Ngày kết thúc ủy quyền sai định dạng", "error");
                    return;
                  }

                  // ❌ Không có ngày bắt đầu
                  if (!start) {
                    notify("Vui lòng chọn ngày bắt đầu ủy quyền trước", "error");
                    return;
                  }

                  // ❌ Ngày kết thúc ≤ ngày bắt đầu
                  if (parsed.isSame(start, "day") || parsed.isBefore(start, "day")) {
                    notify("Ngày kết thúc phải sau ngày bắt đầu", "error");
                    return;
                  }

                  // ❌ Ngày kết thúc < 10 ngày so với start
                  const diff = parsed.diff(start, "day");
                  if (diff < 10) {
                    notify("Ngày kết thúc ủy quyền phải cách ngày bắt đầu ít nhất 10 ngày", "error");
                    return;
                  }

                  // ❌ Vượt quá ngày kết thúc cuộc bầu cử
                  if (electionEndDate && parsed.isAfter(electionEndDate, "day")) {
                    notify(
                      `Ngày kết thúc ủy quyền không được vượt quá ngày kết thúc cuộc bầu cử (${electionEndDate.format("DD/MM/YYYY")})`,
                      "error"
                    );
                    return;
                  }
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
                        // Kiểm tra nếu hình thức bầu cử là YES_NO_ABSTAIN và đã có 1 candidate
                        const selectedMethod = methods?.find((m) => m._id === voteMethod);
                        const isYesNoMethod = selectedMethod?.methodCode === "YES_NO_ABSTAIN";
                        if (isYesNoMethod && candidates.length >= 1) {
                          notify("Hình thức bầu cử YES-NO chỉ cho phép 1 nội dung bầu chọn. Vui lòng chỉnh sửa bản ghi hiện có.", "warning");
                          return;
                        }
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
        formType={formType || undefined}
        electionId={electionId}
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
        {selectedCandidate && (() => {
          // Xác định formType
          let formType = selectedCandidate.formType || selectedCandidate.metaData?.type;
          if (!formType) {
            if (selectedCandidate.metaData?.projectName || selectedCandidate.metaData?.projectDescription || selectedCandidate.metaData?.budget) {
              formType = "project";
            } else if (selectedCandidate.metaData?.fullName || selectedCandidate.metaData?.department || selectedCandidate.metaData?.position) {
              formType = "person";
            } else {
              formType = "other";
            }
          }
          const metaData = selectedCandidate.metaData || {};

          // Helper để kiểm tra giá trị có dữ liệu không
          const hasValue = (value: any) => {
            if (value === null || value === undefined) return false;
            if (typeof value === "string" && value.trim() === "") return false;
            return true;
          };

          return (
            <div style={{ padding: "4px 0" }}>
              <Descriptions
                column={1}
                bordered
                size="middle"
                labelStyle={{
                  fontWeight: 600,
                  width: "180px",
                  background: "#fafafa",
                }}
                contentStyle={{
                  background: "#fff",
                }}
              >
                <Descriptions.Item label="Tiêu đề">
                  <Text strong style={{ fontSize: 15 }}>
                    {selectedCandidate.title || `Ứng viên ${selectedCandidate.index + 1}`}
                  </Text>
                </Descriptions.Item>

                {hasValue(selectedCandidate.description) && (
                  <Descriptions.Item label="Mô tả">
                    <Text>{selectedCandidate.description}</Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Loại bầu chọn">
                  <Tag color={formType === "person" ? "blue" : formType === "project" ? "green" : "orange"}>
                    {formType === "person" ? "👤 Bầu người" : formType === "project" ? "📁 Bầu dự án" : "📋 Loại khác"}
                  </Tag>
                </Descriptions.Item>

                {formType === "person" && (
                  <>
                    {hasValue(metaData.image) && (
                      <Descriptions.Item label="Ảnh đại diện">
                        <Avatar size={80} src={metaData.image} icon={<UserOutlined />} />
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.fullName) && (
                      <Descriptions.Item label="Họ và tên">
                        <Text strong>{metaData.fullName}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.age) && (
                      <Descriptions.Item label="Tuổi">
                        {metaData.age}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.department) && (
                      <Descriptions.Item label="Phòng ban">
                        {metaData.department}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.position) && (
                      <Descriptions.Item label="Vị trí / Chức vụ">
                        {metaData.position}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.experience) && (
                      <Descriptions.Item label="Kinh nghiệm">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.experience}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.achievements) && (
                      <Descriptions.Item label="Thành tích">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.achievements}
                        </div>
                      </Descriptions.Item>
                    )}
                  </>
                )}

                {formType === "project" && (
                  <>
                    {hasValue(metaData.projectName) && (
                      <Descriptions.Item label="Tên dự án">
                        <Text strong style={{ fontSize: 15 }}>{metaData.projectName}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.projectDescription) && (
                      <Descriptions.Item label="Mô tả dự án">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.projectDescription}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.budget) && (
                      <Descriptions.Item label="Ngân sách">
                        <Text strong>{metaData.budget}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.duration) && (
                      <Descriptions.Item label="Thời gian thực hiện">
                        {metaData.duration}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.location) && (
                      <Descriptions.Item label="Địa điểm">
                        {metaData.location}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.objectives) && (
                      <Descriptions.Item label="Mục tiêu dự án">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.objectives}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.benefits) && (
                      <Descriptions.Item label="Lợi ích dự án">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.benefits}
                        </div>
                      </Descriptions.Item>
                    )}
                  </>
                )}

                {formType === "other" && (
                  <>
                    {hasValue(metaData.image) && (
                      <Descriptions.Item label="Ảnh đại diện">
                        <Avatar size={80} src={metaData.image} icon={<UserOutlined />} />
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.fullName) && (
                      <Descriptions.Item label="Họ và tên">
                        <Text strong>{metaData.fullName}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.age) && (
                      <Descriptions.Item label="Tuổi">
                        {metaData.age}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.department) && (
                      <Descriptions.Item label="Phòng ban">
                        {metaData.department}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.position) && (
                      <Descriptions.Item label="Vị trí / Chức vụ">
                        {metaData.position}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.experience) && (
                      <Descriptions.Item label="Kinh nghiệm">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.experience}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.achievements) && (
                      <Descriptions.Item label="Thành tích">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.achievements}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.projectName) && (
                      <Descriptions.Item label="Tên dự án">
                        <Text strong style={{ fontSize: 15 }}>{metaData.projectName}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.projectDescription) && (
                      <Descriptions.Item label="Mô tả dự án">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.projectDescription}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.budget) && (
                      <Descriptions.Item label="Ngân sách">
                        <Text strong>{metaData.budget}</Text>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.duration) && (
                      <Descriptions.Item label="Thời gian thực hiện">
                        {metaData.duration}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.location) && (
                      <Descriptions.Item label="Địa điểm">
                        {metaData.location}
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.objectives) && (
                      <Descriptions.Item label="Mục tiêu">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.objectives}
                        </div>
                      </Descriptions.Item>
                    )}
                    {hasValue(metaData.benefits) && (
                      <Descriptions.Item label="Lợi ích">
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, maxWidth: "100%" }}>
                          {metaData.benefits}
                        </div>
                      </Descriptions.Item>
                    )}
                  </>
                )}

                {(selectedCandidate.file || selectedCandidate.fileUrl) && (
                  <Descriptions.Item label="Tài liệu đính kèm">
                    <Space>
                      <Tag icon={<FileTextOutlined />} color="green">
                        Có tài liệu đính kèm
                      </Tag>
                      {selectedCandidate.fileUrl && (
                        <>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {selectedCandidate.fileUrl.split("/").pop() || "File đính kèm"}
                          </Text>
                          <Button
                            type="link"
                            size="small"
                            icon={<FolderOutlined />}
                            onClick={async () => {
                              try {
                                showLoading();
                                const blob = await FileService.downloadByKey(selectedCandidate.fileUrl);
                                const fileName = selectedCandidate.fileUrl.split("/").pop() || "document";
                                downloadBlob(blob, fileName);
                                notify("Tải file thành công", "success");
                              } catch (error: any) {
                                console.error("Error downloading file:", error);
                                const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải file";
                                notify(errorMessage, "error");
                              } finally {
                                hideLoading();
                              }
                            }}
                          >
                            Tải xuống
                          </Button>
                        </>
                      )}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          );
        })()}

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
