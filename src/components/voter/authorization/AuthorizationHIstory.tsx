import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DelegationService from "@/services/DelegationService";
import styles from "@/style/voter/AuthorizationHistory.module.css";
import { DelegationSearch, DelegationStatus } from "@/types/Delegate.interface";
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    StopOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const statusConfig: Record<
    DelegationStatus,
    { label: string; color: string; icon: React.ReactNode }
> = {
    DRAFT: { label: "Bản nháp", color: "purple", icon: <EditOutlined /> },
    PENDING: { label: "Đang chờ phê duyệt", color: "orange", icon: <ClockCircleOutlined /> },
    CONFIRMED: { label: "Đã phê duyệt", color: "green", icon: <CheckCircleOutlined /> },
    ACTIVE: { label: "Đang hiệu lực", color: "blue", icon: <CheckCircleOutlined /> },
    EXPIRED: { label: "Hết hiệu lực", color: "default", icon: <ExclamationCircleOutlined /> },
    REVOKED: { label: "Đã thu hồi", color: "red", icon: <CloseCircleOutlined /> },
    INVALID: { label: "Không hợp lệ", color: "magenta", icon: <StopOutlined /> },
};


export default function AuthorizationHistory() {
    const navigate = useNavigate();
    const [delegations, setDelegations] = useState<DelegationSearch[]>([]);
    const [inlineAlert, setInlineAlert] = useState<{
        type: "info" | "warning" | "error" | "success";
        message: string;
        description: string;
        bgColor?: string;
        icon?: React.ReactNode;
    } | null>(null);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    useEffect(() => {
        const fetchDelegations = async () => {
            try {
                showLoading();
                const electionId = localStorage.getItem("currentElectionId") || "";
                const delegatorId = localStorage.getItem("userId") || "";
                const data = await DelegationService.getDelegationByVoterId(electionId, delegatorId);
                setDelegations(data);
            } catch {
                notify("Không thể tải danh sách ủy quyền");
            } finally {
                hideLoading();
            }
        };
        fetchDelegations();
    }, []);

    // ✅ Kiểm tra có ủy quyền nào bị chặn không (đang hoạt động hoặc chờ duyệt)
    const blockingDelegation = delegations.find((item) =>
        ["PENDING", "CONFIRMED", "ACTIVE"].includes(item.status)
    );



    // 👉 Xử lý tạo ủy quyền
    const handleCreateDelegation = () => {
        if (blockingDelegation) {
            const mapStatus = {
                PENDING: {
                    type: "info",
                    message: "Ủy quyền đang chờ phê duyệt",
                    description: "Bạn đã có một ủy quyền đang chờ phê duyệt. Vui lòng chờ kết quả.",
                    bgColor: "#fff7e6",
                    icon: <ClockCircleOutlined style={{ color: "#fa8c16" }} />,
                },
                CONFIRMED: {
                    type: "success",
                    message: "Ủy quyền đã được phê duyệt",
                    description: "Bạn đã có một ủy quyền đã được phê duyệt, không thể tạo thêm.",
                    bgColor: "#f6ffed",
                    icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                },
                ACTIVE: {
                    type: "warning",
                    message: "Ủy quyền đang có hiệu lực",
                    description: "Bạn đã có một ủy quyền đang hoạt động, không thể tạo thêm.",
                    bgColor: "#e6f7ff",
                    icon: <InfoCircleOutlined style={{ color: "#1890ff" }} />,
                },
            } as const;

            setInlineAlert(mapStatus[blockingDelegation.status as keyof typeof mapStatus]);
            return;
        }

        setInlineAlert(null);
        navigate("/voter/create-authorization");
    };

    const columns = [
        {
            title: "Cuộc bầu cử",
            dataIndex: ["electionId", "title"],
            key: "electionName",
            width: 250,
            render: (text: string) => (
                <Text strong className={styles.electionNameCell}>
                    {text}
                </Text>
            ),
        },
        {
            title: "Người được ủy quyền",
            key: "delegate",
            render: (_: unknown, record: DelegationSearch) => {
                const delegate = record.delegateId ?? record.delegateInfo;

                return (
                    <Space size="middle" align="center">
                        <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#7ECB50" }}>
                            {delegate?.fullName?.charAt(0) ?? "?"}
                        </Avatar>
                        <div>
                            <Text strong>{delegate?.fullName ?? "Không có dữ liệu"}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {delegate?.email ?? "---"}
                            </Text>
                        </div>
                    </Space>
                );
            },
        },


        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (value: DelegationStatus) => {
                const config = statusConfig[value];
                return (
                    <Tag color={config.color} icon={config.icon} style={{ borderRadius: 12, padding: "4px 12px" }}>
                        {config.label}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string) =>
                <Space>
                    <CalendarOutlined />
                    <Text>{new Date(value).toLocaleDateString("vi-VN")}</Text>
                </Space>,
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: unknown, record: DelegationSearch) => (
                <Button
                    className={styles.viewDetailButton}
                    icon={<EyeOutlined />}
                    onClick={() => navigate("/voter/authorization-detail", { state: { id: record._id } })}
                >
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    return (
        <Card
            className={styles.delegationHistoryCard}
            title={
                <div className={styles.titleContainer}>
                    <Title level={5} className={styles.cardTitle}>
                        📚 Lịch sử ủy quyền của bạn
                    </Title>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        ghost
                        onClick={handleCreateDelegation}
                        style={{
                            borderRadius: 8,
                            fontWeight: 500,
                            color: "#124d2d",
                            border: "1.5px solid #3ca860",
                            background: "#f6ffed",
                            transition: "all 0.3s ease",
                            height: 36,
                            padding: "0 16px",
                            marginRight: 30
                        }}
                        onMouseEnter={(e) => {
                            const btn = e.currentTarget;
                            btn.style.background = "#3ca860";
                            btn.style.color = "white";
                            btn.style.borderColor = "#3ca860";
                            btn.style.boxShadow = "0 2px 6px rgba(60,168,96,0.25)";
                        }}
                        onMouseLeave={(e) => {
                            const btn = e.currentTarget;
                            btn.style.background = "#f6ffed";
                            btn.style.color = "#124d2d";
                            btn.style.borderColor = "#3ca860";
                            btn.style.boxShadow = "none";
                        }}

                    >
                        Tạo ủy quyền mới
                    </Button>

                </div>
            }
        >
            {inlineAlert && (
                <Alert
                    message={inlineAlert.message}
                    description={inlineAlert.description}
                    type={inlineAlert.type}
                    showIcon
                    icon={inlineAlert.icon}
                    style={{
                        marginBottom: 16,
                        borderRadius: 10,
                        background: inlineAlert.bgColor,
                    }}
                />
            )}
            <Table<DelegationSearch>
                columns={columns}
                dataSource={delegations}
                rowKey="_id"
                pagination={{ pageSize: 5, showSizeChanger: false }}
                bordered={false}
                scroll={{ x: 1000 }}
                style={{ background: "transparent" }}
            />
        </Card>
    );
}
