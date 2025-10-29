import React, { useState } from "react";
import { FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Input, Row, Tag, Typography } from "antd";

const { Text } = Typography;

interface VotingResult {
    title: string;
    description: string;
    date: string;
    location: string;
    totalVotes: number;
    participation: string;
    candidates: number;
}

const elections: VotingResult[] = [
    {
        title: "Bầu cử Đại biểu Quốc hội Khóa XVI",
        description: "Bầu chọn đại biểu cho khu vực bầu cử số 1, Quận 1, TP. Hồ Chí Minh.",
        date: "15/12/2024 - 17:00",
        location: "Quận 1, TP. Hồ Chí Minh",
        totalVotes: 15234,
        participation: "89.2%",
        candidates: 5,
    },
    {
        title: "Bầu cử Hội đồng Nhân dân Thành phố",
        description: "Bầu chọn hội đồng nhân dân TP. Hồ Chí Minh nhiệm kỳ 2021-2026.",
        date: "28/06/2024 - 17:00",
        location: "TP. Hồ Chí Minh",
        totalVotes: 45678,
        participation: "92.5%",
        candidates: 12,
    },
    {
        title: "Biểu quyết Dự án Hạ tầng Giao thông",
        description:
            "Trưng cầu ý kiến nhân dân về dự án xây dựng đường vành đai 3 khu vực phía Đông TP.HCM.",
        date: "20/09/2024 - 17:00",
        location: "TP. Hồ Chí Minh",
        totalVotes: 32510,
        participation: "87.6%",
        candidates: 0,
    },
];

const normalizeText = (text: string): string =>
    text
        .normalize("NFD")                // tách ký tự và dấu
        .replace(/[\u0300-\u036f]/g, "") // xóa toàn bộ dấu tổ hợp
        .replace(/đ/g, "d")              // chuyển đ → d
        .replace(/Đ/g, "D")              // chuyển Đ → D
        .toLowerCase()
        .trim();


const VotingResultList: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Lọc dữ liệu bỏ dấu + không phân biệt hoa thường
    const filteredResults = elections.filter((e) => {
        const term = normalizeText(searchTerm);
        return (
            normalizeText(e.title).includes(term) ||
            normalizeText(e.description).includes(term) ||
            normalizeText(e.date).includes(term) ||
            normalizeText(e.location).includes(term)
        );
    });


    return (
        <Card className="voting-result-list-card">
            {/* --- Thanh tìm kiếm --- */}
            <div className="voting-result-toolbar">
                <Input
                    placeholder="Tìm kiếm cuộc bầu cử"
                    prefix={<SearchOutlined />}
                    className="voting-result-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button className="voting-result-filter-btn">Tất cả cấp độ</Button>
            </div>

            {/* --- Danh sách kết quả --- */}
            <Row gutter={[24, 24]} className="voting-result-cards">
                {filteredResults.length > 0 ? (
                    filteredResults.map((e, i) => (
                        <Col xs={24} sm={12} md={8} key={i}>
                            <Card
                                hoverable
                                className="voting-result-card"
                                title={
                                    <div className="voting-result-card-header">
                                        <FileTextOutlined className="voting-result-icon" />
                                        <Tag style={{ marginRight: 30 }} color="green">Đã công bố</Tag>
                                    </div>
                                }
                            >
                                <Text strong className="voting-result-title">
                                    {e.title}
                                </Text>
                                <p className="voting-result-description">{e.description}</p>
                                <div className="voting-result-info">
                                    <p>📅 Kết thúc: {e.date}</p>
                                    <p>📍 {e.location}</p>
                                </div>
                                <div className="voting-result-stats">
                                    <div>
                                        <Text strong style={{ color: "#27ae60" }}>{e.totalVotes}</Text>
                                        <p>Tổng phiếu</p>
                                    </div>
                                    <div>
                                        <Text strong style={{ color: "#2ecc71" }}>{e.participation}</Text>
                                        <p>Tham gia</p>
                                    </div>
                                    <div>
                                        <Text strong style={{ color: "#27ae60" }}>{e.candidates}</Text>
                                        <p>Ứng viên</p>
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24}>
                        <div className="voting-result-empty">
                            <p>Không tìm thấy kết quả phù hợp.</p>
                        </div>
                    </Col>
                )}
            </Row>
        </Card>
    );
};

export default VotingResultList;
