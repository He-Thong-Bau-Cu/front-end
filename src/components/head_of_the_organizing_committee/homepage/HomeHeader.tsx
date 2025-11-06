import React, { useState } from "react";
import {
    Button,
    Typography,
    Modal,
    Input,
    DatePicker,
    Form,
    Select,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import MeetingService from "@/services/MeetingService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const HomeHeader: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                electionId: values.electionId,
                title: values.title,
                meetingDate: values.meetingDate.toISOString(),
                location: values.location,
                description: values.description,
                status: values.status,
            };

            showLoading();
            const res = await MeetingService.add(payload);
            hideLoading();

            console.log("👉 API response:", res);

            notify(
                res?.message || "✅ Tạo cuộc họp thành công!",
                "success"
            );

            form.resetFields();
            setOpen(false);
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            hideLoading();
            console.error("❌ Lỗi tạo cuộc họp:", error);
            notify(
                error?.response?.data?.message ||
                error?.message ||
                "❌ Không thể tạo cuộc họp!",
                "error"
            );
        }
    };

    return (
        <>
            <div
                className="home-header"
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Hệ thống bầu cử
                    </Title>
                    <Text type="secondary">Sự lựa chọn của doanh nghiệp</Text>
                </div>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="large"
                    className="home-btn"
                    onClick={handleOpen}
                >
                    Tạo cuộc họp mới
                </Button>
            </div>

            {/* Modal tạo cuộc họp */}
            <Modal
                title="Tạo cuộc họp mới"
                open={open}
                onCancel={handleClose}
                onOk={handleSubmit}
                okText="Tạo"
                cancelText="Hủy"
                width={650}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        status: "SCHEDULED",
                        meetingDate: dayjs(),
                    }}
                >
                    <Form.Item
                        label="Mã cuộc bầu cử (Election ID)"
                        name="electionId"
                        rules={[{ required: true, message: "Vui lòng nhập mã cuộc bầu cử" }]}
                    >
                        <Input placeholder="VD: 60c72b2f9b1e8d001c8e4f3a" />
                    </Form.Item>

                    <Form.Item
                        label="Tiêu đề cuộc họp"
                        name="title"
                        rules={[{ required: true, message: "Vui lòng nhập tiêu đề cuộc họp" }]}
                    >
                        <Input placeholder="Nhập tiêu đề cuộc họp..." />
                    </Form.Item>

                    <Form.Item
                        label="Ngày & giờ tổ chức"
                        name="meetingDate"
                        rules={[{ required: true, message: "Vui lòng chọn ngày giờ tổ chức" }]}
                    >
                        <DatePicker
                            showTime
                            style={{ width: "100%" }}
                            format="DD/MM/YYYY HH:mm"
                            placeholder="Chọn ngày và giờ tổ chức"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Địa điểm"
                        name="location"
                        rules={[{ required: true, message: "Vui lòng nhập địa điểm" }]}
                    >
                        <Input placeholder="VD: Phòng họp lớn, Tầng 2, Tòa nhà A" />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="description">
                        <TextArea
                            rows={3}
                            placeholder="Nhập mô tả chi tiết về cuộc họp (tùy chọn)"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Trạng thái"
                        name="status"
                        rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
                    >
                        <Select>
                            <Option value="DRAFT">Bản nháp</Option>
                            <Option value="SCHEDULED">Đã lên lịch</Option>
                            <Option value="ACTIVE">Đang diễn ra</Option>
                            <Option value="COMPLETED">Đã kết thúc</Option>
                            <Option value="CANCELLED">Đã hủy</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default HomeHeader;
