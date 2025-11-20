import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import DelegationService from "@/services/DelegationService";
import { DelegationSearch, DelegationStatus } from "@/types/Delegate.interface";
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    LeftOutlined,
    StopOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Col, Descriptions, Divider, Layout, Modal, Row, Space, Table, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HomeHeader from "./HomeHeader";
import styles from "../../style/voter/AuthorizationHistory.module.css";


const { Title, Text } = Typography;

// =================== STATUS CONFIG ===================
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
    SIGNED: { label: "Đã ký", color: "green", icon: <EditOutlined /> },
};

// =================== TYPE CONFIG ===================
const typeConfig: Record<string, { label: string; color: string }> = {
    ELECTION: { label: "Trong cuộc bầu cử", color: "blue" },
    LONG_TERM: { label: "Ủy quyền dài hạn", color: "geekblue" },
};

// =================== COMPONENT ===================
export default function AuthorizationHistory() {
    const navigate = useNavigate();
    const [delegations, setDelegations] = useState<DelegationSearch[]>([]);
    const { showLoading, hideLoading } = useLoading();
    const { notify } = useNotification();

    const [openModal, setOpenModal] = useState(false);
    const [selectedDelegation, setSelectedDelegation] = useState<DelegationSearch | null>(null);

    const handleOpenDetail = (record: DelegationSearch) => {
        setSelectedDelegation(record);
        setOpenModal(true);
    };



    useEffect(() => {
        const fetchDelegations = async () => {
            try {
                showLoading();
                const delegatorId = localStorage.getItem("userId") || "";
                const data = await DelegationService.getDelegationByUserId(delegatorId);
                setDelegations(data);
            } catch {
                notify("Không thể tải danh sách ủy quyền");
            } finally {
                hideLoading();
            }
        };
        fetchDelegations();
    }, []);

    // =================== TABLE COLUMNS ===================
    const columns = [
        {
            title: "Cuộc bầu cử",
            dataIndex: ["electionId", "title"],
            key: "electionName",
            width: 290,
            render: (text: string) => <Text strong>{text}</Text>,
        },
        {
            title: "Người được ủy quyền",
            key: "delegate",
            render: (_: unknown, record: DelegationSearch) => {
                const delegate = record.delegateId ?? record.delegateInfo;
                return (
                    <Space size="middle">
                        <Avatar
                            style={{ backgroundColor: "#7ECB50" }}
                            icon={!delegate?.fullName && <UserOutlined />}
                        >
                            {delegate?.fullName?.charAt(0)}
                        </Avatar>

                        <div style={{ whiteSpace: "nowrap" }}>
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
            title: "Loại ủy quyền",
            dataIndex: "delegationType",
            key: "delegationType",
            width: 180,
            render: (value: string) => {
                const cfg = typeConfig[value] ?? typeConfig.ELECTION;
                return (
                    <Tag color={cfg.color} style={{ borderRadius: 12, padding: "4px 12px" }}>
                        {cfg.label}
                    </Tag>
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
            width: 150,
            render: (value: string) => (
                <Space>
                    <CalendarOutlined />
                    <Text>{new Date(value).toLocaleDateString("vi-VN")}</Text>
                </Space>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 140,
            render: (_: unknown, record: DelegationSearch) => (
                <Button
                    icon={<EyeOutlined />}
                    type="primary"
                    ghost
                    onClick={() => handleOpenDetail(record)}
                >
                    Xem chi tiết
                </Button>
            ),
        },

    ];

    // =================== UI ===================
    return (


        <Layout
            style={{
                minHeight: "100vh",
                background:
                    "linear-gradient(135deg, #e8f5e9 0%, #f1f8f4 50%, #fafcfb 100%)",
                minWidth: "100vw",
                paddingBottom: "32px",
                position: "relative",
            }}
        >
            {/* Decorative background elements */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "40%",
                    height: "40%",
                    background:
                        "radial-gradient(circle, rgba(76, 175, 80, 0.08) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "30%",
                    height: "30%",
                    background:
                        "radial-gradient(circle, rgba(18, 77, 45, 0.06) 0%, transparent 70%)",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />

            <HomeHeader />
            <div
                style={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center", // Căn giữa ngang
                    paddingTop: 50,
                }}
            >
                <Card
                    style={{
                        borderRadius: 12,
                        width: "90%",
                    }}

                    title={
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                        >
                            <Title level={5} style={{ margin: 0, paddingLeft: 20 }}>
                                📚 Lịch sử ủy quyền của bạn
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
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <Table<DelegationSearch>
                            columns={columns}
                            dataSource={delegations}
                            rowKey="_id"
                            pagination={{ pageSize: 5, showSizeChanger: false }}
                            style={{ width: "100%" }}
                        />
                    </div>
                </Card>
            </div>
            );
            <Modal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                footer={null}
                width='80%'
                centered
                title={
                    <div >
                        <Title level={5} style={{ margin: 0 }}>
                            📜 Chi tiết ủy quyền
                        </Title>
                    </div>
                }
            >
                {selectedDelegation && (

                    <Space direction="vertical" style={{ width: "100%" }} size="large">

                        {/* ========= ROW: NGƯỜI ỦY QUYỀN - NGƯỜI ĐƯỢC ỦY QUYỀN ========= */}
                        <Row gutter={[16, 16]} className={styles.usersRow}>
                            {/* NGƯỜI ỦY QUYỀN */}
                            <Col xs={24} md={12}>
                                <Card
                                    size="small"
                                    title={<Title level={5} className={styles.cardSectionTitle}>Người ủy quyền</Title>}
                                    className={styles.userCard}
                                >
                                    <Space className={styles.userInfo}>
                                        <div className={styles.avatarWrapper}>
                                            <Avatar
                                                size={64}
                                                className={styles.delegatorAvatar}
                                                icon={<UserOutlined />}
                                            >
                                                {selectedDelegation.delegatorId.fullName.charAt(0)}
                                            </Avatar>
                                        </div>

                                        <div className={styles.userDetails}>
                                            <Text strong className={styles.userName}>
                                                {selectedDelegation.delegatorId.fullName}
                                            </Text>
                                            <br />
                                            <Text type="secondary" className={styles.userEmail}>
                                                {selectedDelegation.delegatorId.email}
                                            </Text>
                                        </div>
                                    </Space>

                                    <Divider className={styles.divider} />

                                    <Descriptions column={1} size="small" className={styles.descriptions}>
                                        <Descriptions.Item label="Chức vụ">
                                            {selectedDelegation.delegatorId.position}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>

                            {/* NGƯỜI ĐƯỢC ỦY QUYỀN */}
                            <Col xs={24} md={12}>
                                <Card
                                    size="small"
                                    title={<Title level={5} className={styles.cardSectionTitle}>Người được ủy quyền</Title>}
                                    className={styles.userCard}
                                >
                                    <Space className={styles.userInfo}>
                                        <div className={styles.avatarWrapper}>
                                            <Avatar
                                                size={64}
                                                className={styles.delegateAvatar}
                                                icon={<UserOutlined />}
                                            >
                                                {(selectedDelegation.delegateId?.fullName ??
                                                    selectedDelegation.delegateInfo?.fullName ??
                                                    "?").charAt(0)}
                                            </Avatar>
                                        </div>

                                        <div className={styles.userDetails}>
                                            <Text strong className={styles.userName}>
                                                {selectedDelegation.delegateId?.fullName ??
                                                    selectedDelegation.delegateInfo?.fullName ??
                                                    "Không có dữ liệu"}
                                            </Text>
                                            <br />
                                            <Text type="secondary" className={styles.userEmail}>
                                                {selectedDelegation.delegateId?.email ??
                                                    selectedDelegation.delegateInfo?.email ??
                                                    "---"}
                                            </Text>
                                        </div>
                                    </Space>

                                    <Divider className={styles.divider} />

                                    <Descriptions column={1} size="small" className={styles.descriptions}>
                                        <Descriptions.Item label="Chức vụ">
                                            {selectedDelegation.delegateId?.position ?? "-"}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </Card>
                            </Col>
                        </Row>

                        {/* ========= THÔNG TIN ỦY QUYỀN ========= */}
                        <Card
                            size="small"
                            title={<Title level={5} className={styles.cardSectionTitle}>Thông tin ủy quyền</Title>}
                            className={styles.infoCard}
                        >
                            <Descriptions column={1} bordered size="small" className={styles.delegationInfo}>
                                <Descriptions.Item label="Trạng thái">
                                    <Tag
                                        color={statusConfig[selectedDelegation.status as DelegationStatus].color}
                                        icon={statusConfig[selectedDelegation.status as DelegationStatus].icon}
                                    >
                                        {statusConfig[selectedDelegation.status as DelegationStatus].label}
                                    </Tag>

                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày bắt đầu">
                                    {new Date(selectedDelegation.startDate).toLocaleDateString("vi-VN")}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày kết thúc">
                                    {new Date(selectedDelegation.endDate).toLocaleDateString("vi-VN")}
                                </Descriptions.Item>

                                <Descriptions.Item label="Ngày tạo">
                                    {new Date(selectedDelegation.createdAt).toLocaleString("vi-VN")}
                                </Descriptions.Item>

                                <Descriptions.Item label="Lý do ủy quyền">
                                    {selectedDelegation.delegateReason || "-"}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Space>

                )}
            </Modal>


        </Layout >

    );
}
