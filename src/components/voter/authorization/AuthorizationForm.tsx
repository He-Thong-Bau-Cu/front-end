import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DelegationService from "@/services/DelegationService";
import UserService from "@/services/UserService";
import { ArrowLeftOutlined, LeftOutlined } from "@ant-design/icons";
import {
    Button,
    Card,
    Checkbox,
    Col,
    DatePicker,
    Form,
    Input,
    Row,
    Space,
    Typography
} from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";


const { Title } = Typography;

interface AuthorizationFormValues {
    name: string;
    cccd: string;
    phone: string;
    email?: string;
    address?: string;
    startDate: Dayjs;
    endDate: Dayjs;
    reason: string;
    agreement: boolean;
}
const AuthorizationForm = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const electionId = localStorage.getItem("currentElectionId") || "";
    const delegatorId = localStorage.getItem("userId") || "";
    const handleSubmit = async (values: AuthorizationFormValues) => {

        try {
            showLoading();

            // Tạo user mới (delegate)
            const newUserPayload = {
                fullName: values.name,
                citizenId: values.cccd,
                phone: values.phone,
                email: values.email,
                address: values.address,
            };

            let createdUser;

            try {
                createdUser = await UserService.create(newUserPayload);
                console.log("Created user >>> ", createdUser);

            } catch (error: any) {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể tạo người dùng mới";

                notify(
                    Array.isArray(message) ? message.join(", ") : message,
                    "error"
                );
                hideLoading();
                return;
            }

            const delegateId = createdUser.data._id;

            // 2. Payload ủy quyền
            const payload = {
                delegationType: "election",
                electionId,
                delegatorId,
                delegateId,
                startDate: values.startDate.toISOString(),
                endDate: values.endDate.toISOString(),
                delegateReason: values.reason,
                signature: null,
                status: "PENDING",
            };

            try {
                await DelegationService.add(payload);
            } catch (error: any) {
                const message =
                    error?.response?.data?.message ||
                    error?.message ||
                    "Không thể gửi yêu cầu ủy quyền";

                notify(
                    Array.isArray(message) ? message.join(", ") : message,
                    "error"
                );
                hideLoading();
                return;
            }

            notify("Gửi yêu cầu ủy quyền thành công!", "success");
            navigate(-2);

        } catch (error) {
            notify("Có lỗi xảy ra, vui lòng thử lại!", "error");
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
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* --- Họ tên & CCCD --- */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Họ và tên người được ủy quyền *"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                        >
                            <Input placeholder="Nhập họ tên đầy đủ" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="CCCD/CMND *"
                            name="cccd"
                            rules={[{ required: true, message: "Vui lòng nhập số CCCD/CMND" }]}
                        >
                            <Input placeholder="Số CCCD/CMND" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- SĐT & Email --- */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Số điện thoại *"
                            name="phone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input placeholder="Nhập số điện thoại liên hệ" />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Email *"
                            name="email"
                            rules={[
                                { required: true, message: "Vui lòng nhập email" },
                                { type: "email", message: "Email không hợp lệ" },
                            ]}
                        >
                            <Input placeholder="Địa chỉ email" />
                        </Form.Item>

                    </Col>
                </Row>

                {/* --- Ngày sinh  */}
                {/* <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày sinh *"
                            name="dob"
                            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                        >
                            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>

                </Row> */}

                {/* --- Địa chỉ --- */}
                <Form.Item
                    label="Địa chỉ người được ủy quyền *"
                    name="address"
                    rules={[
                        { required: true, message: "Vui lòng nhập địa chỉ" }
                    ]}
                >
                    <Input placeholder="Địa chỉ đầy đủ" />
                </Form.Item>


                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            label="Ngày bắt đầu ủy quyền *"
                            name="startDate"
                            rules={[
                                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
                                () => ({
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();
                                        if (!value.isAfter(dayjs().startOf("day"))) {
                                            return Promise.reject("Ngày bắt đầu phải lớn hơn ngày hiện tại");
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
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
                                { required: true, message: "Vui lòng chọn ngày kết thúc" },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        const start = getFieldValue("startDate");
                                        if (!start || !value) return Promise.resolve();

                                        if (value.isAfter(start)) {
                                            return Promise.resolve();
                                        }

                                        return Promise.reject("Ngày kết thúc phải lớn hơn ngày bắt đầu");
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                style={{ width: "100%" }}
                                format="DD/MM/YYYY"
                                disabledDate={(current) => {
                                    const start = form.getFieldValue("startDate");
                                    // Không chọn trước hôm nay
                                    if (!start) {
                                        return current && current < dayjs().startOf("day");
                                    }
                                    // Không chọn <= startDate
                                    return current && current <= start.startOf("day");
                                }}
                            />
                        </Form.Item>

                    </Col>
                </Row>



                {/* --- Lý do ủy quyền --- */}
                <Form.Item
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do ủy quyền" }]}
                >
                    <Input.TextArea rows={3} placeholder="Nhập lý do ủy quyền..." />
                </Form.Item>

                {/* --- Upload giấy tờ chứng minh --- */}
                {/* <Form.Item label="Tải lên giấy tờ chứng minh" name="upload">
                    <Upload.Dragger multiple>
                        <p className="ant-upload-drag-icon">
                            <UploadOutlined style={{ color: "#27ae60", fontSize: 24 }} />
                        </p>
                        <p className="ant-upload-text">Nhấn để tải lên hoặc kéo thả file</p>
                        <p className="ant-upload-hint">Chấp nhận PDF, PNG, JPG (tối đa 5MB)</p>
                    </Upload.Dragger>
                </Form.Item> */}

                {/* --- Điều khoản --- */}
                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Vui lòng đồng ý với điều kiện")),
                        },
                    ]}
                >
                    <Checkbox>
                        Bạn có chắc chắn muốn ủy quyền hay không
                    </Checkbox>
                </Form.Item>

                {/* --- Nút hành động --- */}
                <div className="delegation-form-actions">
                    <Button onClick={() => navigate(-1)}>Hủy bỏ</Button>
                    <Button type="primary" htmlType="submit" style={{ background: "#7ECB50", border: "none" }}>
                        Gửi yêu cầu ủy quyền
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default AuthorizationForm;
