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
    Avatar,
    Descriptions,
} from "antd";
import { User } from "@/types/User.interface";

const { Text, Title } = Typography;
const { Option } = Select;

interface AuthorizationRequestFormProps {
    selectedUser: User;
    onBack: () => void;
}

const AuthorizationRequestForm = ({ selectedUser, onBack }: AuthorizationRequestFormProps) => {
    const [form] = Form.useForm();

    interface AuthorizationRequestValues {
        relation: string;
        authorizationDate: unknown;
        reason: string;
        upload?: unknown;
        agreement: boolean;
    }

    const handleSubmit = (values: AuthorizationRequestValues) => {
        console.log("Authorization request:", values);
        // TODO: Call API to submit authorization request
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
            {/* Thông tin người được ủy quyền */}
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
                        <Descriptions.Item label="CCCD/CMND">
                            {selectedUser.citizenId}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số điện thoại">
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

            {/* Form ủy quyền */}
            <Form 
                form={form}
                layout="vertical" 
                onFinish={handleSubmit}
            >
                {/* Quan hệ và Ngày ủy quyền */}
                <Row gutter={16}>
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
                    <Col xs={24} md={12}>
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
                    </Col>
                </Row>

                {/* Lý do ủy quyền */}
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

                {/* Upload */}
                <Form.Item
                    className="delegation-table"
                    label="Tải lên giấy tờ chứng minh"
                    name="upload"
                >
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

                {/* Checkbox điều khoản */}
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

                {/* Nút hành động */}
                <div className="delegation-form-actions">
                    <Button onClick={onBack}>Hủy bỏ</Button>
                    <Button type="primary" htmlType="submit" style={{ background: "#7ECB50", border: "none" }}>
                        Gửi yêu cầu ủy quyền
                    </Button>
                </div>
            </Form>
        </Card>
    );
};

export default AuthorizationRequestForm;

