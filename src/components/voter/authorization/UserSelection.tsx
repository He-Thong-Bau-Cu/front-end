import { Card, Input, Table, Typography, Button, Avatar, Tag, Space, Spin, Alert, message } from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { User } from "@/types/User.interface";
import UserService from "@/services/UserService";

const { Text, Title } = Typography;
const { Search } = Input;

interface UserSelectionProps {
    onSelectUser: (user: User) => void;
    onCreateNew: () => void;
}

// Function to remove Vietnamese diacritics (dấu)
const removeVietnameseTones = (str: string): string => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

// Function to normalize search text (lowercase + remove tones)
const normalizeSearchText = (text: string): string => {
    return removeVietnameseTones(text.toLowerCase().trim());
};

const UserSelection = ({ onSelectUser, onCreateNew }: UserSelectionProps) => {
    const [searchText, setSearchText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await UserService.getAll();
                // Handle different response structures
                const usersData = Array.isArray(response)
                    ? response
                    : (response as { data?: User[] })?.data || (response as { users?: User[] })?.users || [];
                setUsers(usersData);
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : "Không thể tải danh sách người dùng";
                setError(errorMessage);
                message.error(errorMessage);
                console.error("Error fetching users:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        if (!searchText) return true;

        const normalizedSearch = normalizeSearchText(searchText);

        // Tìm theo tên (không dấu, không phân biệt hoa thường)
        const normalizedFullName = normalizeSearchText(user.fullName || "");
        const matchFullName = normalizedFullName.includes(normalizedSearch);

        // Tìm theo email (không phân biệt hoa thường)
        const normalizedEmail = normalizeSearchText(user.email || "");
        const matchEmail = normalizedEmail.includes(normalizedSearch);

        // Tìm theo phòng ban (không dấu, không phân biệt hoa thường)
        const normalizedDepartment = normalizeSearchText(user.department || "");
        const matchDepartment = normalizedDepartment.includes(normalizedSearch);

        // Tìm theo chức vụ (không dấu, không phân biệt hoa thường)
        const normalizedPosition = normalizeSearchText(user.position || "");
        const matchPosition = normalizedPosition.includes(normalizedSearch);

        // Tìm theo trạng thái (tìm cả giá trị và text hiển thị, không dấu)
        const statusText = user.status === "ACTIVE" ? "hoạt động" : user.status?.toLowerCase() || "";
        const normalizedStatusText = normalizeSearchText(statusText);
        const normalizedStatus = normalizeSearchText(user.status || "");
        const matchStatus = normalizedStatusText.includes(normalizedSearch) || normalizedStatus.includes(normalizedSearch);

        return matchFullName || matchEmail || matchDepartment || matchPosition || matchStatus;
    });

    const columns = [
        {
            title: "Người dùng",
            key: "user",
            render: (record: User) => (
                <Space>
                    <Avatar style={{ backgroundColor: "#7ECB50" }}>
                        {record.fullName?.charAt(0) || "U"}
                    </Avatar>
                    <div>
                        <Text strong>{record.fullName || "N/A"}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {record.email || "N/A"}
                        </Text>
                    </div>
                </Space>
            ),
        },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department",
        },
        {
            title: "Chức vụ",
            dataIndex: "position",
            key: "position",
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record: User) => (
                <Tag color={record.status === "ACTIVE" ? "green" : "default"}>
                    {record.status === "ACTIVE" ? "Hoạt động" : record.status || "N/A"}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (record: User) => (
                <Button
                    type="primary"
                    style={{
                        background: selectedUserId === record._id ? "#5ba93b" : "#7ECB50",
                        border: "none",
                    }}
                    onClick={() => {
                        setSelectedUserId(record._id);
                        onSelectUser(record);
                    }}
                >
                    {selectedUserId === record._id ? "Đã chọn" : "Chọn"}
                </Button>
            ),
        },
    ];

    return (
        <Card
            className="delegation-form-card"
            title={
                <Title level={4} style={{ margin: 0, paddingLeft: 20 }}>
                    👥 Chọn người được ủy quyền
                </Title>
            }
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Tìm kiếm và nút tạo mới */}
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Search
                        placeholder="Tìm kiếm người được ủy quyền"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: 500 }}
                        onChange={(e) => setSearchText(e.target.value)}
                        onSearch={(value) => setSearchText(value)}
                    />
                    <Button
                        type="default"
                        icon={<UserAddOutlined />}
                        size="large"
                        onClick={onCreateNew}
                        style={{ borderColor: "#7ECB50", color: "#7ECB50" }}
                    >
                        Tạo người dùng mới
                    </Button>
                </Space>

                {/* Error message */}
                {error && (
                    <Alert
                        message="Lỗi"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                        style={{ marginBottom: 16 }}
                    />
                )}

                {/* Bảng danh sách users */}
                <Spin spinning={loading}>
                    <Table
                        dataSource={filteredUsers}
                        columns={columns}
                        rowKey="_id"
                        pagination={{
                            pageSize: 5,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} người dùng`,
                        }}
                        rowClassName={(record) =>
                            selectedUserId === record._id ? "selected-row" : ""
                        }
                        locale={{
                            emptyText: loading ? "Đang tải..." : "Không có dữ liệu",
                        }}
                    />
                </Spin>
            </Space>
        </Card>
    );
};

export default UserSelection;

