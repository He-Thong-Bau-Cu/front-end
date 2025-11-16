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
} from "antd";
import dayjs from "dayjs";
import "@/style/secretary/MettingInfo.model.css";
import { useLoading } from "@/contexts/LoadingContext";

const { Title } = Typography;

interface MeetingInfoProps {
  open: boolean;
  onClose: () => void;
  onSign?: () => void;
}

interface MeetingFormValues {
  location: string;
  method: string;
  type:
  | string
  | {
    type: "other";
    typeName: string;
    typeCode: string;
    description: string;
  };

  condition:
  | string
  | {
    condition: "other";
    conditionName: string;
    conditionCode: string;
    conditionDescription: string;
  };

  authorizationStart: any;
  authorizationEnd: any;
  voteContent: string[];
}

const MeetingInfo: React.FC<MeetingInfoProps> = ({ open, onClose }) => {
  const [form] = Form.useForm<MeetingFormValues>();
  const { showLoading, hideLoading } = useLoading();

  /* ======== States for "other" options ========= */
  const [typeOther, setTypeOther] = useState(false);
  const [conditionOther, setConditionOther] = useState(false);
  const [voteContentOther, setVoteContentOther] = useState(false);

  /* ========== DATE VALIDATION ========== */
  const disabledStartDate = (current: any) =>
    current && current < dayjs().startOf("day");

  const disabledEndDate = (current: any) => {
    const start = form.getFieldValue("authorizationStart");
    if (!start) return current < dayjs().startOf("day");
    return current && current < dayjs(start).startOf("day");
  };

  /* ========== SUBMIT ========== */
  const submitForm = (values: MeetingFormValues) => {
    console.log("📌 Submitted:", values);
  };

  return (
    <Card className="meeting-card">
      <Title level={4} className="meeting-title">📄 Nội dung Quyết định</Title>

      <Form<MeetingFormValues> layout="vertical" form={form} onFinish={submitForm}>
        <Row gutter={20}>

          {/* =============== ĐỊA ĐIỂM =============== */}
          <Col span={12}>
            <Form.Item
              label="Địa điểm" 
              name="location"
              rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
            >
              <Input placeholder="Nhập địa điểm tổ chức" />
            </Form.Item>
          </Col>

          {/* =============== HÌNH THỨC TỔ CHỨC =============== */}
          <Col span={12}>
            <Form.Item
              label="Hình thức tổ chức Đại hội"
              name="method"
              rules={[{ required: true, message: "Vui lòng chọn hình thức" }]}
            >
              <Select placeholder="Chọn hình thức">
                <Select.Option value="offline">Trực tiếp</Select.Option>
                <Select.Option value="online">Trực tuyến</Select.Option>
                <Select.Option value="mix">Kết hợp</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          {/* =============== LOẠI HÌNH BẦU CỬ =============== */}
          <Col span={12}>
            <Form.Item
              label="Loại hình bầu cử"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại hình" }]}
            >
              <Select
                placeholder="Chọn loại hình"
                optionLabelProp="label"
                value={typeOther ? "other" : form.getFieldValue("type")}
                onChange={(v) => {
                  setTypeOther(v === "other");

                  if (v !== "other") {
                    form.setFieldsValue({ type: v });
                  } else {
                    form.setFieldsValue({
                      type: {
                        type: "other",
                        typeName: "",
                        typeCode: "",
                        description: "",
                      },
                    });
                  }
                }}
              >
                <Select.Option value="direct" label="Bầu trực tiếp">
                  Bầu trực tiếp
                </Select.Option>

                <Select.Option value="proxy" label="Ủy quyền">
                  Ủy quyền
                </Select.Option>

                <Select.Option value="electronic" label="Bầu điện tử">
                  Bầu điện tử
                </Select.Option>

                <Select.Option value="other" label="Khác">
                  Khác…
                </Select.Option>
              </Select>
            </Form.Item>
            {typeOther && (
              <>
                <Form.Item
                  label="Tên loại hình"
                  name={["type", "typeName"]}
                  rules={[{ required: true, message: "Vui lòng nhập tên loại hình" }]}
                >
                  <Input placeholder="Tên loại hình (Khác)" />
                </Form.Item>

                <Form.Item
                  label="Mã loại hình"
                  name={["type", "typeCode"]}
                  rules={[{ required: true, message: "Vui lòng nhập mã loại hình" }]}
                >
                  <Input placeholder="Mã loại hình (Khác)" />
                </Form.Item>

                <Form.Item
                  label="Mô tả"
                  name={["type", "description"]}
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <Input.TextArea rows={3} placeholder="Mô tả loại hình (Khác)" />
                </Form.Item>
              </>
            )}

          </Col>

          {/* =============== NGƯỠNG THÔNG QUA =============== */}
          <Col span={12}>
            <Form.Item
              label="Điều kiện / Ngưỡng thông qua"
              name="condition"
              rules={[{ required: true, message: "Vui lòng chọn điều kiện" }]}
            >
              <Select
                placeholder="Chọn điều kiện"
                value={conditionOther ? "other" : form.getFieldValue("condition")}
                onChange={(v) => {
                  setConditionOther(v === "other");

                  if (v !== "other") {
                    form.setFieldsValue({ condition: v });
                  } else {
                    form.setFieldsValue({
                      condition: {
                        condition: "other",
                        conditionName: "",
                        conditionCode: "",
                        conditionDescription: "",
                      },
                    });
                  }
                }}
              >
                <Select.Option value="50">Trên 50% phiếu</Select.Option>
                <Select.Option value="65">Trên 65% phiếu</Select.Option>
                <Select.Option value="75">Trên 75% phiếu</Select.Option>
                <Select.Option value="other">Khác…</Select.Option>
              </Select>
            </Form.Item>

            {conditionOther && (
              <>
                <Form.Item
                  label="Tên điều kiện"
                  name={["condition", "conditionName"]}
                  rules={[{ required: true, message: "Vui lòng nhập tên điều kiện" }]}
                >
                  <Input placeholder="Ví dụ: Điều kiện đặc biệt" />
                </Form.Item>

                <Form.Item
                  label="Mã điều kiện"
                  name={["condition", "conditionCode"]}
                  rules={[{ required: true, message: "Vui lòng nhập mã điều kiện" }]}
                >
                  <Input placeholder="Ví dụ: CT001" />
                </Form.Item>

                <Form.Item
                  label="Mô tả điều kiện"
                  name={["condition", "conditionDescription"]}
                  rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
                >
                  <Input.TextArea rows={3} placeholder="Mô tả chi tiết điều kiện" />
                </Form.Item>
              </>
            )}
          </Col>

          {/* =============== NGÀY BẮT ĐẦU – KẾT THÚC =============== */}
          <Col span={12}>
            <Form.Item
              label="Ngày bắt đầu ủy quyền"
              name="authorizationStart"
              rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu" }]}
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
                { required: true, message: "Vui lòng chọn ngày kết thúc" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const start = getFieldValue("authorizationStart");
                    if (!value || !start) return Promise.resolve();

                    if (dayjs(value).isBefore(start, "day")) {
                      return Promise.reject(
                        new Error("Ngày kết thúc phải sau ngày bắt đầu")
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
                disabledDate={(d) => {
                  const start = form.getFieldValue("authorizationStart");
                  if (!start) return d && d < dayjs().startOf("day");
                  return d && d < dayjs(start).startOf("day");
                }}
              />
            </Form.Item>
          </Col>

          {/* =============== NỘI DUNG BẦU CỬ =============== */}
          <Col span={24}>
            <Form.Item
              label="Nội dung bầu cử"
              name="voteContent"
              rules={[{ required: true, message: "Vui lòng chọn nội dung" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn nội dung bầu cử"
                onChange={(v) => setVoteContentOther(v.includes("other"))}
              >
                <Select.Option value="elect_bod">Bầu HĐQT</Select.Option>
                <Select.Option value="elect_bks">Bầu Ban kiểm soát</Select.Option>
                <Select.Option value="approve_fs">Thông qua báo cáo tài chính</Select.Option>
                <Select.Option value="approve_plan">Thông qua kế hoạch SXKD</Select.Option>
                <Select.Option value="other">Khác…</Select.Option>
              </Select>
            </Form.Item>

            {voteContentOther && (
              <Form.Item
                label="Nội dung khác"
                name="voteContentOtherText"
                rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
              >
                <Input placeholder="Nhập nội dung khác…" />
              </Form.Item>
            )}
          </Col>

        </Row>

        {/* ========================== BUTTON ========================== */}
        <div className="meeting-actions">
          <Button onClick={onClose}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            Lưu thông tin
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default MeetingInfo;
