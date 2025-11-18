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
import VotingMethodsService from "@/services/VotingMethodsService";
import ElectionTypesService from "@/services/ElectionTypesService";
import ThresholdsService from "@/services/ThresholdsService";
import { string } from "yup";
import { Decision } from "@/types/Decision.interface";
import DecisionService from "@/services/DecisionService";

const { Title } = Typography;

interface Props {
  onChange: (data: any) => void;
  data: any
}

interface MeetingFormValues {
  location?: string;
  method?: string;
  type?: any;
  threshold?: any;
  authorizationStart?: Dayjs | null;
  authorizationEnd?: Dayjs | null;
  candidates?: any[];
}

const MeetingInfo: React.FC<Props> = ({ onChange, data }) => {
  const [form] = Form.useForm<MeetingFormValues>();
  const [typeOther, setTypeOther] = useState(false);
  const [thresholdOther, setThresholdOther] = useState(false);
  const [voteMethod, setVoteMethod] = useState<string>("");
  const [types, setTypes] = useState<ElectionTypes[] | null>(null);
  const [thresholds, setThresholds] = useState<Threshols[] | null>(null);
  const [methods, setMethods] = useState<VotingMethods[] | null>(null);
  const [election, setElection] = useState<Decision | null>(null);

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
    fetchData();
  }, []);

  /* ===========================================================
     EMIT VALUE TO PARENT (NHƯ DIGITALSIGNMODAL)
  ============================================================ */
  const emitChange = () => {
    const values = form.getFieldsValue(true);
    onChange(values);
  };

  /* ===========================================================
      EMPTY CANDIDATE TEMPLATE
  ============================================================ */
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
    file: string,
    image: string,
  };

  return (
    <Card className="meeting-card">
      <Title level={4} className="meeting-title">
        📄 Nội dung Quyết định
      </Title>

      {/* Form KHÔNG submit, chỉ emitChange */}
      <Form
        form={form}
        layout="vertical"
        onValuesChange={emitChange}
      >
        <Row gutter={20}>

          {/* ĐỊA ĐIỂM */}
          <Col span={12}>
            <Form.Item
              label="Số nghị quyết"
              name="decisionNumber"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input value={data?.decisionNumber} disabled placeholder="Nhập địa điểm tổ chức" />
            </Form.Item>
          </Col>

           <Col span={12}>
            <Form.Item
              label="Tên nghị quyết"
              name="decisionName"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input value={data?.decisionName} disabled placeholder="Nhập địa điểm tổ chức" />
            </Form.Item>
          </Col>

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
                  form.setFieldsValue({
                    candidates: [emptyCandidate, emptyCandidate],
                  });
                  emitChange();
                }}
              >
                {Array.isArray(methods) &&
                  methods.map((item) => (
                    <Select.Option key={item._id} value={item._id}>
                      {item.methodName}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          {/* THỂ LOẠI BẦU CỬ */}
          <Col span={12}>
            <Form.Item
              label="Thể loại bầu cử"
              required
            >
              {!typeOther ? (
                <Select
                  placeholder="Chọn thể loại"
                  onChange={(v) => {
                    if (v === "other") {
                      setTypeOther(true);

                      form.setFieldsValue({
                        type: {
                          typeName: "",
                          typeCode: "",
                          description: ""
                        }
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
                    <Input placeholder="Tên thể loại" />
                  </Form.Item>

                  <Form.Item
                    label="Mã thể loại"
                    name={["type", "typeCode"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Mã thể loại" />
                  </Form.Item>

                  <Form.Item
                    label="Mô tả"
                    name={["type", "description"]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>

                  <Button type="link" onClick={() => setTypeOther(false)}>
                    ← Quay lại
                  </Button>
                </>
              )}
            </Form.Item>
          </Col>


          {/* NGƯỠNG THÔNG QUA */}
          <Col span={12}>
            <Form.Item
              label="Ngưỡng thông qua"
              rules={[{ required: true }]}
            >
              {!thresholdOther ? (
                <Select
                  placeholder="Chọn ngưỡng"
                  onChange={(v) => {
                    if (v === "other") {
                      setThresholdOther(true);
                      form.setFieldsValue({
                        threshold: { method: "other" },
                      });
                    } else {
                      setThresholdOther(false);
                      form.setFieldsValue({ threshold: v });
                    }
                    emitChange();
                  }}
                >
                  <Select.Option value="other">Khác…</Select.Option>

                  {Array.isArray(thresholds) &&
                    thresholds.map((item) => (
                      <Select.Option key={item._id} value={item._id}>
                        {item.thresholdName}
                      </Select.Option>
                    ))}
                </Select>
              ) : (
                <div>
                  <Form.Item
                    label="Tên ngưỡng"
                    name={["threshold", "thresholdName"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Tên ngưỡng" />
                  </Form.Item>


                  <Form.Item
                    label="Tỷ lệ thông qua"
                    name={["threshold", "value"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Tỷ lệ thông qua" />
                  </Form.Item>
                  <Form.Item
                    label="Loại ngưỡng"
                    name={["threshold", "thresholdType"]}
                    rules={[{ required: true }]}
                  >
                    <Input placeholder="Loại ngưỡng" />
                  </Form.Item>


                  <Form.Item
                    label="Mô tả"
                    name={["threshold", "description"]}
                  >
                    <Input.TextArea rows={2} />
                  </Form.Item>

                  <Form.Item
                    label="Mã ngưỡng"
                    name={["threshold", "thresholdCode"]}
                    rules={[{ required: true }]}
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
            <h3 style={{ marginTop: 20 }}>📄 Danh sách bầu chọn</h3>
            {!voteMethod ? (
              <p style={{ color: "red" }}>Vui lòng chọn hình thức bầu cử</p>
            ) : (
              <Form.List name="candidates">
                {(fields, { add, remove }) => (
                  <div>
                    {fields.map(({ key, name }) => (
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
                        {voteMethod === "691a36c358ae5966f350b2da" && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                rules={[{ required: true }]}
                                name={[name, "title"]} label="Tiêu đề">
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                rules={[{ required: true }]}
                                name={[name, "description"]}
                                label="Mô tả"
                              >
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                rules={[{ required: true }]}
                                name={[name, "metaData", "fullName"]}
                                label="Họ và tên"
                              >
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item

                                name={[name, "metaData", "age"]} label="Tuổi">
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                name={[name, "metaData", "department"]}
                                label="Phòng ban"
                              >
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                name={[name, "metaData", "position"]}
                                label="Vị trí"
                              >
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item label="Người đề xuất" name={[name, "proposerId"]}>
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                label="Ảnh ứng viên"
                                name={[name, "metaData", "image"]}
                              // valuePropName="fileList"
                              // getValueFromEvent={(e) => e?.fileList}
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
                              // valuePropName="fileList"
                              // getValueFromEvent={(e) => e?.fileList}
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button>Tải file</Button>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                name={[name, "metaData", "experience"]}
                                label="Kinh nghiệm"
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item
                                name={[name, "metaData", "achievements"]}
                                label="Thành tích"
                              >
                                <Input.TextArea rows={2} />
                              </Form.Item>
                            </Col>
                          </>
                        )}

                        {/* ======== YES / NO ======== */}
                        {voteMethod === "691a36f958ae5966f350b2e0" && (
                          <>
                            <Col span={12}>
                              <Form.Item
                                rules={[{ required: true }]}
                                name={[name, "title"]} label="Tiêu đề">
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                rules={[{ required: true }]}
                                name={[name, "description"]} label="Mô tả">
                                <Input />
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item
                                name={[name, "file"]}
                                label="Tài liệu đính kèm"
                              // valuePropName="fileList"
                              // getValueFromEvent={(e) => e?.fileList}
                              >
                                <Upload beforeUpload={() => false}>
                                  <Button>Tải file</Button>
                                </Upload>
                              </Form.Item>
                            </Col>

                            <Col span={12}>
                              <Form.Item name={[name, "proposerId"]} label="Người đề xuất">
                                <Input />
                              </Form.Item>
                            </Col>
                          </>
                        )}

                        <Col span={24}>
                          <Button danger onClick={() => remove(name)}>
                            Xóa
                          </Button>
                        </Col>
                      </Row>
                    ))}

                    <Button
                      type="dashed"
                      onClick={() => add(emptyCandidate)}
                      style={{ marginBottom: 12 }}
                    >
                      + Thêm nội dung bầu chọn
                    </Button>
                  </div>
                )}
              </Form.List>
            )}
          </Col>
        </Row>
      </Form>
    </Card>
  );
};

export default MeetingInfo;
