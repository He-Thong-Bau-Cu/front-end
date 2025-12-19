import React, { useState } from "react";
import { Modal, Form, DatePicker, Select, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import ElectionService from "@/services/ElectionService";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";
import { PATH } from "@/enums/PATH";

const { Option } = Select;

interface ReelectionModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  electionId: string;
}

const ReelectionModal: React.FC<ReelectionModalProps> = ({
  open,
  onClose,
  onSuccess,
  electionId,
}) => {
  const [form] = Form.useForm();
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      showLoading();

      const startDate = values.startDate.toDate();
      const endDate = values.endDate.toDate();
      // Mặc định bắt đầu từ giai đoạn bỏ phiếu
      const startStage = 'voting';

      await ElectionService.cloneForReelection(
        electionId,
        startDate,
        endDate,
        startStage
      );

      notify("Bắt đầu cuộc bầu cử lại thành công!", "success");
      form.resetFields();
      onSuccess();
      onClose();
      // Redirect về trang home
      navigate(PATH.HOME);
    } catch (error: any) {
      console.error("Error starting reelection:", error);
      notify(
        error?.response?.data?.message || "Không thể bắt đầu cuộc bầu cử lại",
        "error"
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <ReloadOutlined />
          <span>Bắt đầu cuộc bầu cử lại</span>
        </Space>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Xác nhận"
      cancelText="Hủy"
      width={600}
      okButtonProps={{
        style: {
          backgroundColor: "#52c41a",
          borderColor: "#52c41a",
          color: "#fff",
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        style={{ marginTop: 20 }}
      >
        <Form.Item
          label="Thời gian bắt đầu bầu cử lại"
          name="startDate"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
            {
              validator(_, value: Dayjs) {
                if (!value) {
                  return Promise.resolve();
                }
                const now = dayjs();
                if (value.isBefore(now, 'minute')) {
                  return Promise.reject(
                    new Error("Thời gian bắt đầu không được là quá khứ")
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder="Chọn thời gian bắt đầu"
            disabledDate={(current) => {
              // Disable các ngày trong quá khứ
              return current && current < dayjs().startOf('day');
            }}
            disabledTime={(current) => {
              // Nếu chọn ngày hôm nay, disable các giờ/phút trong quá khứ
              if (current && current.isSame(dayjs(), 'day')) {
                const now = dayjs();
                return {
                  disabledHours: () => {
                    const hours = [];
                    for (let i = 0; i < now.hour(); i++) {
                      hours.push(i);
                    }
                    return hours;
                  },
                  disabledMinutes: (selectedHour: number) => {
                    if (selectedHour === now.hour()) {
                      const minutes = [];
                      for (let i = 0; i <= now.minute(); i++) {
                        minutes.push(i);
                      }
                      return minutes;
                    }
                    return [];
                  },
                };
              }
              return {};
            }}
          />
        </Form.Item>

        <Form.Item
          label="Thời gian kết thúc bầu cử lại"
          name="endDate"
          rules={[
            { required: true, message: "Vui lòng chọn thời gian kết thúc" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue("startDate")) {
                  return Promise.resolve();
                }
                if (value.isBefore(getFieldValue("startDate"))) {
                  return Promise.reject(
                    new Error("Thời gian kết thúc phải sau thời gian bắt đầu")
                  );
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            style={{ width: "100%" }}
            placeholder="Chọn thời gian kết thúc"
            disabledDate={(current) => {
              // Disable các ngày trong quá khứ
              return current && current < dayjs().startOf('day');
            }}
            disabledTime={(current) => {
              // Nếu chọn ngày hôm nay, disable các giờ/phút trong quá khứ
              if (current && current.isSame(dayjs(), 'day')) {
                const now = dayjs();
                return {
                  disabledHours: () => {
                    const hours = [];
                    for (let i = 0; i < now.hour(); i++) {
                      hours.push(i);
                    }
                    return hours;
                  },
                  disabledMinutes: (selectedHour: number) => {
                    if (selectedHour === now.hour()) {
                      const minutes = [];
                      for (let i = 0; i <= now.minute(); i++) {
                        minutes.push(i);
                      }
                      return minutes;
                    }
                    return [];
                  },
                };
              }
              return {};
            }}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReelectionModal;

