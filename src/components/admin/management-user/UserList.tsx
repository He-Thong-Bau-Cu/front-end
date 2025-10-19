import { Button, Input, Select, Table, Tag, Space, Pagination, Tooltip } from "antd";
import {
    PlusOutlined,
    FileExcelOutlined,
    BarChartOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
} from "@ant-design/icons";
import React, { useState } from "react";

const { Option } = Select;

const UserList = () => {
    const [page, setPage] = useState(1);

    const users = [
        {
            key: "1",
            name: "Nguyễn Văn An",
            email: "nguyen.van.an@company.com",
            role: "Q",
            department: "IT",
            status: "Hoạt động",
            lastLogin: "28/09/2024 10:30",
            color: "#1677ff",
        },
        {
            key: "2",
            name: "Trần Thị Bình",
            email: "tran.thi.binh@company.com",
            role: "Voter",
            department: "Marketing",
            status: "Hoạt động",
            lastLogin: "27/09/2024 14:15",
            color: "#f56a00",
        },
        {
            key: "3",
            name: "Lê Minh Cường",
            email: "le.minh.cuong@company.com",
            role: "Nhân viên",
            department: "Sales",
            status: "Chờ xác thực",
            lastLogin: "26/09/2024 09:45",
            color: "#fadb14",
        },
        {
            key: "4",
            name: "Phạm Thu Hương",
            email: "pham.thu.huong@company.com",
            role: "Voter",
            department: "HR",
            status: "Hoạt động",
            lastLogin: "28/09/2024 08:20",
            color: "#722ed1",
        },
        {
            key: "5",
            name: "Vũ Đình Nam",
            email: "vu.dinh.nam@company.com",
            role: "Voter",
            department: "IT",
            status: "Không hoạt động",
            lastLogin: "20/09/2024 16:30",
            color: "#13c2c2",
        },
    ];

    const columns = [
        {
            title: "Người dùng",
            dataIndex: "name",
            key: "name",
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            backgroundColor: record.color,
                            color: "#fff",
                            borderRadius: "50%",
                            width: 40,
                            height: 40,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontWeight: 600,
                            fontSize: 16,
                        }}
                    >
                        {record.name.charAt(0)}
                    </div>
                    <div>
                        <div style={{ fontWeight: 600 }}>{record.name}</div>
                        <div style={{ color: "#666", fontSize: 13 }}>{record.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "role",
            key: "role",
            render: (text) => (
                <Tag
                    color={
                        text === "Q"
                            ? "red"
                            : text === "Nhân viên"
                                ? "orange"
                                : text === "Voter"
                                    ? "blue"
                                    : "default"
                    }
                    style={{
                        borderRadius: 16,
                        fontWeight: 500,
                        textTransform: "capitalize",
                    }}
                >
                    {text}
                </Tag>
            ),
        },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color =
                    status === "Hoạt động"
                        ? "green"
                        : status === "Chờ xác thực"
                            ? "gold"
                            : "red";
                return (
                    <Tag
                        color={color}
                        style={{
                            borderRadius: 16,
                            fontWeight: 500,
                            textTransform: "capitalize",
                        }}
                    >
                        {status}
                    </Tag>
                );
            },
        },
        {
            title: "Lần cuối đăng nhập",
            dataIndex: "lastLogin",
            key: "lastLogin",
            render: (text) => <span style={{ color: "#333" }}>{text}</span>,
        },
        {
            title: "Thao tác",
            key: "actions",
            render: () => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="primary"
                            shape="circle"
                            icon={<EditOutlined />}
                            size="small"
                        />
                    </Tooltip>
                    <Tooltip title="Xóa">
                        <Button
                            type="primary"
                            danger
                            shape="circle"
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div
            style={{
                padding: "24px 32px",
                minHeight: "75vh",
                margin: '15px 32px',
                borderRadius: '16px',
                backgroundColor: "#FFF",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 20,
                }}
            >
                <h2 style={{ fontWeight: 700, fontSize: 20, display: "flex", alignItems: "center" }}>
                    📋 Danh sách người dùng
                </h2>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{
                            background: "linear-gradient(90deg, #34d399, #059669)",
                            border: "none",
                            height: 45,
                            padding: "0 20px",
                            fontWeight: 500,
                            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        Thêm người dùng
                    </Button>

                    <Button type="primary" icon={<FileExcelOutlined />}
                        style={{ height: 45, background: 'linear-gradient(90deg, #ff5a3c, #CA3E30)' }}>
                        Import Excel
                    </Button>
                    <Button
                        type="default"
                        icon={<BarChartOutlined />}
                        style={{ color: "#16a34a", borderColor: "#16a34a", height: 45 }}
                    >
                        Xuất báo cáo
                    </Button>
                </Space>
            </div>

            {/* Search & Filter */}
            <Space style={{ marginBottom: 40 }}>
                <Input
                    placeholder="Tìm kiếm theo tên, email, phòng ban..."
                    prefix={<SearchOutlined />}
                    style={{ width: 1050, height: 45 }}
                />
                <Select defaultValue="Tất cả trạng thái" style={{ width: 170, height: 45, paddingLeft: 10 }}>
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="active">Hoạt động</Option>
                    <Option value="inactive">Không hoạt động</Option>
                </Select>
                <Select defaultValue="Tất cả phòng ban" style={{ width: 190, height: 45, paddingLeft: 10 }}>
                    <Option value="all">Tất cả phòng ban</Option>
                    <Option value="it">IT</Option>
                    <Option value="hr">HR</Option>
                    <Option value="marketing">Marketing</Option>
                    <Option value="sales">Sales</Option>
                </Select>
            </Space>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={users}
                pagination={false}
                style={{
                    backgroundColor: "#",
                    borderRadius: "12px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                }}
            />

            {/* Pagination */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
                <Pagination
                    current={page}
                    total={50}
                    pageSize={10}
                    onChange={(p) => setPage(p)}
                    showSizeChanger={false}
                />
            </div>
        </div>
    );
};

export default UserList;
