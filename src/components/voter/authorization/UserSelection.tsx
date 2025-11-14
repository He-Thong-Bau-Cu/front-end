import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import UserService from "@/services/UserService";
import { User } from "@/types/User.interface";
import { LeftOutlined, SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import {
    Alert,
    Avatar,
    Button,
    Card,
    Input,
    Space,
    Table,
    Tag,
    Typography
} from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const { Text, Title } = Typography;
const { Search } = Input;


// ❗ Không cần props nữa
const UserSelection = () => {
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);

    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const navigate = useNavigate();


    const location = useLocation();
    const electionId = location.state?.electionId || localStorage.getItem("currentElectionId");

    const removeVietnameseTones = (str: string): string => {
        if (!str) return "";
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    };

    const normalizeSearchText = (text: string): string =>
        removeVietnameseTones(text.toLowerCase().trim());

    // 🔹 Lấy danh sách người dùng
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                showLoading();
                const usersData = await UserService.getAllUser();
                setUsers(usersData);
                setError(null);
            } catch {
                notify("Không thể tải danh sách người dùng");
            } finally {
                hideLoading();
            }
        };

        fetchUsers();
    }, []);

    // 🔹 Lọc theo từ khóa
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

    // 🔹 Cấu hình cột bảng
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
                    {record.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
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
                        background: "#7ECB50",
                        border: "none",
                    }}
                    onClick={() => {
                        navigate("/voter/request-authorization", {
                            state: {
                                selectedUser: record,
                                electionId: electionId,
                                delegatorId: localStorage.getItem("userId"),
                            },
                        });
                    }}

                >
                    Chọn
                </Button>
            ),
        },
    ];

    return (
        <Card
            className="delegation-form-card"
            title={
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Title level={5} style={{ margin: 0, paddingLeft: 20 }}>
                        👥 Chọn người được ủy quyền
                    </Title>
                    <Button
                        className="backButton"
                        type="default"
                        size="middle"
                        icon={<LeftOutlined />}
                        onClick={() => navigate(-1)}
                    >
                        Quay lại
                    </Button>
                </div>
            }
        >
            <Space direction="vertical" style={{ width: "100%" }} size="large">
                {/* Thanh tìm kiếm & tạo mới */}
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
                        onClick={() => navigate("/voter/authorization-form")}
                        className="createUserButton"
                    >
                        Tạo người dùng mới
                    </Button>
                </Space>

                {/* Thông báo lỗi */}
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

                {/* Bảng người dùng */}
                <Table
                    dataSource={filteredUsers}
                    columns={columns}
                    rowKey="_id"
                    pagination={{
                        pageSize: 5,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                    locale={{
                        emptyText: "Không có dữ liệu",
                    }}
                />
            </Space>
        </Card>
    );
};

export default UserSelection;
