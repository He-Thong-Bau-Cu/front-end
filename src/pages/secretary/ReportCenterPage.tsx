import React from "react";
import { Row, Col, Card } from "antd";
import ReportFilters from "../../components/secretary/report-center/ReportFilters";
import ReportStatsCards from "../../components/secretary/report-center/ReportStatsCards";
import ReportCharts from "../../components/secretary/report-center/ReportCharts";
import ReportFavorites from "../../components/secretary/report-center/ReportFavorites";
import ReportRecent from "../../components/secretary/report-center/ReportRecent";
import "../../style/secretary/ReportCenter.model.css";

export default function ReportCenterPage() {
    const stats = [
        { title: "Tỷ lệ tham gia tổng thể", value: "81.5%" },
        { title: "Bầu cử đang hoạt động", value: 3 },
        { title: "Báo cáo đã tạo", value: 128 },
        { title: "Báo cáo định kỳ", value: 4 },
    ];

    const favorites = [
        { id: "1", title: "Tổng kết HĐQT", frequency: "Tạo hàng tuần" },
        { id: "2", title: "Tỷ lệ tham gia", frequency: "Tạo hàng tháng" },
    ];

    const recents = [
        {
            id: "1",
            name: "Danh sách cử tri không tham gia BKS 2025.pdf",
            createdBy: "Nguyễn Văn A",
            timeAgo: "15 phút trước",
        },
        {
            id: "2",
            name: "Phan_tich_ket_qua_tin_nhiem.xlsx",
            createdBy: "Hệ thống",
            timeAgo: "2 giờ trước",
        },
    ];
    const lineData = [
        { month: "Th1", value: 30 },
        { month: "Th2", value: 42 },
        { month: "Th3", value: 58 },
        { month: "Th4", value: 65 },
        { month: "Th5", value: 74 },
        { month: "Th6", value: 68 },
        { month: "Th7", value: 80 },
    ];

    const pieData = [
        { type: "Kết quả", value: 40 },
        { type: "Cử tri", value: 35 },
        { type: "Hệ thống", value: 25 },
    ];

    const barData = [
        { category: "HĐQT", value: 75 },
        { category: "BKS", value: 60 },
        { category: "Tín nhiệm", value: 90 },
        { category: "ĐH Cổ đông", value: 50 },
    ];

    return (
        <div className="rc-page">
            <div className="rc-header">
                <h2 className="rc-title">Trung tâm Báo cáo</h2>
                <button className="rc-create-btn">+ Tạo Báo cáo mới</button>
            </div>

            <ReportFilters />
            <ReportStatsCards stats={stats} />

            <Row gutter={[20, 20]} className="rc-main" align="top">
                {/* Cột trái */}
                <Col xs={24} lg={16} className="rc-column">
                    <div className="rc-section">
                        <Card className="rc-card chart-card">
                            <div className="rc-chart-header">
                                <h3 className="rc-subtitle">Lịch sử tạo báo cáo (tháng)</h3>
                                <span className="rc-more">•••</span>
                            </div>
                            <ReportCharts type="line" data={lineData} />
                        </Card>
                    </div>

                    <div className="rc-section">
                        <Row gutter={[16, 16]}>
                            <Col xs={24} md={12}>
                                <Card className="rc-card chart-card">
                                    <div className="rc-chart-header">
                                        <h3 className="rc-subtitle">So sánh tỷ lệ tham gia</h3>
                                        <span className="rc-more">•••</span>
                                    </div>
                                    <ReportCharts type="bar" data={barData} />
                                </Card>
                            </Col>
                            <Col xs={24} md={12}>
                                <ReportFavorites favorites={favorites} />
                            </Col>
                        </Row>
                    </div>

                    <div className="rc-section">
                        <ReportRecent recents={recents} />
                    </div>
                </Col>

                {/* Cột phải */}
                <Col xs={24} lg={8} className="rc-column">
                    <div className="rc-section">
                        <Card className="rc-card chart-card">
                            <div className="rc-chart-header">
                                <h3 className="rc-subtitle">Phân loại báo cáo</h3>
                                <span className="rc-more">•••</span>
                            </div>
                            <ReportCharts type="pie" data={pieData} />
                        </Card>
                    </div>
                </Col>
            </Row>


        </div>
    );
}
