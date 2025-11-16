import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import DelegationService from "@/services/DelegationService";
import { LeftOutlined } from "@ant-design/icons";
import {
    Avatar, Button, Card, Checkbox, Col, DatePicker, Descriptions,
    Form, Input, Row, Space, Typography
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
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
    const [modalOpen, setModalOpen] = useState(false);
    const [tempPayload, setTempPayload] = useState<any>(null);

    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    if (!selectedUser) {
        navigate("/voter/create-authorization");
        return null;
    }
    const handleSubmit = async (values: AuthorizationFormValues) => {
        const payload = {
            delegationType: "ELECTION",
            electionId,
            delegatorId,
            delegateId: selectedUser._id,
            startDate: values.startDate.toISOString(),
            endDate: values.endDate.toISOString(),
            delegateReason: values.reason,
            signature: null,
            status: "DRAFT",
        };

        try {
            showLoading();

            // 1. Tạo bản nháp
            const draft = await DelegationService.add(payload);

            if (!draft || !draft._id) {
                notify("Không thể tạo bản nháp!", "error");
                hideLoading();
                return;
            }
            // 2. Lưu lại draftId để sau ký cập nhật
            setTempPayload({ draftId: draft._id });

            // 3. Mở modal ký số
            setModalOpen(true);

        } catch (err) {
            console.error(err);
            notify("Lỗi khi tạo ủy quyền bản nháp!", "error");
        } finally {
            hideLoading();
        }
    };



    const handleDigitalSign = async ({ file, password }: { file: File; password: string }) => {
        try {
            showLoading();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);
            formData.append("electionId", electionId);

            // 1. Gọi API ký số
            const signRes = await DelegationService.delegationApprove(formData);

            if (!signRes.success) {
                notify(signRes.message || "Ký số thất bại!", "error");
                return;
            }

            const signature = signRes.data?.signatureFileUrl || null;

            // 2. Cập nhật lại bản nháp thành PENDING
            await DelegationService.update(tempPayload.draftId, {
                status: "PENDING",
                signature,
            });

            notify("Ký số & gửi yêu cầu ủy quyền thành công!", "success");
            navigate(-2);

        } catch (err) {
            console.error(err);
            notify("Lỗi trong quá trình ký số!", "error");
        } finally {
            hideLoading();
            setModalOpen(false);
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
                                disabledDate={(current) =>
                                    current && current <= dayjs().startOf("day")
                                }
                            />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày kết thúc ủy quyền *"
                            name="endDate"
                            dependencies={["startDate"]}
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày kết thúc ủy quyền!" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue("startDate");

                                        if (!start || !value) return Promise.resolve();

                                        if (value.isSame(start) || value.isBefore(start)) {
                                            return Promise.reject(
                                                "Ngày kết thúc phải lớn hơn ngày bắt đầu!"
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
                                disabledDate={(current) => {
                                    const start = form.getFieldValue("startDate");

                                    // Nếu chưa chọn ngày bắt đầu → chỉ block quá khứ
                                    if (!start) return current && current <= dayjs().startOf("day");

                                    // Khi đã có ngày bắt đầu → chỉ cho phép chọn ngày > startDate
                                    return current && current <= dayjs(start).startOf("day");
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
            <DigitalSignModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleDigitalSign}
            />


        </Card>
    );
}
