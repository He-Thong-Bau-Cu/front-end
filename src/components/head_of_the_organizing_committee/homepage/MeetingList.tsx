import { Card, Space, Typography, Tag, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const MeetingList: React.FC = () => (
    <Card className="meeting-card" bordered={false}>
        <Space direction="vertical" style={{ width: "100%" }}>
            <div className="meeting-header">
                <div>
                    <Title level={5} style={{ margin: 0 }}>
                        Bầu cử HĐQT 2025
                    </Title>
                    <Tag color="green">Đang hoạt động</Tag>
                </div>
            </div>

            <div className="meeting-info">
                <UserOutlined />
                <Text>Nhân viên Lưu Hồng Nhật</Text>
                <Text type="secondary">• 15/3/2025</Text>
            </div>

            <Row gutter={[16, 16]} className="meeting-stats">
                <Col xs={24} sm={8}>
                    <Card bordered={false} className="meeting-subcard">
                        <Title level={4}>150</Title>
                        <Text type="secondary">Đại biểu</Text>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card bordered={false} className="meeting-subcard">
                        <Title level={4} style={{ color: "#16a34a" }}>
                            65%
                        </Title>
                        <Text type="secondary">Check-in</Text>
                    </Card>
                </Col>

                <Col xs={24} sm={8}>
                    <Card bordered={false} className="meeting-subcard">
                        <Title level={4} style={{ color: "#2563eb" }}>
                            45%
                        </Title>
                        <Text type="secondary">Bỏ phiếu</Text>
                    </Card>
                </Col>
            </Row>

            <Card className="meeting-alert" bordered={false}>
                <Text>⚠️ 2 vấn đề cần xử lý</Text>
            </Card>
        </Space>
    </Card>
);

export default MeetingList;
