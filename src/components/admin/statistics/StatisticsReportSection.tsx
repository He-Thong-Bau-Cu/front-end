import { Card, Button, Col, Row, Typography } from "antd";
import {
    FilePdfOutlined,
    FileExcelOutlined,
    PrinterOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    BellOutlined,
} from "@ant-design/icons";
import SystemService from "@/services/SystemService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { downloadBlob } from "@/utils/file";
import { useState } from "react";
import "../../../style/admin/Statistics.model.css";

const { Text } = Typography;

interface StatisticsReportSectionProps {
    systemLogData?: any[];
    totalSystemLog?: number;
    systemLogFilters?: any;
}

const StatisticsReportSection = ({ systemLogData, totalSystemLog, systemLogFilters }: StatisticsReportSectionProps) => {
    const [exporting, setExporting] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const handleExportExcel = async () => {
        setExporting(true);
        showLoading();
        try {
            // Loại bỏ pagination khi export (export tất cả dữ liệu theo filter)
            const exportFilters = { ...systemLogFilters };
            if (exportFilters) {
                delete exportFilters.page;
                delete exportFilters.limit;
            }
            const blob = await SystemService.exportSystemLog(exportFilters || {});
            downloadBlob(blob, `system-logs-${Date.now()}.xlsx`);
            notify("Xuất file Excel thành công", "success");
        } catch (error) {
            console.error(error);
            notify("Xuất file Excel thất bại", "error");
        } finally {
            setExporting(false);
            hideLoading();
        }
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            notify("Không thể mở cửa sổ in", "error");
            return;
        }

        const printContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Báo cáo System Logs</title>
                    <style>
                        @media print {
                            @page { margin: 1cm; }
                            body { font-family: Arial, sans-serif; }
                        }
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { text-align: center; color: #1890ff; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f0f0f0; font-weight: bold; }
                        tr:nth-child(even) { background-color: #f9f9f9; }
                        .status-success { background-color: #c6efce; }
                        .status-warning { background-color: #ffeb9c; }
                        .status-error { background-color: #ffc7ce; }
                        .header-info { margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <h1>BÁO CÁO SYSTEM LOGS</h1>
                    <div class="header-info">
                        <p><strong>Ngày xuất:</strong> ${new Date().toLocaleString("vi-VN")}</p>
                        <p><strong>Tổng số bản ghi:</strong> ${totalSystemLog || 0}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Phương thức</th>
                                <th>URL</th>
                                <th>Mã trạng thái</th>
                                <th>Địa chỉ IP</th>
                                <th>Thời gian phản hồi (ms)</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${systemLogData?.map((log, index) => {
                                const statusClass =
                                    log.statusCode >= 200 && log.statusCode < 300 ? "status-success" :
                                    log.statusCode >= 400 && log.statusCode < 500 ? "status-warning" :
                                    log.statusCode >= 500 ? "status-error" : "";
                                return `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${log.method || ""}</td>
                                        <td>${log.url || ""}</td>
                                        <td class="${statusClass}">${log.statusCode || ""}</td>
                                        <td>${log.ipAddress || ""}</td>
                                        <td>${log.responseTime || 0}</td>
                                        <td>${new Date(log.createdAt).toLocaleString("vi-VN")}</td>
                                    </tr>
                                `;
                            }).join("") || "<tr><td colspan='7'>Không có dữ liệu</td></tr>"}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

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
                                <Button
                                    type="primary"
                                    className="export-btn green"
                                    loading={exporting}
                                    onClick={handleExportExcel}
                                >
                                    Xuất Excel
                                </Button>
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
                                <Button
                                    danger
                                    className="export-btn red"
                                    onClick={handlePrint}
                                >
                                    In
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default StatisticsReportSection;
