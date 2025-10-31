import React, { useState } from "react";
import { Card, Row, Col, Layout } from "antd";
import DelegateTable from "@/components/organizing-committee/manage-delegates/DelegateTable";
import DelegateSearch from "@/components/organizing-committee/manage-delegates/DelegateSearch";
import DelegateManualAdd from "@/components/organizing-committee/manage-delegates/DelegateManualAdd";
import DelegateUpload from "@/components/organizing-committee/manage-delegates/DelegateUpload";


const initialDelegates = [
    {
        id: "NV0078",
        name: "Nguyễn Thị Lan Anh",
        code: "NV0078",
        email: "lan.anh@example.com",
        unit: "Phòng Kinh doanh",
        role: "Đại biểu",
    },
    {
        id: "NV0015",
        name: "Trần Minh Hoàng",
        code: "NV0015",
        email: "minh.hoang@example.com",
        unit: "Cổ đông",
        role: "Cổ đông",
    },
    {
        id: "NV0023",
        name: "Lê Gia Bảo",
        code: "NV0023",
        email: "gia.bao@example.com",
        unit: "Phòng Kỹ thuật",
        role: "Đại biểu",
    },
];

const ManagementDelegates: React.FC = () => {
    const [delegates, setDelegates] = useState(initialDelegates);
    const [search, setSearch] = useState("");

    const filteredDelegates = delegates.filter(
        (d) =>
            d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.code.toLowerCase().includes(search.toLowerCase()) ||
            d.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout style={{ background: "#F3F8F3", minHeight: "100vh", padding: "20px" }}>
            <Card className="manage-container" style={{ borderRadius: 12 }}>
                <h2>Quản lý Danh sách Đại biểu & Cổ đông</h2>
                <p>Thêm mới, nhập và quản lý danh sách người tham dự cho sự kiện của bạn.</p>

                <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
                    <Col xs={24} md={14}>
                        <DelegateUpload />
                    </Col>
                    <Col xs={24} md={10}>
                        <DelegateManualAdd onAdd={(newDelegate) => setDelegates([...delegates, newDelegate])} />
                    </Col>
                </Row>

                <div style={{ marginTop: 32 }}>
                    <DelegateSearch value={search} onChange={setSearch} />
                    <DelegateTable data={filteredDelegates} />
                </div>
            </Card>
        </Layout>
    );
};

export default ManagementDelegates;
