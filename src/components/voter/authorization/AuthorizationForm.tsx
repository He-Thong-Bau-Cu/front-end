import { UploadOutlined } from "@ant-design/icons";
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
} from "antd";

const { Text } = Typography;
const { Option } = Select;

const AuthorizationForm = () => (
    <Card className="delegation-form-card" title={<Text style={{ paddingLeft: 20, fontWeight: 'bold', fontSize: 18 }}>📝 Tạo ủy quyền mới</Text>}>
        <Form layout="vertical">
            {/* --- Dòng 1: Họ tên & CCCD --- */}
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item className="delegation-table" label="Họ và tên người được ủy quyền *" name="name">
                        <Input className="delegation-input" placeholder="Nhập họ tên đầy đủ" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item className="delegation-table" label="CCCD/CMND *" name="cccd">
                        <Input className="delegation-input" placeholder="Số CCCD/CMND" />
                    </Form.Item>
                </Col>
            </Row>

            {/* --- Dòng 2: SĐT & Email --- */}
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item className="delegation-table" label="Số điện thoại *" name="phone">
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
                    <Form.Item className="delegation-table" label="Ngày sinh *" name="dob">
                        <DatePicker className="delegation-input" style={{ width: "100%" }} placeholder="mm/dd/yyyy" />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item className="delegation-table" label="Quan hệ với bạn *" name="relation">
                        <Select className="delegation-input" placeholder="Chọn quan hệ">
                            <Option value="ban">Bạn</Option>
                            <Option value="dongnghiep">Đồng nghiệp</Option>
                            <Option value="nguoi_than">Người thân</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            {/* --- Địa chỉ --- */}
            <Form.Item className="delegation-table" label="Địa chỉ người được ủy quyền" name="address">
                <Input className="delegation-input" placeholder="Địa chỉ đầy đủ" />
            </Form.Item>

            {/* --- Lý do ủy quyền --- */}
            <Form.Item className="delegation-table" label="Lý do ủy quyền" name="reason">
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
            <Form.Item>
                <Checkbox>
                    Tôi xác nhận đã kiểm tra và đồng ý với{" "}
                    <a href="#">điều khoản ủy quyền</a>.
                </Checkbox>
            </Form.Item>

            {/* --- Nút hành động --- */}
            <div className="delegation-form-actions">
                <Button>Hủy bỏ</Button>
                <Button type="primary" style={{ background: "#7ECB50", border: "none" }}>
                    Gửi yêu cầu ủy quyền
                </Button>
            </div>
        </Form>
    </Card>
);

export default AuthorizationForm;
