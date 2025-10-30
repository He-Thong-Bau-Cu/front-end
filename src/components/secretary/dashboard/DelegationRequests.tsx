import { Card, Table, Tag } from "antd";

const columns = [
    { title: "SỐ QUYẾT ĐỊNH", dataIndex: "code" },
    { title: "TÊN YÊU CẦU", dataIndex: "name" },
    { title: "NGÀY GỬI", dataIndex: "date" },
    {
        title: "TRẠNG THÁI",
        dataIndex: "status",
        render: (status: string) => {
            const color =
                status === "Chờ duyệt"
                    ? "orange"
                    : status === "Đã duyệt"
                        ? "green"
                        : "red";
            return <Tag color={color}>{status}</Tag>;
        },
    },
];

const data = [
    {
        code: "UQ-002/2025",
        name: "Báo cáo kỳ bầu cử quý 9",
        date: "07/10/2025",
        status: "Chờ duyệt",
    },
    {
        code: "UQ-001/2025",
        name: "Tổng hợp ủy quyền cuộc họp BCH lần 1",
        date: "08/10/2025",
        status: "Chờ duyệt",
    },
    {
        code: "UQ-003/2025",
        name: "Ủy quyền tham dự Đại hội Cổ đông",
        date: "06/10/2025",
        status: "Đã duyệt",
    },
    {
        code: "UQ-004/2025",
        name: "Phiếu ủy quyền bầu cử Ban Kiểm Soát",
        date: "05/10/2025",
        status: "Từ chối",
    },
];

const DelegationRequests = () => (
    <Card
        className="delegation-card"
        title={<span className="delegation-title">📄 Yêu cầu ủy quyền của tôi</span>}
    >
        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            rowKey="code"
            className="delegation-table"
        />
    </Card>
);

export default DelegationRequests;
