import DelegateDetail from "@/components/organizing-committee/verify-delegates/DelegateDetail";
import DelegateList from "@/components/organizing-committee/verify-delegates/DelegateList";
import { Card, Col, Layout, Row } from "antd";
import '../../style/organizing-committee/VerifyDelegates.model.css'
import { useState } from "react";



const delegates = [
    {
        id: "NV0078",
        name: "Nguyễn Thị Lan Anh",
        code: "NV0078",
        unit: "Phòng Kinh doanh",
        email: "lan.anh@example.com",
        type: "Đại biểu chính thức",
        status: "CHƯA CHECK-IN",
    },
    {
        id: "NV0015",
        name: "Trần Minh Hoàng",
        code: "NV0015",
        unit: "Phòng Nhân sự",
        email: "minh.hoang@example.com",
        type: "Đại biểu khách mời",
        status: "ĐÃ CHECK-IN",
    },
    {
        id: "NV0050",
        name: "Phạm Thị Thu",
        code: "NV0050",
        unit: "Phòng Marketing",
        email: "thu.pham@example.com",
        type: "Đại biểu chính thức",
        status: "CHƯA CHECK-IN",
    },
];

const VerifyDelegates: React.FC = () => {
    const [selected, setSelected] = useState(delegates[0]);

    return (
        <div >
            <Layout className="verify-layout-1">
                <Card className="verify-container-1">
                    <Row gutter={[24, 24]}>
                        {/* Danh sách đại biểu */}
                        <Col xs={24} md={8}>
                            <DelegateList
                                delegates={delegates}
                                selectedId={selected.id}
                                onSelect={(d) => setSelected(d)}
                            />
                        </Col>

                        {/* Chi tiết đại biểu */}
                        <Col xs={24} md={16}>
                            <DelegateDetail delegate={selected} />
                        </Col>
                    </Row>
                </Card>
            </Layout>
        </div>
    );
};

export default VerifyDelegates;
