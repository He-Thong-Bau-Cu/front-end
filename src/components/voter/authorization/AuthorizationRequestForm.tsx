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

export default function AuthorizationRequestForm() {
    const { state } = useLocation();
    const navigate = useNavigate();

    const selectedUser = state?.selectedUser;
    const electionId = state?.electionId;
    const delegatorId = state?.delegatorId;

    const [form] = Form.useForm();
    const [modalOpen, setModalOpen] = useState(false);
    const [tempPayload, setTempPayload] = useState<any>(null);

    const [delegationType, setDelegationType] = useState<"ELECTION" | "LONG_TERM">("ELECTION");

    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    if (!selectedUser) {
        navigate("/voter/create-authorization");
        return null;
    }

    // --------------------- HANDLE SUBMIT ----------------------
    const handleSubmit = async (values: any) => {

        const payload: any = {
            delegationType: values.delegationType,
            electionId,
            delegatorId,
            delegateId: selectedUser._id,
            delegateReason: values.reason,
            signature: null,
            status: "DRAFT",
        };

        if (values.delegationType === "LONG_TERM") {
            payload.startDate = values.startDate.toISOString();
            payload.endDate = values.endDate.toISOString();
        }

        try {
            showLoading();

            const draft = await DelegationService.add(payload);

            if (!draft || !draft._id) {
                notify("Không thể tạo bản nháp!", "error");
                hideLoading();
                return;
            }

            setTempPayload({ draftId: draft._id });
            setModalOpen(true);

        } catch (err) {
            console.error(err);
            notify("Lỗi khi tạo ủy quyền bản nháp!", "error");
        } finally {
            hideLoading();
        }
    };

    // -------------------- NORMALIZE PAYLOAD -----------------
    function normalizeDelegationPayload(data: any) {
        return {
            ...data,
            electionId: typeof data.electionId === "string" ? data.electionId : data.electionId?._id,
            delegatorId: typeof data.delegatorId === "string" ? data.delegatorId : data.delegatorId?._id,
            delegateId: typeof data.delegateId === "string" ? data.delegateId : data.delegateId?._id,
        };
    }

    // ------------------- HANDLE DIGITAL SIGN ----------------
    const handleDigitalSign = async ({ file, password }: { file: File; password: string }) => {
        try {
            showLoading();

            if (!tempPayload?.draftId) {
                notify("Không tìm thấy bản nháp để ký!", "error");
                return;
            }

            const oldData = await DelegationService.getDelegationById(tempPayload.draftId);
            if (!oldData) {
                notify("Không tìm thấy dữ liệu ủy quyền!", "error");
                return;
            }

            const baseData = normalizeDelegationPayload(oldData);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);
            formData.append("electionId", electionId);
            formData.append("delegationId", tempPayload.draftId);

            const signRes = await DelegationService.delegationApproveVoter(formData);

            if (!signRes?.success) {
                notify("Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư.", "error");
                return;
            }

            const signatureFileUrl = signRes.data?.signatureFileUrl || null;

            const updatePayload = {
                ...baseData,
                status: "PENDING",
                signature: signatureFileUrl,
            };

            await DelegationService.update(tempPayload.draftId, updatePayload);

            notify("Ký số và gửi yêu cầu ủy quyền thành công!", "success");

            setModalOpen(false);
            navigate(-2);

        } catch (err) {
            console.error(err);
            notify("Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư số", "error");
        } finally {
            hideLoading();
        }
    };

    // --------------------- RENDER ---------------------------
    return (
        <Card
            className="delegation-form-card"
            title={
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
                style={{ marginBottom: 24, backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" }}
                title={<Text strong style={{ paddingLeft: 10 }}>Thông tin người được ủy quyền</Text>}
            >
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                    <Space>
                        <Avatar size={64} style={{ backgroundColor: "#7ECB50" }}>
                            {selectedUser.fullName?.charAt(0)}
                        </Avatar>
                        <div>
                            <Text strong style={{ fontSize: 16 }}>{selectedUser.fullName}</Text><br />
                            <Text type="secondary">{selectedUser.email}</Text>
                        </div>
                    </Space>

                    <Descriptions column={2} bordered size="small">
                        <Descriptions.Item label="CCCD">{selectedUser.citizenId}</Descriptions.Item>
                        <Descriptions.Item label="Điện thoại">{selectedUser.phone}</Descriptions.Item>
                        <Descriptions.Item label="Ngày sinh">{new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN")}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ">{selectedUser.address}</Descriptions.Item>
                        <Descriptions.Item label="Phòng ban">{selectedUser.department}</Descriptions.Item>
                        <Descriptions.Item label="Chức vụ">{selectedUser.position}</Descriptions.Item>
                    </Descriptions>
                </Space>
            </Card>

            {/* ============== FORM CHÍNH ============== */}
            <Form layout="vertical" form={form} onFinish={handleSubmit}>

                {/* --- Delegation Type --- */}
                <Form.Item
                    label="Loại ủy quyền *"
                    name="delegationType"
                    initialValue="ELECTION"
                    rules={[{ required: true, message: "Vui lòng chọn loại ủy quyền!" }]}
                >
                    <select
                        className="ant-input"
                        value={delegationType}
                        onChange={(e) => {
                            setDelegationType(e.target.value as any);
                            form.setFieldValue("delegationType", e.target.value);
                        }}
                    >
                        <option value="ELECTION">Ủy quyền theo CUỘC BẦU CỬ</option>
                        <option value="LONG_TERM">Ủy quyền DÀI HẠN</option>
                    </select>
                </Form.Item>

                {/* ---- Date fields only for LONGTERM ---- */}
                {delegationType === "LONG_TERM" && (
                    <>
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
                                        disabledDate={(cur) => cur && cur <= dayjs().startOf("day")}
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
                                                if (value.isSame(start) || value.isBefore(start)) {
                                                    return Promise.reject("Ngày kết thúc phải lớn hơn ngày bắt đầu!");
                                                }
                                                return Promise.resolve();
                                            },
                                        }),
                                    ]}
                                >
                                    <DatePicker
                                        style={{ width: "100%" }}
                                        format="DD/MM/YYYY"
                                        disabledDate={(cur) => {
                                            const start = form.getFieldValue("startDate");
                                            if (!start) return cur && cur <= dayjs().startOf("day");
                                            return cur && cur <= dayjs(start).startOf("day");
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </>
                )}

                {/* Lý do */}
                <Form.Item
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                >
                    <Input.TextArea rows={3} />
                </Form.Item>

                {/* Agreement */}
                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        { validator: (_, v) => v ? Promise.resolve() : Promise.reject("Bạn cần đồng ý điều kiện!") }
                    ]}
                >
                    <Checkbox>Bạn có chắc chắn muốn ủy quyền hay không?</Checkbox>
                </Form.Item>

                {/* Buttons */}
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
