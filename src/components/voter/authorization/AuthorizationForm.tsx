import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import DelegationService from "@/services/DelegationService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import FileService from "@/services/FileService";

import { InboxOutlined, LeftOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Typography,
    Upload,
} from "antd";
import Dragger from "antd/es/upload/Dragger";
import dayjs, { Dayjs } from "dayjs";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

interface AuthorizationFormValues {
    name: string;
    cccd: string;
    phone: string;
    email?: string;
    address?: string;
    startDate?: Dayjs;
    endDate?: Dayjs;
    reason: string;
    agreement: boolean;
    delegationType: string;

}

export default function AuthorizationForm() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const electionId = localStorage.getItem("currentElectionId") || "";
    const delegatorId = localStorage.getItem("userId") || "";

    const [modalOpen, setModalOpen] = useState(false);
    const [tempPayload, setTempPayload] = useState<any>(null);
    const [startText, setStartText] = useState<string>("");
    const [endText, setEndText] = useState<string>("");
    const [proofFile, setProofFile] = useState<File | null>(null);


    const [delegationType, setDelegationType] = useState<"ELECTION" | "LONG_TERM" | "">("");

    useEffect(() => {
        form.resetFields(["delegationType"]);
    }, []);

    const handleSubmit = async (values: AuthorizationFormValues) => {
        try {
            showLoading();

            // Validate file upload
            if (!proofFile) {
                notify("Vui lòng tải lên giấy tờ chứng minh!", "error");
                hideLoading();
                return;
            }

            // 1) UPLOAD FILE LÊN MINIO
            const uploadForm = new FormData();
            uploadForm.append("file", proofFile);
            uploadForm.append("fileType", "delegation-documents");
            uploadForm.append("userId", delegatorId);

            const uploadRes = await FileService.upfile(uploadForm);

            if (!uploadRes?.key) {
                notify("Upload file thất bại!", "error");
                hideLoading();
                return;
            }

            const fileUrl = uploadRes.key;

            // 2) TẠO DOCUMENT TƯƠNG ỨNG
            const docPayload = {
                electionId,
                title: "Giấy tờ chứng minh ủy quyền",
                content: "",
                fileUrl: fileUrl,
                type: "delegation-proof",
                preparedBy: delegatorId,
                status: "ACTIVE",
            };

            const docRes = await ElectionDocumentService.CreateDocument(docPayload);

            if (!docRes?.data?._id) {
                notify("Không thể tạo tài liệu chứng minh!", "error");
                hideLoading();
                return;
            }

            const documentId = docRes.data._id;

            // 3) TẠO PAYLOAD BẢN NHÁP ỦY QUYỀN
            const payload: any = {
                delegationType: values.delegationType,
                electionId,
                delegatorId,
                delegateId: null,
                delegateReason: values.reason,
                proofDocument: documentId,
                signature: null,
                status: "DRAFT",
                delegateInfo: {
                    fullName: values.name,
                    citizenId: values.cccd,
                    phone: values.phone,
                    email: values.email,
                    address: values.address,
                },
            };

            // 4) CHUYỂN ĐỊNH DẠNG NGÀY — KHÔNG DÙNG toISOString ĐỂ TRÁNH LỆCH NGÀY
            if (values.delegationType === "LONG_TERM") {
                payload.startDate = values.startDate?.format("YYYY-MM-DD");
                payload.endDate = values.endDate?.format("YYYY-MM-DD");
            }

            // 5) TẠO BẢN NHÁP
            const draft = await DelegationService.add(payload);

            if (!draft?._id) {
                notify("Không thể tạo bản nháp!", "error");
                hideLoading();
                return;
            }

            // Lưu ID bản nháp để sang bước ký số
            setTempPayload({ draftId: draft._id });
            setModalOpen(true);

        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Có lỗi xảy ra khi gửi yêu cầu ủy quyền!";
            notify(msg, "error");

        } finally {
            hideLoading();
        }
    };


    function normalizeDelegationPayload(data: any) {
        return {
            ...data,
            electionId:
                typeof data.electionId === "string"
                    ? data.electionId
                    : data.electionId?._id,
            delegatorId:
                typeof data.delegatorId === "string"
                    ? data.delegatorId
                    : data.delegatorId?._id,
        };
    }

    const handleDigitalSign = async ({
        file,
        password,
    }: {
        file: File;
        password: string;
    }) => {
        try {
            showLoading();

            if (!tempPayload?.draftId) {
                notify("Không tìm thấy bản nháp để ký!", "error");
                return;
            }

            const oldData = await DelegationService.getDelegationById(
                tempPayload.draftId
            );

            if (!oldData) {
                notify("Không tìm thấy dữ liệu bản nháp!", "error");
                return;
            }

            const baseData = normalizeDelegationPayload(oldData);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);
            formData.append("delegationId", tempPayload.draftId);

            if (baseData.delegationType === "ELECTION") {
                formData.append("electionId", electionId);
            }

            const signRes = await DelegationService.delegationApproveVoter(formData);

            if (!signRes?.success) {
                notify(
                    "Ký số thất bại! Vui lòng kiểm tra mật khẩu hoặc file chứng thư số.",
                    "error"
                );
                return;
            }

            const signatureFileUrl = signRes.data?.signatureFileUrl || null;

            const updatePayload = {
                ...baseData,
                signature: signatureFileUrl,
                status: "PENDING",
            };

            await DelegationService.update(tempPayload.draftId, updatePayload);

            notify("Ký số và gửi yêu cầu thành công!", "success");
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

    /* ----------------------------- UI ------------------------------ */
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
                        type="default"
                        icon={<LeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>

                {/* ----------------- INFO ----------------- */}
                <Form.Item
                    label="Họ và tên người được ủy quyền *"
                    name="name"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                >
                    <Input placeholder="Nhập họ tên đầy đủ" />
                </Form.Item>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="CCCD/CMND *"
                            name="cccd"
                            rules={[{ required: true, message: "Vui lòng nhập số CCCD" }]}
                        >
                            <Input placeholder="Số CCCD" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Số điện thoại *"
                            name="phone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input placeholder="Số điện thoại" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Email *"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Email" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Địa chỉ *"
                            name="address"
                            rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                        >
                            <Input placeholder="Địa chỉ" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* ------------- LOẠI ỦY QUYỀN ------------- */}
                <Form.Item
                    label="Loại ủy quyền *"
                    name="delegationType"
                    rules={[{ required: true, message: "Vui lòng chọn loại ủy quyền!" }]}
                >
                    <select
                        className="ant-input"
                        value={delegationType}
                        style={{ height: 30, borderRadius: 5, borderColor: "#d9d9d9" }}
                        onChange={(e) => {
                            const value = e.target.value as "ELECTION" | "LONG_TERM";
                            setDelegationType(value);
                            form.setFieldValue("delegationType", value);
                        }}
                    >
                        <option style={{ color: "#d9d9d9" }} value="">-- Chọn loại ủy quyền --</option>
                        <option value="ELECTION">Ủy quyền trong CUỘC BẦU CỬ</option>
                        <option value="LONG_TERM">Ủy quyền DÀI HẠN</option>
                    </select>
                </Form.Item>

                {/* -------------------- ONLY FOR LONG TERM -------------------- */}
                {delegationType === "LONG_TERM" && (
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
                                            if (value.isAfter(start)) return Promise.resolve();
                                            return Promise.reject(
                                                "Ngày kết thúc phải lớn hơn ngày bắt đầu!"
                                            );
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
                )}


                {/* Lý do */}
                <Form.Item
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập lý do" />
                </Form.Item>

                <Form.Item
                    label="Tải lên giấy tờ chứng minh *"
                    name="proofFile"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng tải lên tài liệu chứng minh!"
                        }
                    ]}
                >
                    <Dragger
                        multiple={false}
                        maxCount={1}
                        accept=".pdf,.png,.jpg,.jpeg"
                        beforeUpload={(file) => {
                            const isLt5M = file.size / 1024 / 1024 < 5;
                            if (!isLt5M) {
                                notify("File phải nhỏ hơn 5MB!", "error");
                                return Upload.LIST_IGNORE;
                            }
                            setProofFile(file);
                            form.setFieldValue("proofFile", file);
                            return false; // Không auto upload
                        }}
                        onRemove={() => {
                            setProofFile(null);
                            form.setFieldValue("proofFile", null);
                        }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined style={{ color: "#7ECB50" }} />
                        </p>
                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả file</p>
                        <p className="ant-upload-hint">Chấp nhận PDF, JPG, PNG (tối đa 5MB)</p>
                    </Dragger>
                </Form.Item>


                {/* Agreement */}
                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, v) =>
                                v ? Promise.resolve() : Promise.reject("Bạn cần đồng ý điều kiện!"),
                        },
                    ]}
                >
                    <Checkbox>Bạn có chắc chắn muốn ủy quyền hay không?</Checkbox>
                </Form.Item>

                {/* Buttons */}
                <div className="delegation-form-actions">
                    <Button onClick={() => navigate(-1)}>Hủy</Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        style={{ background: "#7ECB50", border: "none" }}
                    >
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
