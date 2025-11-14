import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DelegationService from "@/services/DelegationService";
import { LeftOutlined } from "@ant-design/icons";
import {
    Avatar, Button, Card, Checkbox, Col, DatePicker, Descriptions,
    Form, Input, Row, Space, Typography
} from "antd";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";

const { Text, Title } = Typography;

interface AuthorizationFormValues {
    startDate: dayjs.Dayjs;
    endDate: dayjs.Dayjs;
    reason: string;
}

export default function AuthorizationRequestForm() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const selectedUser = state?.selectedUser;
    const electionId = state?.electionId;
    const delegatorId = state?.delegatorId;

    const [form] = Form.useForm();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    if (!selectedUser) {
        navigate("/voter/create-authorization");
        return null;
    }

    const handleSubmit = async (values: AuthorizationFormValues) => {
        try {
            showLoading();

            const payload = {
                delegationType: "election",
                electionId,
                delegatorId,
                delegateId: selectedUser._id,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                delegateReason: values.reason,
                signature: null,
                status: "PENDING",
            };

            await DelegationService.add(payload);
            notify("Gửi yêu cầu ủy quyền thành công!", "success");
            navigate(-2);
        } catch {
            notify("Lỗi gửi yêu cầu ủy quyền", "error");
        } finally {
            hideLoading();
        }
    };

    return (
        <Card
            className="delegation-form-card"
            title={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Title level={5} style={{ margin: 0, paddingLeft: 20 }}>
                        📝 Tạo yêu cầu ủy quyền
                    </Title>
                    <Button
                        className="backButton"
                        type="default"
                        size="middle"
                        icon={<LeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
            }
        >
            {/* ===== Thông tin người được ủy quyền ===== */}
            <Card
                style={{
                    marginBottom: 24,
                    backgroundColor: "#f8f9fa",
                    border: "1px solid #e9ecef",
                }}
                title={<Text style={{ paddingLeft: 10 }} strong>Thông tin người được ủy quyền</Text>}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <Space>
                        <Avatar size={64} style={{ backgroundColor: "#7ECB50" }}>
                            {selectedUser.fullName?.charAt(0)}
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
                        <Descriptions.Item label="CCCD">{selectedUser.citizenId}</Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">{selectedUser.phone}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">
                            {new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedUser.address}</Descriptions.Item>
                        <Descriptions.Item label="Phòng ban">{selectedUser.department}</Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">{selectedUser.position}</Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            {/* ===== Form ===== */}
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
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
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
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
                                        if (value.isBefore(start))
                                            return Promise.reject("Ngày kết thúc không thể trước ngày bắt đầu!");
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabledDate={(current) => {
                                    const start = form.getFieldValue("startDate");
                                    if (!start) return current && current < dayjs().startOf("day");
                                    return current && current < dayjs(start).startOf("day");
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>
                {/* 
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
                </Form.Item> */}

                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, val) =>
                                val ? Promise.resolve() : Promise.reject("Bạn cần đồng ý điều Kiện!"),
                        },
                    ]}
                >
                    <Checkbox>
                        Bạn có chắc chắn muốn ủy quyền hay không
                    </Checkbox>
                </Form.Item>

                <div className="delegation-form-actions">
                    <Button onClick={() => navigate(-1)}>Hủy</Button>
                    <Button type="primary" htmlType="submit" style={{ background: "#7ECB50", border: "none" }}>
                        Gửi yêu cầu ủy quyền
                    </Button>
                </div>
            </Form>
        </Card>
    );
}
