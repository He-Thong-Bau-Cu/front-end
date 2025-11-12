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
                            <div className="left">
                                <FilePdfOutlined className="export-icon pdf" />
                                <Text style={{ marginLeft: 15 }} strong>Tải báo cáo PDF</Text>
                            </div>
                            <div className="right">
                                <Button type="default" className="export-btn">Xuất PDF</Button>
                            </div>
                        </div>


                    </Col>

                    <Col xs={24} md={8}>

                        <div className="statistics-export-item">
                            <div className="left">
                                <FileExcelOutlined className="export-icon excel" />
                                <Text style={{ marginLeft: 15 }} strong>Xuất Excel</Text>
                            </div>
                            <div className="right">
                                <Button type="primary" className="export-btn green">Xuất PDF</Button>
                            </div>
                        </div>

                    </Col>

                    <Col xs={24} md={8}>

                        <div className="statistics-export-item">
                            <div className="left">
                                <PrinterOutlined className="export-icon print" />
                                <Text style={{ marginLeft: 15 }} strong>In báo cáo</Text>
                            </div>
                            <div className="right">
                                <Button danger className="export-btn red">In</Button>
                            </div>
                        </div>

                    </Col>
                </Row>
            </Card>


        </div >
    );
};

export default StatisticsReportSection;
