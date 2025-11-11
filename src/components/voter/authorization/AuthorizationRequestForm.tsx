import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Upload,
    Space,
    Avatar,
    Descriptions,
    Typography,
    message
} from "antd";
import DelegationService from "@/services/DelegationService";
import { useLoading } from "@/contexts/LoadingContext";
import { User } from "@/types/User.interface";
import dayjs from "dayjs";
import { useNotification } from "@/contexts/NotificationContext";

const { Text, Title } = Typography;

interface AuthorizationRequestFormProps {
    selectedUser: User;
    onBack: () => void;
    electionId: string;
    delegatorId: string;
}

export default function AuthorizationRequestForm({
    selectedUser,
    onBack,
    electionId,
}: AuthorizationRequestFormProps) {

    const [form] = Form.useForm();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();  // ✅ ADD


    const handleSubmit = async (values: any) => {
        try {
            showLoading();

            const myId = localStorage.getItem("userId");

            const payload = {
                delegationType: "election",
                electionId,
                delegatorId: myId,
                delegateId: selectedUser._id,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                documentId: null,
                delegateReason: values.reason,
                signature: null,
                status: "PENDING"
            };

            await DelegationService.add(payload);

            notify("Gửi yêu cầu ủy quyền thành công!", "success");
            onBack();
        } catch (error: any) {
            console.error(error);
            notify(error?.message || "Lỗi gửi yêu cầu ủy quyền", "error");
        } finally {
            hideLoading();
        }
    };

    return (
        <Card
            className="delegation-form-card"
            title={
                <Space>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={onBack}
                        style={{ border: "none", boxShadow: "none" }}
                    />
                    <Title level={4} style={{ margin: 0 }}>
                        📝 Tạo yêu cầu ủy quyền
                    </Title>
                </Space>
            }
        >
            {/* ===== Thông tin người được ủy quyền ===== */}
            <Card
                style={{
                    marginBottom: 24,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                }}
                title={<Text strong>Thông tin người được ủy quyền</Text>}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <Space>
                        <Avatar size={64} style={{ backgroundColor: "#7ECB50" }}>
                            {selectedUser.fullName.charAt(0)}
                        </Avatar>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>
                                {selectedUser.fullName}
                            </Text>
                            <br />
                            <Text type="secondary">{selectedUser.email}</Text>
                        </div>
                    </Space>
                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="CCCD">
                            {selectedUser.citizenId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">
                            {selectedUser.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">
                            {selectedUser.address}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phòng ban">
                            {selectedUser.department}
                        </Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">
                            {selectedUser.position}
                        </Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            {/* ===== Form ===== */}
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                {/* Ngày bắt đầu / kết thúc */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày bắt đầu ủy quyền *"
                            name="startDate"
                            rules={[{ required: true, message: "Vui lòng chọn ngày bắt đầu!" }]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabledDate={(current) => {
                                    return current && current < dayjs().startOf("day");
                                }}
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày kết thúc ủy quyền *"
                            name="endDate"
                            dependencies={["startDate"]}
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue("startDate");
                                        if (!start || !value) return Promise.resolve();
                                        if (value.isBefore(start)) {
                                            return Promise.reject("Ngày kết thúc không thể trước ngày bắt đầu!");
                                        }
                                        return Promise.resolve();
                                    }
                                })
                            ]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabledDate={(current) => {
                                    const start = form.getFieldValue("startDate");
                                    if (!start) {
                                        return current && current < dayjs().startOf("day");
                                    }
                                    return current && current < dayjs(start).startOf("day");
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Lý do */}
                <Form.Item
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                {/* Upload chứng từ (optional) */}
                <Form.Item label="Tải lên giấy tờ chứng minh" name="upload">
                    <Upload.Dragger multiple>
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined style={{ color: "#27ae60", fontSize: 24 }} />
                        </p>
                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả file</p>
                        <p className="ant-upload-hint" style={{ color: "#999" }}>
                            Chấp nhận PDF, PNG, JPG (tối đa 5MB)
                        </p>
                    </Upload.Dragger>
                </Form.Item>

                {/* Check điều khoản */}
                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, val) =>
                                val ? Promise.resolve() : Promise.reject("Bạn cần đồng ý điều khoản!")
                        }
                    ]}
                >
                    <Checkbox>
                        Tôi xác nhận đã đọc và đồng ý với <a href="#">điều khoản ủy quyền</a>.
                    </Checkbox>
                </Form.Item>

                {/* Buttons */}
                <div className="delegation-form-actions">
                    <Button onClick={onBack}>Hủy</Button>
                    <Button type="primary" htmlType="submit" style={{ background: "#7ECB50", border: "none" }}>
                        Gửi yêu cầu
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
