import React, { useEffect, useState } from "react";
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
  Upload,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import "@/style/secretary/MettingInfo.model.css";
import { ElectionTypes } from "@/types/ElectionTypes.interface";
import { Threshols } from "@/types/Threshols.interface";
import { VotingMethods } from "@/types/VotingMethods.interface";
import { User } from "@/types/User.interface";
import VotingMethodsService from "@/services/VotingMethodsService";

const { Title } = Typography;

interface Props {
  open: boolean;
  onSubmit: (payload: any) => void;
}

interface MeetingFormValues {
  location: string;
  method: string;
  type: string | { type: "other"; typeName: string; typeCode: string; description: string };
  thresholdMethod:
  | string
  | { method: "other"; thresholdName: string; thresholdCode: string; description: string };
  authorizationStart: Dayjs | null;
  authorizationEnd: Dayjs | null;
  candidates?: any[];
}

const MeetingInfo: React.FC<Props> = ({ open,  onSubmit }) => {
  const [form] = Form.useForm<MeetingFormValues>();
  const [typeOther, setTypeOther] = useState(false);
  const [thresholdOther, setThresholdOther] = useState(false);
  const [voteMethod, setVoteMethod] = useState<string>("");
  const [types, setType] = useState<ElectionTypes[] | null>(null);
  const [threshols, setThreshols] = useState<Threshols[] | null>(null);
  const [method, setMethod] = useState<VotingMethods[] | null>(null);
  const [voter, setVoter] = useState<User[] | null>(null);

  /* ============ HANDLE SUBMIT ============ */
  const handleFinish = (values: MeetingFormValues) => {
    let transformedCandidates: any[] = [];

    if (values.candidates && Array.isArray(values.candidates)) {
      if (voteMethod === "CUMULATIVE") {
        transformedCandidates = values.candidates.map((item: any) => ({
          title: item.title,
          description: item.description,
          metaData: {
            fullName: item.metaData?.fullName,
            age: item.metaData?.age,
            department: item.metaData?.department,
            experience: item.metaData?.experience,
            achievements: item.metaData?.achievements,
          },
          imageUrl: item.imageUrl,
          file: item.file?.[0]?.originFileObj || null,
        }));
      }

      if (voteMethod === "YES_NO_ABSTAIN") {
        transformedCandidates = values.candidates.map((item: any) => ({
          title: item.title,
          description: item.description,
          proposerId: item.proposerId,
          file: item.file?.[0]?.originFileObj || null,
        }));
      }
    }

    // LẤY DANH SÁCH PHƯƠNG THỨC BẦU CỬ
    const fetchData = async () => {
      try {
        let body = {};
        const res = await VotingMethodsService.searchVotingMethod(body);
        setMethod(res?.data || []); // Lưu vào state method
      } catch (error) {
        console.error("Error fetching voting methods:", error);
      }
    };

    // Khi mở modal thì load lại dữ liệu
    useEffect(() => {
      if (open) {
        fetchData();
      }
    }, [open]);

    const payload = {
      ...values,
      voteMethod,
      candidates: transformedCandidates,
    };

    onSubmit(payload);
  };

  /* ===================== CẤU TRÚC FORM RỖNG ===================== */
  const emptyCandidate = {
    title: "",
    description: "",
    metaData: {
      fullName: "",
      age: "",
      department: "",
      experience: "",
      achievements: "",
    },
    proposerId: "",
    file: [],
    image: [],
  };

  return (
    <Card className="meeting-card">
      <Title level={4} className="meeting-title">📄 Nội dung Quyết định</Title>

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Row gutter={20}>
          {/* ĐỊA ĐIỂM */}
          <Col span={12}>
            <Form.Item
              label="Địa điểm"
              name="location"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input placeholder="Nhập địa điểm tổ chức" />
            </Form.Item>
          </Col>

          {/* PHƯƠNG THỨC BẦU CỬ */}
          <Col span={12}>
            <Form.Item
              label="Hình thức bầu cử"
              name="method"
              rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
            >
              <Select
                placeholder="Chọn hình thức bầu cử"
                onChange={(v) => {
                  setVoteMethod(v);

                  // ⭐ Tự động tạo 2 nội dung rỗng cho người nhập luôn
                  form.setFieldsValue({
                    method: v,
                    candidates: [emptyCandidate, emptyCandidate],
                  });
                }}
              >
                {method?.map((item) => (
                  <Select.Option key={item._id} value={item.methodCode}>
                    {item.methodName}
                  </Select.Option>
                ))}
                <Select.Option value="CUMULATIVE">Cumulative</Select.Option>
                <Select.Option value="YESNO">Yes / No</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {/* thể loai BẦU CỬ */}
          <Col span={12}>
            <Form.Item
              label="thể loai bầu cử"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn thể loai" }]}
            >
              {!typeOther ? (
                <Select
                  placeholder="Chọn thể loai"
                  onChange={(v) => {
                    if (v === "other") {
                      setTypeOther(true);
                      form.setFieldsValue({
                        type: {
                          type: "other",
                          typeName: "",
                          typeCode: "",
                          description: "",
                        },
                      });
                    } else {
                      setTypeOther(false);
                      form.setFieldsValue({ type: v });
                    }
                  }}
                >
                  <Select.Option value="direct">Bầu trực tiếp</Select.Option>
                  <Select.Option value="proxy">Ủy quyền</Select.Option>
                  <Select.Option value="electronic">Bầu điện tử</Select.Option>
                  <Select.Option value="other">Khác…</Select.Option>
                </Select>
              ) : (
                <div>
                  <Input.Group>
                    <Form.Item
                      label="Tên thể loai"
                      name={["type", "typeName"]}
                      rules={[{ required: true, message: "Nhập tên thể loai" }]}
                    >
                      <Input placeholder="Tên thể loai (Khác)" />
                    </Form.Item>
                    <Form.Item
                      label="Mã thể loai"
                      name={["type", "typeCode"]}
                      rules={[{ required: true, message: "Nhập mã thể loai" }]}
                    >
                      <Input placeholder="Mã thể loai" />
                    </Form.Item>
                    <Form.Item
                      label="Mô tả"
                      name={["type", "description"]}>
                      <Input.TextArea rows={2} placeholder="Mô tả thể loai" />
                    </Form.Item>
                  </Input.Group>

                  <Button type="link" onClick={() => setTypeOther(false)}>
                    ← Quay lại
                  </Button>
                </div>
              )}
            </Form.Item>
          </Col>

          {/* NGƯỠNG THÔNG QUA */}
          <Col span={12}>
            <Form.Item
              label="Ngưỡng thông qua"
              name="thresholdMethod"
              rules={[{ required: true, message: "Vui lòng chọn ngưỡng" }]}
            >
              {!thresholdOther ? (
                <Select
                  placeholder="Chọn ngưỡng"
                  onChange={(v) => {
                    if (v === "other") {
                      setThresholdOther(true);
                      form.setFieldsValue({
                        thresholdMethod: {
                          method: "other",
                          thresholdName: "",
                          thresholdCode: "",
                          description: "",
                        },
                      });
                    } else {
                      setThresholdOther(false);
                      form.setFieldsValue({ thresholdMethod: v });
                    }
                  }}
                >
                  <Select.Option value="majority">Đa số</Select.Option>
                  <Select.Option value="proportional">Tỷ lệ</Select.Option>
                  <Select.Option value="absolute">Tuyệt đối</Select.Option>
                  <Select.Option value="other">Khác…</Select.Option>
                </Select>
              ) : (
                <div>
                  <Form.Item
                    label="Tên ngưỡng"
                    name={["thresholdMethod", "thresholdName"]}
                    rules={[{ required: true, message: "Nhập tên ngưỡng" }]}
                  >
                    <Input placeholder="Tên ngưỡng" />
                  </Form.Item>

                  <Form.Item
                    label="Loại ngưỡng"
                    name={["thresholdMethod", "thresholdType"]}
                    rules={[{ required: true, message: "Nhập loại ngưỡng" }]}
                  >
                    <Input placeholder="Loại ngưỡng" />
                  </Form.Item>
                  <Form.Item
                    label="Tỷ lệ thông qua"
                    name={["thresholdMethod", "value"]}
                    rules={[{ required: true, message: "Nhập tỷ lệ thông qua" }]}
                  >
                    <Input placeholder="Tỷ lệ thông qua" />
                  </Form.Item>

                  <Form.Item
                    label="Mô tả"
                    name={["thresholdMethod", "description"]}>
                    <Input.TextArea rows={2} placeholder="Mô tả" />
                  </Form.Item>

                  <Form.Item
                    label="Mã ngưỡng"
                    name={["thresholdMethod", "thresholdCode"]}
                  >
                    <Input placeholder="Mã ngưỡng" />
                  </Form.Item>

                  <Button type="link" onClick={() => setThresholdOther(false)}>
                    ← Quay lại
                  </Button>
                </div>
              )}
            </Form.Item>
          </Col>

          {/* NGÀY ỦY QUYỀN */}
          <Col span={12}>
            <Form.Item
              label="Ngày bắt đầu ủy quyền"
              name="authorizationStart"
              rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(d) => d && d < dayjs().startOf("day")}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc ủy quyền"
              name="authorizationEnd"
              rules={[
                { required: true, message: "Vui lòng chọn ngày" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("authorizationStart");
                    if (!value || !start) return Promise.resolve();
                    if (dayjs(value).isBefore(start, "day"))
                      return Promise.reject("Ngày kết thúc phải sau ngày bắt đầu");

                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                disabledDate={(d) => {
                  const start = form.getFieldValue("authorizationStart");
                  if (!start) return d && d < dayjs().startOf("day");
                  return d && d < start;
                }}
              />
            </Form.Item>
          </Col>

          {/* ===================================== */}
          {/*     DANH SÁCH BẦU CHỌN – ≥ 2 ITEMS    */}
          {/* ===================================== */}
          <Col span={24}>
            <h4 style={{ marginTop: 10 }}>Danh sách bầu chọn</h4>

            {/* Validate: phải có ít nhất 2 mục */}
            <Form.Item
              shouldUpdate
              rules={[
                {
                  validator() {
                    const list = form.getFieldValue("candidates");
                    if (!list || list.length < 2) {
                      return Promise.reject("Vui lòng nhập tối thiểu 2 nội dung bầu chọn");
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <></>
            </Form.Item>

            {/* Hiển thị khi chọn phương thức */}
            {!voteMethod ? (
              <p style={{ color: "red" }}>Vui lòng chọn hình thức bầu cử</p>
            ) : (
              <Form.List name="candidates">
                {(fields, { add, remove }) => (
                  <div>


                    {fields.map(({ key, name, ...rest }) => (
                      <Row
                        key={key}
                        gutter={12}
                        style={{
                          marginBottom: 10,
                          padding: 12,
                          border: "1px solid #eee",
                          borderRadius: 6,
                        }}
                      >
                        {/* ======== CUMULATIVE ======== */}
                        {voteMethod === "CUMULATIVE" && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                {...rest}
                                label="Tiêu đề"
                                name={[name, "title"]}
                                rules={[{ required: true, message: "Nhập tiêu đề" }]}
                              >
                                <Input placeholder="Tiêu đề mục bầu chọn" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item {...rest} label="Mô tả" name={[name, "description"]}>
                                <Input placeholder="Mô tả" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Họ và tên"
                                name={[name, "metaData", "fullName"]}
                                rules={[{ required: true, message: "Nhập họ tên" }]}
                              >
                                <Input placeholder="Họ và tên ứng viên" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item label="Tuổi" name={[name, "metaData", "age"]}>
                                <Input placeholder="Tuổi" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Phòng ban"
                                name={[name, "metaData", "department"]}
                              >
                                <Input placeholder="Phòng ban" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item label="Người đề xuất" name={[name, "proposerId"]}>
                                <Input placeholder="Mã người đề xuất" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Ảnh ứng viên"
                                name={[name, "image"]}
                                valuePropName="fileList"
                                getValueFromEvent={(e) => e?.fileList}
                              >
                                <Upload
                                  beforeUpload={() => false}
                                  listType="picture-card"
                                  maxCount={1}
                                >
                                  <div>Tải ảnh</div>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Tài liệu đính kèm"
                                name={[name, "file"]}
                                valuePropName="fileList"
                                getValueFromEvent={(e) => e?.fileList}
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button>Tải file lên</Button>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                label="Kinh nghiệm"
                                name={[name, "metaData", "experience"]}
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                label="Thành tích"
                                name={[name, "metaData", "achievements"]}
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                            </Col>
                          </>
                        )}

                        {/* ======== YES / NO ======== */}
                        {voteMethod === "YESNO" && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                {...rest}
                                label="Tiêu đề"
                                name={[name, "title"]}
                                rules={[{ required: true, message: "Nhập tiêu đề" }]}
                              >
                                <Input placeholder="Tiêu đề" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item {...rest} label="Mô tả" name={[name, "description"]}>
                                <Input placeholder="Mô tả" />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Tài liệu đính kèm"
                                name={[name, "file"]}
                                valuePropName="fileList"
                                getValueFromEvent={(e) => e?.fileList}
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button>Tải file</Button>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Người đề xuất"
                                name={[name, "proposerId"]}
                              >
                                <Input placeholder="Mã người đề xuất" />
                              </Form.Item>
                            </Col>
                          </>
                        )}

                        {/* NÚT XÓA */}
                        <Col span={24} style={{ marginTop: 10 }}>
                          <Button danger onClick={() => remove(name)}>
                            Xóa
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    {/* Nếu bạn muốn ẩn nút "Thêm", báo mình */}
                    <Button
                      type="dashed"
                      style={{ marginBottom: 12, color: "green" }}
                      onClick={() => add(emptyCandidate)}
                    >
                      + Thêm nội dung bầu chọn
                    </Button>
                  </div>

                )}
              </Form.List>
            )}
          </Col>
        </Row>

        {/* BUTTON */}
        <div className="meeting-actions">
          <Button type="primary" htmlType="submit">
            Lưu thông tin
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default MeetingInfo;
