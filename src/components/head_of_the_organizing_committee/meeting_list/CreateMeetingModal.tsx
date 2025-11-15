import React, { useState, useEffect } from "react";
import {
    Modal,
    Form,
    Input,
    DatePicker,
    Select,
    message,
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import MeetingService from "@/services/MeetingService";
import ElectionService from "@/services/ElectionService";
import { BaseResponse } from "@/types/BaseResponse.interface";

const { TextArea } = Input;
const { Option } = Select;

interface CreateMeetingModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess?: () => void;
}

interface Election {
    _id: string;
    title: string;
    decisionName?: string;
}

// Map trạng thái tiếng Anh sang tiếng Việt
const statusMap: Record<string, string> = {
    "UPCOMING": "Sắp diễn ra",
    "ACTIVE": "Đang hoạt động",
    "ENDED": "Đã kết thúc",
};

const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
    open,
    onCancel,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [elections, setElections] = useState<Election[]>([]);
    const [loadingElections, setLoadingElections] = useState(false);

    // Load danh sách cuộc bầu cử
    useEffect(() => {
        if (open) {
            fetchElections();
        }
    }, [open]);

    const fetchElections = async () => {
        try {
            setLoadingElections(true);
            const response: BaseResponse<any> = await ElectionService.searchElections({
                limit: 100,
            });

            if (response.success && response.data) {
                const electionsData = response.data.content || response.data;
                setElections(Array.isArray(electionsData) ? electionsData : []);
            } else {
                message.error(response.message || "Không thể tải danh sách cuộc bầu cử");
            }
        } catch (error: any) {
            console.error("Lỗi khi tải danh sách cuộc bầu cử:", error);
            message.error(error?.response?.data?.message || "Đã xảy ra lỗi khi tải danh sách cuộc bầu cử");
        } finally {
            setLoadingElections(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            const payload = {
                electionId: values.electionId,
                title: values.title,
                meetingDate: values.meetingDate.toISOString(),
                location: values.location,
                participants: values.participants ? Number(values.participants) : 0,
                status: values.status || "UPCOMING", // Gửi giá trị tiếng Anh lên backend
            };

            setLoading(true);
            const res = await MeetingService.add(payload);
            setLoading(false);

            console.log("👉 API response:", res);

            if (res?.success) {
                const statusText = statusMap[payload.status] || payload.status;
                message.success(`✅ Tạo cuộc họp thành công! Trạng thái: ${statusText}`);
                form.resetFields();
                onCancel();
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                message.error(res?.message || "❌ Không thể tạo cuộc họp!");
            }
        } catch (error: any) {
            setLoading(false);
            console.error("❌ Lỗi tạo cuộc họp:", error);
            
            if (error?.errorFields) {
                // Validation errors từ form
                return;
            }
            
            message.error(
                error?.response?.data?.message ||
                error?.message ||
                "❌ Không thể tạo cuộc họp!"
            );
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={<div style={{ textAlign: "center", fontSize: 20 }}>Tạo cuộc họp mới</div>}
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            okText="Tạo"
            cancelText="Hủy"
            width={650}
            confirmLoading={loading}
            okButtonProps={{
                style: { backgroundColor: "#52c41a", borderColor: "#52c41a" },
            }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: "UPCOMING",
                    meetingDate: dayjs(),
                }}
            >
                <Form.Item
                    label="Cuộc bầu cử"
                    name="electionId"
                    rules={[{ required: true, message: "Vui lòng chọn cuộc bầu cử" }]}
                >
                    <Select
                        placeholder="Chọn cuộc bầu cử"
                        loading={loadingElections}
                        showSearch
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {elections.map((election) => (
                            <Option key={election._id} value={election._id}>
                                {election.title || election.decisionName || election._id}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Tiêu đề cuộc họp"
                    name="title"
                >
                    <Input placeholder="Nhập tiêu đề cuộc họp..." />
                </Form.Item>

                <Form.Item
                    label="Ngày & giờ tổ chức"
                    name="meetingDate"
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
                >
                    <Input placeholder="VD: Phòng họp lớn, Tầng 2, Tòa nhà A" />
                </Form.Item>

                <Form.Item
                    label="Tham dự"
                    name="participants"
                >
                    <Input
                        type="number"
                        placeholder="Nhập số lượng người tham gia"
                        min={0}
                    />
                </Form.Item>

                <Form.Item
                    label="Trạng thái"
                    name="status"
                >
                    <Select>
                        <Option value="PENDING">Sắp diễn ra</Option>
                        <Option value="ACTIVE">Đang hoạt động</Option>
                        <Option value="ENDED">Đã kết thúc</Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateMeetingModal;

