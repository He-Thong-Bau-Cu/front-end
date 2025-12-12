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
    const electionId = localStorage.getItem("currentElectionId") || state?.electionId;

    const delegatorId = state?.delegatorId;

    const [form] = Form.useForm();
    const [modalOpen, setModalOpen] = useState(false);
    const [tempPayload, setTempPayload] = useState<any>(null);

    const [delegationType, setDelegationType] = useState<"ELECTION" | "LONG_TERM">("ELECTION");

    const [startText, setStartText] = useState<string>("");
    const [endText, setEndText] = useState<string>("");



    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    if (!selectedUser) {
        navigate("/voter/create-authorization");
        return null;
    }

    if (!electionId || typeof electionId !== "string" || electionId.trim() === "") {
        notify("Không tìm thấy thông tin cuộc bầu cử! Vui lòng quay lại trang trước.", "error");
        navigate(-1);
        return null;
    }



    const handleSubmit = async (values: any) => {
        try {
            showLoading();

            if (!electionId || typeof electionId !== "string" || electionId.trim() === "") {
                notify("Không tìm thấy thông tin cuộc bầu cử!", "error");
                hideLoading();
                return;
            }

            if (!delegatorId || typeof delegatorId !== "string" || delegatorId.trim() === "") {
                notify("Không tìm thấy thông tin người ủy quyền!", "error");
                hideLoading();
                return;
            }

            // Payload KHÔNG CÓ phần file chứng minh
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
                payload.startDate = values.startDate.format("YYYY-MM-DD");
                payload.endDate = values.endDate.format("YYYY-MM-DD");
            }

            const draft = await DelegationService.add(payload);

            if (!draft || !draft._id) {
                notify("Không thể tạo bản nháp ủy quyền!", "error");
                hideLoading();
                return;
            }

            setTempPayload({ draftId: draft._id });
            setModalOpen(true);

        } catch (error: any) {
            notify("Có lỗi xảy ra khi gửi yêu cầu ủy quyền!", "error");
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
                hideLoading();
                return;
            }

            // Validate electionId
            if (!electionId || typeof electionId !== "string" || electionId.trim() === "") {
                notify("Không tìm thấy thông tin cuộc bầu cử! Vui lòng thử lại.", "error");
                hideLoading();
                return;
            }

            const oldData = await DelegationService.getDelegationById(tempPayload.draftId);
            if (!oldData) {
                notify("Không tìm thấy dữ liệu ủy quyền!", "error");
                hideLoading();
                return;
            }

            const baseData = normalizeDelegationPayload(oldData);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);
            formData.append("electionId", electionId.trim());
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

        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư số";

            notify(msg, "error");
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
                        <Descriptions.Item label="Ngày sinh">{(() => { const date = new Date(selectedUser.dateOfBirth); const h = String(date.getHours()).padStart(2, '0'); const m = String(date.getMinutes()).padStart(2, '0'); const day = String(date.getDate()).padStart(2, '0'); const month = String(date.getMonth() + 1).padStart(2, '0'); const year = date.getFullYear(); return `${h}:${m} ${day}/${month}/${year}`; })()}</Descriptions.Item>
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
                        className="ant-input delegation-type-select"
                        value={delegationType}
                        onChange={(e) => {
                            setDelegationType(e.target.value as any);
                            form.setFieldValue("delegationType", e.target.value);
                        }}
                    >
                        <option value="ELECTION">Ủy quyền trong CUỘC BẦU CỬ</option>
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
                                        inputReadOnly={false}
                                        allowClear={false}

                                        value={startText ? dayjs(startText, "DD/MM/YYYY", true) : null}

                                        disabledDate={(cur) => cur && cur < dayjs().startOf("day")}

                                        onChange={(value) => {
                                            if (!value) return;
                                            const formatted = value.format("DD/MM/YYYY");
                                            setStartText(formatted);
                                            form.setFieldValue("startDate", value);

                                            if (value.isBefore(dayjs(), "day")) {
                                                notify("Ngày bắt đầu không được nhỏ hơn ngày hiện tại!", "error");
                                            }
                                        }}

                                        onBlur={(e) => {
                                            const text = (e.target as HTMLInputElement).value.trim();
                                            if (!text) return;

                                            const parsed = dayjs(text, "DD/MM/YYYY", true);
                                            setStartText(text);

                                            if (!parsed.isValid()) {
                                                notify("Ngày bắt đầu sai định dạng!", "error");
                                                return;
                                            }

                                            form.setFieldValue("startDate", parsed);

                                            if (parsed.isBefore(dayjs(), "day")) {
                                                notify("Ngày bắt đầu không được nhỏ hơn ngày hiện tại!", "error");
                                            }
                                        }}

                                        onInput={(e) => {
                                            setStartText((e.target as HTMLInputElement).value);
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
                                        inputReadOnly={false}
                                        allowClear={false}

                                        // GIỮ NGUYÊN TEXT USER NHẬP, KHÔNG TỰ NHẢY FORMAT
                                        value={endText ? dayjs(endText, "DD/MM/YYYY", true) : null}

                                        disabledDate={(cur) => {
                                            const start = form.getFieldValue("startDate");
                                            if (!start) return cur && cur < dayjs().startOf("day");
                                            return cur && cur <= dayjs(start).startOf("day");
                                        }}

                                        // Khi chọn từ calendar
                                        onChange={(value) => {
                                            if (!value) return;

                                            const formatted = value.format("DD/MM/YYYY");
                                            setEndText(formatted);
                                            form.setFieldValue("endDate", value);

                                            const start = form.getFieldValue("startDate");

                                            // Validate: end phải > start
                                            if (start && value.isSame(start, "day")) {
                                                notify("Ngày kết thúc không được trùng ngày bắt đầu!", "error");
                                            }
                                            if (start && value.isBefore(start, "day")) {
                                                notify("Ngày kết thúc phải lớn hơn ngày bắt đầu!", "error");
                                            }
                                        }}

                                        // Khi gõ text xong + blur
                                        onBlur={(e) => {
                                            const text = (e.target as HTMLInputElement).value.trim();
                                            if (!text) return;

                                            setEndText(text);

                                            const parsed = dayjs(text, "DD/MM/YYYY", true);

                                            // Validate định dạng
                                            if (!parsed.isValid()) {
                                                notify("Ngày kết thúc sai định dạng!", "error");
                                                return;
                                            }

                                            const start = form.getFieldValue("startDate");

                                            // Validate < hôm nay
                                            if (parsed.isBefore(dayjs(), "day")) {
                                                notify("Ngày kết thúc không được nhỏ hơn ngày hiện tại!", "error");
                                                return;
                                            }

                                            // Validate <= start
                                            if (start && parsed.isSame(start, "day")) {
                                                notify("Ngày kết thúc không được trùng ngày bắt đầu!", "error");
                                                return;
                                            }
                                            if (start && parsed.isBefore(start, "day")) {
                                                notify("Ngày kết thúc phải lớn hơn ngày bắt đầu!", "error");
                                                return;
                                            }

                                            // Set value hợp lệ vào form
                                            form.setFieldValue("endDate", parsed);
                                        }}

                                        // Khi đang gõ input
                                        onInput={(e) => {
                                            setEndText((e.target as HTMLInputElement).value);
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
