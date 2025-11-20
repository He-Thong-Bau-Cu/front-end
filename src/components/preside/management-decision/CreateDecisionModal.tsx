import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Row,
  Col,
  Divider,
  Select,
  DatePicker,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import "../../../style/preside/CreateDecisionModal.model.css";
import dayjs from "dayjs";
import ElectionService from "@/services/ElectionService";

const { Option } = Select;

interface CreateDecisionModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any, isEdit?: boolean, id?: string) => void;
  editMode?: boolean;
  initialData?: any;
}

const FORMAT = "YYYY-MM-DD HH:mm:ss"; // FORMAT CHUẨN KHÔNG LỆCH GIỜ

const CreateDecisionModal: React.FC<CreateDecisionModalProps> = ({
  open,
  onCancel,
  onSubmit,
  editMode = false,
  initialData,
}) => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState<any[]>([]);

  /* ===========================================================
      LOAD USER THEO THỜI GIAN
  =========================================================== */
  const loadUsers = async (body: { startDate: string; endDate: string }) => {
    try {
      if (!body.startDate || !body.endDate) return;
      const res = await ElectionService.getElectionUser(body);
      setUserList(res);
    } catch (err) {
      console.error("Không thể load user:", err);
    }
  };

  /* ===========================================================
      INIT FORM WHEN OPEN / EDIT
  =========================================================== */
  useEffect(() => {
    if (open) {
      if (editMode && initialData) {
        // Convert từ string backend -> dayjs đúng format
        const start = initialData.startDate
          ? dayjs(initialData.startDate, FORMAT)
          : null;

        const end = initialData.endDate
          ? dayjs(initialData.endDate, FORMAT)
          : null;

        form.setFieldsValue({
          decisionNumber: initialData.decisionNumber || "",
          decisionName: initialData.decisionName || "",
          secretaryId: initialData.signerId || undefined,
          startDate: start,
          endDate: end,
        });

        if (start && end) {
          loadUsers({
            startDate: start.format(FORMAT),
            endDate: end.format(FORMAT),
          });
        }
      } else {
        form.resetFields();
        setUserList([]);
      }
    }
  }, [open, editMode, initialData, form]);

  /* ===========================================================
      SUBMIT
  =========================================================== */
  const handleFinish = (values: any) => {
    const payload = {
      ...values,
      startDate: values.startDate?.format(FORMAT),
      endDate: values.endDate?.format(FORMAT),
    };

    onSubmit(payload, editMode, initialData?._id);
  };

  /* ===========================================================
      MIN DATE = TODAY + 20 DAYS
  =========================================================== */
  const todayPlus20 = dayjs().add(20, "day").startOf("day");

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={750}
      className="create-decision-modal"
      centered
    >
      {/* HEADER */}
      <div className="modal-header">
        <FileTextOutlined className="header-icon" />
        <div>
          <h2 className="header-title">
            {editMode ? "Chỉnh sửa nghị quyết bầu cử" : "Tạo nghị quyết bầu cử"}
          </h2>
          <p className="header-sub">
            {editMode
              ? "Cập nhật thông tin nghị quyết bầu cử"
              : "Nhập đầy đủ thông tin cần thiết"}
          </p>
        </div>
      </div>

      <Divider />

      {/* FORM */}
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Row gutter={[0, 16]}>
          {/* Số quyết định */}
          <Col span={24}>
            <Form.Item
              name="decisionNumber"
              label="Số quyết định"
              rules={[{ required: true, message: "Vui lòng nhập số quyết định" }]}
            >
              <Input placeholder="VD: QĐ-15/2025/QH-16" />
            </Form.Item>
          </Col>

          {/* Tên nghị quyết */}
          <Col span={24}>
            <Form.Item
              name="decisionName"
              label="Tên nghị quyết"
              rules={[{ required: true, message: "Vui lòng nhập tên nghị quyết" }]}
            >
              <Input placeholder="Nhập tên nghị quyết" />
            </Form.Item>
          </Col>

          {/* DATE RANGE */}
          <Row gutter={20} style={{ width: "100%" }}>
            {/* Thời gian bắt đầu */}
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Thời gian bắt đầu"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian bắt đầu"
                  disabledDate={(current) => current && current < todayPlus20}
                  onChange={(value) => {
                    form.setFieldsValue({ startDate: value });

                    const end = form.getFieldValue("endDate");
                    if (value && end) {
                      loadUsers({
                        startDate: value.format(FORMAT),
                        endDate: end.format(FORMAT),
                      });
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
                  { required: true },
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
                  showTime
                  format={FORMAT}
                  style={{ width: "100%" }}
                  placeholder="Chọn thời gian kết thúc"
                  disabledDate={(current) => {
                    const start = form.getFieldValue("startDate");

                    if (!start) return current && current < todayPlus20;

                    // Cho phép cùng ngày, chỉ cấm ngày trước
                    return current && current < start.startOf("day");
                  }}
                  onChange={(value) => {
                    form.setFieldsValue({ endDate: value });

                    const start = form.getFieldValue("startDate");
                    if (start && value) {
                      loadUsers({
                        startDate: start.format(FORMAT),
                        endDate: value.format(FORMAT),
                      });
                    }
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Thư ký */}
          <Col span={24}>
            <Form.Item
              name="secretaryId"
              label="Thư ký chủ tọa"
              rules={[{ required: true, message: "Vui lòng chọn thư ký" }]}
            >
              <Select placeholder="Chọn thư ký" allowClear>
                {userList.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.fullName}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* FOOTER */}
        <div className="modal-footer">
          <Button onClick={onCancel}>Hủy</Button>
          <Button type="primary" htmlType="submit">
            {editMode ? "Cập nhật nghị quyết" : "Tạo nghị quyết"}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CreateDecisionModal;
