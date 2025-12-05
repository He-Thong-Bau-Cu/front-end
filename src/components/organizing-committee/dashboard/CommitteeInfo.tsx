import { useState } from "react";
import { TeamOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Typography, Modal, Form, Input, DatePicker, Select } from "antd";
import dayjs from "dayjs";
import MeetingService from "@/services/MeetingService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";

const { Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CommitteeInfo = () => {
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const handleOpen = () => setOpen(true);

    const handleClose = () => {
        setOpen(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // Validate electionId đã được nhập
            if (!values.electionId || !values.electionId.trim()) {
                notify("Vui lòng nhập mã cuộc bầu cử!", "error");
                return;
            }

            // Chuẩn bị payload theo đúng backend yêu cầu
            const payload: {
                electionId: string;
                meetingDate: string;
                location: string;
                title?: string;
                description?: string;
                status?: string;
            } = {
                // ✅ REQUIRED fields
                electionId: values.electionId.trim(),
                meetingDate: values.meetingDate.toISOString(),
                location: values.location.trim(),
            };

            // ⭕ OPTIONAL fields
            if (values.title?.trim()) {
                payload.title = values.title.trim();
            }
            if (values.description?.trim()) {
                payload.description = values.description.trim();
            }
            // Status - chỉ gửi nếu là giá trị hợp lệ
            if (values.status && ['ACTIVE', 'CLOSED', 'ARCHIVED', 'PENDING'].includes(values.status)) {
                payload.status = values.status;
            }
            // Nếu không có status → backend sẽ tự set default = "PENDING"

            console.log("📤 Payload gửi lên API:", payload);

            showLoading();
            const res = await MeetingService.add(payload);
            hideLoading();

            console.log("✅ Response:", res);

            notify(
                res?.message || "Tạo cuộc họp thành công!",
                "success"
            );

            form.resetFields();
            setOpen(false);
        } catch (error: any) {
            hideLoading();
            console.error("❌ Lỗi tạo cuộc họp:", error);

            // Xử lý error message từ backend
            const errorMessage = error?.response?.data?.message ||
                                error?.message ||
                                "Không thể tạo cuộc họp!";

            // Nếu là lỗi "Không tìm thấy cuộc bầu cử" → hướng dẫn rõ ràng hơn
            if (errorMessage.includes("Không tìm thấy cuộc bầu cử") ||
                errorMessage.includes("ELECTION_NOT_FOUND")) {
                notify(
                    "Cuộc bầu cử không tồn tại. Vui lòng kiểm tra lại mã cuộc bầu cử!",
                    "error"
                );
            } else {
                notify(errorMessage, "error");
            }
        }
    };

    return (
        <>
            <Card className="dashboard-header-card">
                <div className="dashboard-header-content">
                    <div className="dashboard-header-left">
                        <Text strong className="dashboard-header-title">Thành Viên ban tổ chức</Text>
                        <p className="dashboard-header-subtitle">
                            Hỗ trợ trưởng ban tổ chức
                        </p>

                        <div className="dashboard-header-user">
                            <Avatar
                                size={64}
                                icon={<TeamOutlined />}
                                className="dashboard-avatar"
                                style={{ backgroundColor: "#e8f8f2", color: "#0f9d58" }}
                            />
                            <div className="dashboard-user-info">
                                <Text strong className="dashboard-user-name">Nhân viên Lưu Hồng Nhật</Text>
                                <p className="dashboard-user-role">Thành viên ban tổ chức: Hội đồng Bầu cử khóa 10</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    );
};

export default CommitteeInfo;

