import React from "react";
import {
    Card,
    Input,
    Table,
    Tag,
    Button,
    Space,
    Checkbox,
    TableProps,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons";

interface AuthorizationRecord {
    key: number;
    code: string;
    name: string;
    creator: string;
    date: string;
    status: "Chờ duyệt" | "Đã duyệt" | "Từ chối";
}

const data: AuthorizationRecord[] = [
    {
        key: 1,
        code: "UQ-001/2025",
        name: "Tổng hợp ủy quyền cuộc họp BCH lần 1",
        creator: "Nguyễn Văn A",
        date: "08/10/2025",
        status: "Chờ duyệt",
    },
    {
        key: 2,
        code: "UQ-002/2025",
        name: "Báo cáo ủy quyền biểu quyết tháng 9",
        creator: "Trần Thị B",
        date: "07/10/2025",
        status: "Chờ duyệt",
    },
    {
        key: 3,
        code: "UQ-003/2025",
        name: "Ủy quyền tham dự Đại hội Cổ đông",
        creator: "Lê Văn C",
        date: "06/10/2025",
        status: "Đã duyệt",
    },
    {
        key: 4,
        code: "UQ-004/2025",
        name: "Phiếu ủy quyền bầu cử Ban Kiểm Soát",
        creator: "Phạm Thị D",
        date: "05/10/2025",
        status: "Từ chối",
    },
];

const columns: TableProps<AuthorizationRecord>["columns"] = [
    {
        title: "",
        dataIndex: "checkbox",
        render: () => <Checkbox />,
        width: 40,
    },
    { title: "SỐ QUYẾT ĐỊNH", dataIndex: "code" },
    { title: "TÊN CUỘC ỦY QUYỀN", dataIndex: "name" },
    { title: "NGƯỜI TẠO", dataIndex: "creator" },
    { title: "NGÀY TẠO", dataIndex: "date" },
    {
        title: "TRẠNG THÁI",
        dataIndex: "status",
        render: (status: AuthorizationRecord["status"]) => {
            const color =
                status === "Đã duyệt"
                    ? "green"
                    : status === "Chờ duyệt"
                        ? "orange"
                        : "red";
            return <Tag color={color}>{status}</Tag>;
        },
    },
    {
        title: "THAO TÁC",
        render: () => (
            <Space>
                <Button icon={<EyeOutlined />} size="small" />
                <Button
                    icon={<CheckOutlined />}
                    size="small"
                    style={{ color: "#fff", background: "#7ECB50", border: "none" }}
                />
                <Button danger icon={<CloseOutlined />} size="small" />
            </Space>
        ),
    },
];

const AuthorizationTable: React.FC = () => (
    <Card className="authorization-table-card">
        <Input
            placeholder="Tìm kiếm theo số quyết định, tên cuộc..."
            prefix={<SearchOutlined />}
            className="authorization-search"
        />
        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            style={{ marginTop: 16 }}
        />
    </Card>
);

export default AuthorizationTable;
