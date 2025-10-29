import React, { useState, useMemo } from "react";
import {
    Button,
    Input,
    Tabs,
    Typography,
    Space,
    Row,
    Col,
    Select,
    Empty,
    message
} from "antd";
import {
    CheckCircleOutlined,
    FileDoneOutlined,
    BarChartOutlined,
    HistoryOutlined,
    UserOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import BallotCard from "@/components/voter/BallotCard";
import "../../style/voter/BallotList.model.css";

const { Title, Text } = Typography;

// 🔧 Hàm xóa dấu tiếng Việt (dùng chung)
const removeVietnameseTones = (str = "") =>
    str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

export default function BallotList() {
    const navigate = useNavigate();

    // ---------------------- DỮ LIỆU ----------------------
    const allBallots = [
         {
            id: 1,
            title: "Bầu cử Đại biểu Quốc hội Khóa XVI",
            desc: "Bầu chọn đại diện cho khu vực bầu cử số 1, Quận 1, TP. Hồ Chí Minh. Tổng cộng 5 ứng cử viên tham gia.",
            endTime: "15/12/2024 - 17:00",
            status: "Đang diễn ra",
            type: 2,
        },
        {
            id: 1,
            title: "Bầu cử Đại biểu Quốc hội Khóa XVI",
            desc: "Bầu chọn đại diện cho khu vực bầu cử số 1, Quận 1, TP. Hồ Chí Minh. Tổng cộng 5 ứng cử viên tham gia.",
            endTime: "15/12/2024 - 17:00",
            status: "Đang diễn ra",
            type: 1,
        },
        {
            id: 2,
            title: "Biểu quyết Nghị quyết cổ đông 2025",
            desc: "Thông qua kế hoạch hoạt động và tài chính năm 2025.",
            endTime: "10/01/2025 - 17:00",
            status: "Chưa bắt đầu",
            type: 1,
        },
        {
            id: 3,
            title: "Bầu chọn Ban Kiểm soát nhiệm kỳ 2025-2030",
            desc: "Cuộc bầu chọn thành viên Ban kiểm soát mới.",
            endTime: "30/01/2025 - 17:00",
            status: "Đã kết thúc",
            type: 1,
        },
    ];

    // ---------------------- STATE ----------------------
    const [searchText, setSearchText] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [activeTab, setActiveTab] = useState("1");

    // ---------------------- LỌC DỮ LIỆU ----------------------
    const filteredBallots = useMemo(() => {
        const search = removeVietnameseTones(searchText.toLowerCase());
        return allBallots.filter((b) => {
            const title = removeVietnameseTones(b.title.toLowerCase());
            const desc = removeVietnameseTones(b.desc.toLowerCase());
            const matchText = title.includes(search) || desc.includes(search);
            const matchType =
                activeTab === "1"
                    ? true
                    : activeTab === "3"
                        ? b.type === 1
                        : b.type === 2;
            const matchStatus =
                filterStatus === "all" ? true : b.status === filterStatus;
            return matchText && matchStatus && matchType;
        });
    }, [searchText, filterStatus, activeTab, allBallots]);

    // ---------------------- DANH SÁCH TAB ----------------------
    const tabItems = [
        { key: "1", label: "Tất cả phiếu bầu", icon: <CheckCircleOutlined /> },
        { key: "2", label: "Bầu cử dồn phiếu", icon: <FileDoneOutlined /> },
        { key: "3", label: "Biểu quyết nghị quyết", icon: <BarChartOutlined /> },
    ];

    // ---------------------- XỬ LÝ KHI CLICK CARD ----------------------
    const handleCardClick = (ballot) => {
       if (ballot.status === "Đang diễn ra" && ballot.type === 1) navigate("/voter/ballot_resolution_voting");
    else if (ballot.status === "Đang diễn ra" && ballot.type === 2) navigate("/voter/ballot_cumulative_voting");
    else message.warning("Phiếu này chưa mở hoặc đã kết thúc.");
    };
   
 
    // ---------------------- RENDER ----------------------
    return (
        <div className="ballot-page">
            {/* 🔹 Header */}
            <div className="header-container">
                <div>
                    <Title level={3} style={{ margin: 0 }}>
                        Danh sách Phiếu Bầu
                    </Title>
                    <Text style={{ color: "#666" }}>
                        Tham gia bỏ phiếu và theo dõi các cuộc bầu cử đang diễn ra
                    </Text>
                </div>

                <Space>
                    <Button icon={<HistoryOutlined />}>Lịch sử bỏ phiếu</Button>
                    <Button
                        type="primary"
                        icon={<UserOutlined />}
                        style={{
                            background: "#7cb342",
                            borderColor: "#7cb342",
                            fontWeight: 500,
                        }}
                    >
                        Hồ sơ cá nhân
                    </Button>
                </Space>
            </div>

            {/* 🔹 Tabs */}
            <div className="tabs-container">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems.map((t) => ({
                        key: t.key,
                        label: (
                            <span>
                                {t.icon}
                                {t.label}
                            </span>
                        ),
                    }))}
                />
            </div>

            {/* 🔹 Bộ lọc & danh sách phiếu */}
            <div className="ballot-wrapper">
                {/* Bộ lọc */}
                <div className="search-row">
                    <Input
                        placeholder="Tìm kiếm phiếu bầu..."
                        prefix={<SearchOutlined style={{ color: "#aaa" }} />}
                        style={{ borderRadius: 8, height: 40, flex: 1 }}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                    <Select
                        value={filterStatus}
                        onChange={setFilterStatus}
                        style={{ width: 200, marginLeft: 10 }}
                        size="large"
                        options={[
                            { value: "all", label: "Tất cả cấp độ" },
                            { value: "Đang diễn ra", label: "Đang diễn ra" },
                            { value: "Chưa bắt đầu", label: "Chưa bắt đầu" },
                            { value: "Đã kết thúc", label: "Đã kết thúc" },
                        ]}
                    />
                </div>

                {/* Danh sách phiếu */}
                {filteredBallots.length > 0 ? (
                    <Row gutter={[24, 24]} className="ballot-grid">
                        {filteredBallots.map((b) => (
                            <Col
                                key={b.id}
                                xs={24}
                                sm={24}
                                md={12}
                                lg={8}
                                xl={8}
                                xxl={6}
                            >
                                <div className="ballot-card-wrapper">
                                    <BallotCard ballot={b} onClick={() => handleCardClick(b)} />
                                </div>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <div className="no-result">
                        <Empty
                            description={
                                <Text type="secondary">
                                    Không tìm thấy phiếu bầu phù hợp.
                                </Text>
                            }
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
