import { Button, Card, Col, Input, Row, Select, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "../../../style/admin/Statistics.model.css";

const { Text } = Typography;
const { Option } = Select;

const StatisticsFilterBar = () => {
    return (
        <Card className="statistics-filter-card">
            <Row gutter={16} align="middle">
                <Col xs={24} md={8}>
                    <div className="statistics-filter-group">
                        <Text className="statistics-filter-label">Khoảng thời gian</Text>
                        <Input placeholder="7 ngày qua" className="statistics-filter-input" />
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <div className="statistics-filter-group">
                        <Text className="statistics-filter-label">Trạng thái</Text>
                        <Select defaultValue="Tất cả" className="statistics-filter-select">
                            <Option value="all">Tất cả</Option>
                            <Option value="active">Đang diễn ra</Option>
                            <Option value="completed">Đã hoàn thành</Option>
                            <Option value="upcoming">Sắp diễn ra</Option>
                        </Select>
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        className="statistics-filter-btn"
                    >
                        Lọc dữ liệu
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default StatisticsFilterBar;
