import { Card, Button, Col, Row, Typography } from "antd";
import {
    FilePdfOutlined,
    FileExcelOutlined,
    PrinterOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    BellOutlined,
} from "@ant-design/icons";
import "../../../style/admin/Statistics.model.css";

const { Text } = Typography;

const StatisticsReportSection = () => {
    return (
        <div className="statistics-report-section">

            {/* --- Xuất dữ liệu & Báo cáo --- */}
            <Card className="statistics-export-card">
                <Text strong className="statistics-export-title">
                    📤 Xuất dữ liệu & Báo cáo
                </Text>

                <Row gutter={16} style={{ marginTop: 20 }}>
                    <Col xs={24} md={8}>
                        <div className="statistics-export-item">
                            <div style={{ flex: 1 }}>
                                <FilePdfOutlined className="export-icon pdf" />
                                <Text style={{ marginLeft: 15 }} strong>Tải báo cáo PDF</Text>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Button type="default" className="export-btn">
                                    Xuất PDF
                                </Button>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={8}>
                        <div className="statistics-export-item">
                            <div style={{ flex: 1 }}>
                                <FileExcelOutlined className="export-icon excel" />
                                <Text style={{ marginLeft: 15 }} strong>Xuất Excel</Text>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Button type="primary" className="export-btn green">
                                    Xuất Excel
                                </Button>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={8}>
                        <div className="statistics-export-item">
                            <div style={{ flex: 1 }}>
                                <PrinterOutlined className="export-icon print" />
                                <Text style={{ marginLeft: 15 }} strong>In báo cáo</Text>
                            </div>
                            <div style={{ flex: 1 }}>
                                <Button danger className="export-btn red">
                                    In
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* --- 3 ô nhỏ cuối --- */}
            <Row gutter={24} className="statistics-bottom-row">
                <Col xs={24} md={8}>
                    <Card className="statistics-mini-card">
                        <div className="statistics-mini-header">
                            <TrophyOutlined className="mini-icon gold" />
                            <div>
                                <Text strong>Ứng viên dẫn đầu</Text>
                                <div>
                                    <Text type="secondary">Top 3 ứng viên có nhiều phiếu nhất</Text>
                                </div>
                            </div>
                        </div>
                        <ul className="statistics-mini-list">
                            <li>Nguyễn A <span>4,120</span></li>
                            <li>Trần B <span>3,875</span></li>
                            <li>Lê C <span>3,410</span></li>
                        </ul>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card className="statistics-mini-card">
                        <div className="statistics-mini-header">
                            <ClockCircleOutlined className="mini-icon gray" />
                            <div>
                                <Text strong>Hoạt động gần đây</Text>
                                <div>
                                    <Text type="secondary">Sự kiện và log hệ thống</Text>
                                </div>
                            </div>
                        </div>
                        <ul className="statistics-mini-list">
                            <li>Người dùng đăng nhập <span>1,247</span></li>
                            <li>Phiếu mới / 1h <span>156</span></li>
                            <li>Lỗi xử lý <span>2</span></li>
                        </ul>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card className="statistics-mini-card">
                        <div className="statistics-mini-header">
                            <BellOutlined className="mini-icon yellow" />
                            <div>
                                <Text strong>Cảnh báo & Gợi ý</Text>
                                <div>
                                    <Text type="secondary">Những mục cần chú ý</Text>
                                </div>
                            </div>
                        </div>
                        <ul className="statistics-mini-list">
                            <li>Phiếu chưa xác thực <span>24</span></li>
                            <li>Phiên sắp hết hạn <span>3</span></li>
                            <li>Cập nhật thành công <span>98%</span></li>
                        </ul>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StatisticsReportSection;
