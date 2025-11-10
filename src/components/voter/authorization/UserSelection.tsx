import {
    Card,
    Input,
    Table,
    Typography,
    Button,
    Avatar,
    Tag,
    Space,
    Alert,
    message
} from "antd";
import { SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { User } from "@/types/User.interface";
import UserService from "@/services/UserService";
import { useLoading } from "@/contexts/LoadingContext";

const { Text, Title } = Typography;
const { Search } = Input;

interface UserSelectionProps {
    onSelectUser: (user: User) => void;
    onCreateNew: () => void;
}

const removeVietnameseTones = (str: string): string => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");
};

const normalizeSearchText = (text: string): string => {
    return removeVietnameseTones(text.toLowerCase().trim());
};

const UserSelection = ({ onSelectUser, onCreateNew }: UserSelectionProps) => {
    const [searchText, setSearchText] = useState("");
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                showLoading();
                const usersData = await UserService.getAllUser();

                setUsers(usersData);
                setError(null);
            } catch (err: unknown) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Không thể tải danh sách người dùng";
                setError(msg);
                message.error(msg);
            } finally {
                hideLoading();
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) => {
        const normalized = normalizeSearchText(searchText);
        if (!normalized) return true;

        return (
            normalizeSearchText(user.fullName || "").includes(normalized) ||
            normalizeSearchText(user.email || "").includes(normalized) ||
            normalizeSearchText(user.department || "").includes(normalized) ||
            normalizeSearchText(user.position || "").includes(normalized) ||
            normalizeSearchText(
                user.status === "ACTIVE" ? "hoạt động" : user.status || ""
            ).includes(normalized)
        );
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
            )
        },
        {
            title: "Phòng ban",
            dataIndex: "department",
            key: "department"
        },
        {
            title: "Chức vụ",
            dataIndex: "position",
            key: "position"
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record: User) => (
                <Tag color={record.status === "ACTIVE" ? "green" : "default"}>
                    {record.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
                </Tag>
            )
        },
        {
            title: "Hành động",
            key: "action",
            render: (record: User) => (
                <Button
                    type="primary"
                    style={{
                        background:
                            selectedUserId === record._id ? "#5ba93b" : "#7ECB50",
                        border: "none"
                    }}
                    onClick={() => {
                        setSelectedUserId(record._id);
                        onSelectUser(record);
                    }}
                >
                    {selectedUserId === record._id ? "Đã chọn" : "Chọn"}
                </Button>
            )
        }
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
                {/* Search & Create new */}
                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                    <Search
                        placeholder="Tìm kiếm người dùng"
                        allowClear
                        enterButton={<SearchOutlined />}
                        size="large"
                        style={{ width: 500 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Button
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
                        message="Lỗi tải dữ liệu"
                        description={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError(null)}
                    />
                )}

                {/* Table (no local loading) */}
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`
                    }}
                    rowClassName={(record) =>
                        selectedUserId === record._id ? "selected-row" : ""
                    }
                    locale={{
                        emptyText: "Không có dữ liệu"
                    }}
                />
            </Space>
        </Card>
    );
};

export default UserSelection;
