import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Upload,
  Tag,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { VotingMethods } from "@/types/VotingMethods.interface";
import { Typography } from "antd";

const { Text } = Typography;

interface Candidate {
  _id?: string; // ID từ backend (nếu có = edit, không có = mới)
  title: string;
  description: string;
  metaData: {
    fullName: string;
    age?: string;
    department?: string;
    position?: string;
    experience?: string;
    achievements?: string;
    image?: string;
  };
  file?: string;
  fileUrl?: string;
}

interface VotingMethodModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (candidates: Candidate[]) => void;
  methods: VotingMethods[];
  selectedMethodId?: string;
  initialCandidates?: Candidate[];
}

const emptyCandidate: Candidate = {
  title: "",
  description: "",
  metaData: {
    fullName: "",
    age: "",
    department: "",
    position: "",
    experience: "",
    achievements: "",
  },
  file: "",
};

const VotingMethodModal: React.FC<VotingMethodModalProps> = ({
  open,
  onCancel,
  onSubmit,
  methods,
  selectedMethodId,
  initialCandidates,
}) => {
  const [form] = Form.useForm();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  useEffect(() => {
    if (open) {
      if (selectedMethodId) {
        setSelectedMethod(selectedMethodId);

        // Load initial candidates if available
        if (initialCandidates && initialCandidates.length > 0) {
          form.setFieldsValue({ candidates: initialCandidates });
        } else {
          form.setFieldsValue({ candidates: [emptyCandidate, emptyCandidate] });
        }
      } else {
        setSelectedMethod("");
        form.resetFields();
        form.setFieldsValue({ candidates: [] });
      }
    } else {
      // Reset when modal closes
      form.resetFields();
    }
  }, [open, selectedMethodId, initialCandidates]);


  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (!selectedMethodId) {
        message.warning("Vui lòng chọn hình thức bầu cử trước");
        return;
      }
      // Giữ lại _id từ initialCandidates nếu có
      const candidatesWithId = (values.candidates || []).map((candidate: any, index: number) => {
        const initialCandidate = initialCandidates?.[index];
        return {
          ...candidate,
          _id: initialCandidate?._id, // Giữ lại _id nếu có
          fileUrl: candidate.file || candidate.fileUrl || initialCandidate?.fileUrl, // Giữ fileUrl
        };
      });
      onSubmit(candidatesWithId);
      onCancel();
    });
  };

  const selectedMethodData = methods.find((m) => m._id === selectedMethod);

  return (
    <Modal
      open={open}
      title={
        <span style={{ fontSize: "18px", fontWeight: 600 }}>
          {selectedMethodData
            ? `Quản lý danh sách bầu chọn - ${selectedMethodData.methodName}`
            : "Quản lý danh sách bầu chọn"}
        </span>
      }
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          disabled={!selectedMethodId}
        >
          Lưu danh sách
        </Button>,
      ]}
      width={900}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        {!selectedMethodId ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#999" }}>
            <p>Vui lòng chọn hình thức bầu cử trước khi quản lý danh sách bầu chọn</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16, padding: 12, background: "#f0f2f5", borderRadius: 6 }}>
              <Text strong>Hình thức đã chọn: </Text>
              <Tag color="green" style={{ marginLeft: 8 }}>
                {selectedMethodData?.methodName || "Chưa chọn"}
              </Tag>
            </div>

            {selectedMethod && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ marginBottom: 16 }}>📄 Danh sách bầu chọn</h3>
            <Form.List name="candidates">
              {(fields, { add, remove }) => (
                <div>
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      key={key}
                      style={{
                        marginBottom: 16,
                        padding: 16,
                        border: "1px solid #e8e8e8",
                        borderRadius: 8,
                        backgroundColor: "#fafafa",
                      }}
                    >
                      {/* CUMULATIVE VOTING METHOD */}
                      {selectedMethod === "691a36c358ae5966f350b2da" && (
                        <>
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "title"]}
                                label="Tiêu đề"
                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                              >
                                <Input placeholder="Nhập tiêu đề" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "description"]}
                                label="Mô tả"
                                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                              >
                                <Input placeholder="Nhập mô tả" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "fullName"]}
                                label="Họ và tên"
                                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                              >
                                <Input placeholder="Nhập họ và tên" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "age"]}
                                label="Tuổi"
                              >
                                <Input placeholder="Nhập tuổi" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "department"]}
                                label="Phòng ban"
                              >
                                <Input placeholder="Nhập phòng ban" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "position"]}
                                label="Vị trí"
                              >
                                <Input placeholder="Nhập vị trí" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "image"]}
                                label="Ảnh ứng viên"
                              >
                                <Upload
                                  beforeUpload={() => false}
                                  listType="picture-card"
                                  maxCount={1}
                                >
                                  <div>
                                    <PlusOutlined />
                                    <div style={{ marginTop: 8 }}>Tải ảnh</div>
                                  </div>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "file"]}
                                label="Tài liệu đính kèm"
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button icon={<PlusOutlined />}>Tải file</Button>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "experience"]}
                                label="Kinh nghiệm"
                              >
                                <Input.TextArea rows={2} placeholder="Nhập kinh nghiệm" />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "achievements"]}
                                label="Thành tích"
                              >
                                <Input.TextArea rows={2} placeholder="Nhập thành tích" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}

                      {/* YES/NO VOTING METHOD */}
                      {selectedMethod === "691a36f958ae5966f350b2e0" && (
                        <>
                          <Row gutter={12}>
                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "title"]}
                                label="Tiêu đề"
                                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                              >
                                <Input placeholder="Nhập tiêu đề" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "description"]}
                                label="Mô tả"
                                rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                              >
                                <Input placeholder="Nhập mô tả" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "metaData", "fullName"]}
                                label="Tên"
                                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                              >
                                <Input placeholder="Nhập tên" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                {...restField}
                                name={[name, "file"]}
                                label="Tài liệu đính kèm"
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button icon={<PlusOutlined />}>Tải file</Button>
                                </Upload>
                              </Form.Item>
                            </Col>
                          </Row>
                        </>
                      )}

                      {/* Generic form for other voting methods */}
                      {selectedMethod !== "691a36c358ae5966f350b2da" &&
                        selectedMethod !== "691a36f958ae5966f350b2e0" && (
                          <>
                            <Row gutter={12}>
                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "title"]}
                                  label="Tiêu đề"
                                  rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
                                >
                                  <Input placeholder="Nhập tiêu đề" />
                                </Form.Item>
                              </Col>

                              <Col span={12}>
                                <Form.Item
                                  {...restField}
                                  name={[name, "description"]}
                                  label="Mô tả"
                                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                                >
                                  <Input placeholder="Nhập mô tả" />
                                </Form.Item>
                              </Col>
                            </Row>
                          </>
                        )}

                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                        style={{ marginTop: 8 }}
                      >
                        Xóa
                      </Button>
                    </div>
                  ))}

                  <Button
                    type="dashed"
                    onClick={() => add(emptyCandidate)}
                    icon={<PlusOutlined />}
                    style={{ width: "100%", marginTop: 8 }}
                  >
                    + Thêm nội dung bầu chọn
                  </Button>
                </div>
              )}
            </Form.List>
          </div>
        )}
          </>
        )}
      </Form>
    </Modal>
  );
};

export default VotingMethodModal;

