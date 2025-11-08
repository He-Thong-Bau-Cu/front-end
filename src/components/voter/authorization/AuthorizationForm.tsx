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
    Select,
    Typography,
    Upload,
    Space,
} from "antd";

const { Title } = Typography;
const { Option } = Select;

interface AuthorizationFormProps {
    onBack: () => void;
}

interface AuthorizationFormValues {
    name: string;
    cccd: string;
    phone: string;
    email?: string;
    dob: unknown;
    relation: string;
    address?: string;
    authorizationDate: unknown;
    reason: string;
    upload?: unknown;
    agreement: boolean;
}

const AuthorizationForm = ({ onBack }: AuthorizationFormProps) => {
    const [form] = Form.useForm();

    const handleSubmit = (values: AuthorizationFormValues) => {
        console.log("Create user and authorization:", values);
        // TODO: Call API to create user and submit authorization request
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
                        📝 Tạo người dùng mới và ủy quyền
                    </Title>
                </Space>
            }
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                {/* --- Dòng 1: Họ tên & CCCD --- */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            className="delegation-table"
                            label="Họ và tên người được ủy quyền *"
                            name="name"
                            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                        >
                            <Input className="delegation-input" placeholder="Nhập họ tên đầy đủ" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            className="delegation-table"
                            label="CCCD/CMND *"
                            name="cccd"
                            rules={[{ required: true, message: "Vui lòng nhập số CCCD/CMND" }]}
                        >
                            <Input className="delegation-input" placeholder="Số CCCD/CMND" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- Dòng 2: SĐT & Email --- */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            className="delegation-table"
                            label="Số điện thoại *"
                            name="phone"
                            rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                        >
                            <Input className="delegation-input" placeholder="Nhập số điện thoại liên hệ" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item className="delegation-table" label="Email" name="email">
                            <Input className="delegation-input" placeholder="Địa chỉ email (nếu có)" />
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- Dòng 3: Ngày sinh & Quan hệ --- */}
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item
                            className="delegation-table"
                            label="Ngày sinh *"
                            name="dob"
                            rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
                        >
                            <DatePicker
                                className="delegation-input"
                                style={{ width: "100%" }}
                                placeholder="Chọn ngày sinh"
                                format="DD/MM/YYYY"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            className="delegation-table"
                            label="Quan hệ với bạn *"
                            name="relation"
                            rules={[{ required: true, message: "Vui lòng chọn quan hệ" }]}
                        >
                            <Select className="delegation-input" placeholder="Chọn quan hệ">
                                <Option value="ban">Bạn</Option>
                                <Option value="dongnghiep">Đồng nghiệp</Option>
                                <Option value="nguoi_than">Người thân</Option>
                                <Option value="khac">Khác</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                {/* --- Địa chỉ --- */}
                <Form.Item className="delegation-table" label="Địa chỉ người được ủy quyền" name="address">
                    <Input className="delegation-input" placeholder="Địa chỉ đầy đủ" />
                </Form.Item>

                {/* --- Ngày ủy quyền --- */}
                <Form.Item
                    className="delegation-table"
                    label="Ngày ủy quyền *"
                    name="authorizationDate"
                    rules={[{ required: true, message: "Vui lòng chọn ngày ủy quyền" }]}
                >
                    <DatePicker
                        className="delegation-input"
                        style={{ width: "100%" }}
                        placeholder="Chọn ngày ủy quyền"
                        format="DD/MM/YYYY"
                    />
                </Form.Item>

                {/* --- Lý do ủy quyền --- */}
                <Form.Item
                    className="delegation-table"
                    label="Lý do ủy quyền *"
                    name="reason"
                    rules={[{ required: true, message: "Vui lòng nhập lý do ủy quyền" }]}
                >
                    <Input.TextArea
                        placeholder="Nếu lý do tạo ủy quyền là do không thể tham gia bỏ phiếu trực tiếp (ốm đau, công tác xa, du học...)"
                        rows={3}
                    />
                </Form.Item>

                {/* --- Upload --- */}
                <Form.Item className="delegation-table" label="Tải lên giấy tờ chứng minh" name="upload">
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

                {/* --- Checkbox điều khoản --- */}
                <Form.Item
                    name="agreement"
                    rules={[
                        {
                            validator: (_, value) =>
                                value
                                    ? Promise.resolve()
                                    : Promise.reject(new Error("Vui lòng đồng ý với điều khoản")),
                        },
                    ]}
                >
                    <Checkbox>
                        Tôi xác nhận đã kiểm tra và đồng ý với{" "}
                        <a href="#">điều khoản ủy quyền</a>.
                    </Checkbox>
                </Form.Item>

                {/* --- Nút hành động --- */}
                <div className="delegation-form-actions">
                    <Button onClick={onBack}>Hủy bỏ</Button>
                    <Button type="primary" htmlType="submit" style={{ background: "#7ECB50", border: "none" }}>
                        Tạo người dùng và gửi yêu cầu ủy quyền
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default AuthorizationForm;
