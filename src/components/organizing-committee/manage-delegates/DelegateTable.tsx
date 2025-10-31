import React from "react";
import { Table, Button, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

interface Delegate {
    id: string;
    name: string;
    code: string;
    email: string;
    unit: string;
    role: string;
}

interface Props {
    data: Delegate[];
}

const DelegateTable: React.FC<Props> = ({ data }) => {
    const columns = [
        { title: "Họ và Tên", dataIndex: "name", key: "name" },
        { title: "Mã định danh", dataIndex: "code", key: "code" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Đơn vị / Nhóm", dataIndex: "unit", key: "unit" },
        { title: "Vai trò", dataIndex: "role", key: "role" },
        {
            title: "Hành động",
            key: "action",
            render: () => (
                <Space>
                    <Button icon={<EditOutlined />} size="small" />
                    <Button danger icon={<DeleteOutlined />} size="small" />
                </Space>
            ),
        },
    ];

    return (
        <Table
            rowKey="id"
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered
            style={{ borderRadius: 12 }}
        />
    );
};

export default DelegateTable;
