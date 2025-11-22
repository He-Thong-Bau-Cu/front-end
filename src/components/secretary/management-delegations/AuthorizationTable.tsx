import {
    Card,
    Input,
    Button,
    Table,
    Space,
    Typography,
    Spin,
    Modal,
    message,
    Divider,
    Col,
    Row,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    FileTextOutlined,
    EditFilled,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import DelegationService from "@/services/DelegationService";
import { useNotification } from "@/contexts/NotificationContext";

const { Text } = Typography;

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const removeVietnameseTones = (str: string) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

// ================= STATUS TAG =================
const renderStatusTag = (status: string) => {
    const map: any = {
        PENDING: { color: "#faad14", label: "Chờ xác nhận" },
        CONFIRMED: { color: "#1890ff", label: "Đã xác nhận" },
        SIGNED: { color: "#52c41a", label: "Đã phê duyệt" },
        REJECTED: { color: "#ff4d4f", label: "Đã từ chối" },
        ACTIVE: { color: "#73d13d", label: "Hiệu lực" },
        EXPIRED: { color: "#8c8c8c", label: "Hết hạn" },
        REVOKED: { color: "#cf1322", label: "Đã thu hồi" },
        INVALID: { color: "#fa8c16", label: "Không hợp lệ" },
    };

    const st = map[status] || { color: "#d9d9d9", label: status };

    return (
        <span
            style={{
                padding: "4px 10px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                background: st.color + "20",
                color: st.color,
            }}
        >
            {st.label}
        </span>
    );
};

const AuthorizationTable = () => {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState<boolean>(false);
    const { notify } = useNotification();
    const electionId = localStorage.getItem("currentElectionId") || "";

    // ===== Modal chi tiết =====
    const [openDetail, setOpenDetail] = useState(false);
    const [detail, setDetail] = useState<any>(null);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // ===== Modal xác nhận PHÊ DUYỆT =====
    const [confirmApproveOpen, setConfirmApproveOpen] = useState(false);

    // ===== Modal nhập lý do TỪ CHỐI =====
    const [rejectReasonModal, setRejectReasonModal] = useState<{
        open: boolean;
        reason: string;
    }>({
        open: false,
        reason: "",
    });

    // ===== Pagination state =====
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // ========================== LOAD LIST ==========================
    const loadDelegation = async () => {
        setLoading(true);
        try {
            const res = await DelegationService.getDelegationByElectionId(
                electionId
            );

            // ================== FILTER BY SEARCH (remove accents) =============
            const filtered = res.filter((item: any) => {
                const searchText = removeVietnameseTones(
                    search.trim().toLowerCase()
                );

                const delegatorName = removeVietnameseTones(
                    item.delegatorId?.fullName || ""
                );
                const delegateName = removeVietnameseTones(
                    item.delegateId?.fullName || ""
                );

                return (
                    delegatorName.includes(searchText) ||
                    delegateName.includes(searchText)
                );
            });

            setData(filtered);
        } catch (err) {
            console.error("Không thể load dữ liệu", err);
        } finally {
            setLoading(false);
        }
    };

    // ====== HANDLE APPROVE ======
    const handleApprove = async () => {
        if (!detail?._id) return;
        try {
            message.loading("Đang duyệt ủy quyền...", 0);

            const res = await DelegationService.delegationConfirmed({
                delegationId: detail._id,
                status: "CONFIRMED",
            });
            if (res.success) {
                notify(res.message, "success");
            } else {
                notify(res.message || "Không thể từ chối ủy quyền!", "error");
            }
            message.destroy();
            message.success("Đã duyệt ủy quyền!");

            setConfirmApproveOpen(false);
            setOpenDetail(false);
            loadDelegation();
        } catch (err) {
            message.destroy();
            message.error("Không thể duyệt ủy quyền!");
        }
    };

    // ====== HANDLE REJECT (dùng API rejectDelegation) ======
    const handleReject = async () => {
        if (!detail?._id) return;

        if (!rejectReasonModal.reason.trim()) {
            return message.warning("Vui lòng nhập lý do từ chối!");
        }

        try {
            message.loading("Đang từ chối ủy quyền...", 0);
            const payload = {
                delegationId: detail._id,
                status: "REJECTED",
                rejectReason: rejectReasonModal.reason,
            }

            // Gọi API rejectDelegation (mảng delegationIds + electionId)
            const res = await DelegationService.delegationConfirmed(payload);
            if (res.success) {
                notify(res.message, "success");
            } else {
                notify(res.message || "Không thể từ chối ủy quyền!", "error");
            }
            message.destroy();
            message.success("Đã từ chối ủy quyền!");

            setRejectReasonModal({ open: false, reason: "" });
            setOpenDetail(false);
            loadDelegation();
        } catch (err: any) {
            message.destroy();
            message.error(
                err?.response?.data?.message ||
                "Không thể từ chối ủy quyền!"
            );
        }
    };

    useEffect(() => {
        loadDelegation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const t = setTimeout(() => loadDelegation(), 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // ========================== LOAD DETAIL ==========================
    const handleOpenDetail = async (record: any) => {
        setOpenDetail(true);
        setLoadingDetail(true);
        try {
            setDetail(record);
        } catch (err) {
            message.error("Không thể tải chi tiết!");
        } finally {
            setLoadingDetail(false);
        }
    };

    // ================== COLUMNS ==================
    const columns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: any, index: number) =>
                index + 1 + (pagination.current - 1) * pagination.pageSize,
        },
        {
            title: "Người ủy quyền",
            render: (r: any) => (
                <Text strong>{r.delegatorId?.fullName || "—"}</Text>
            ),
        },
        {
            title: "Người được ủy quyền",
            render: (r: any) => (
                <span style={{ fontWeight: 500 }}>{r.delegateId?.fullName}</span>
            ),
        },
        {
            title: "Hạn ủy quyền",
            render: (r: any) => (
                <Text strong>
                    {formatDate(r?.startDate)} - {formatDate(r?.endDate)}
                </Text>
            ),
        },
        {
            title: "Trạng thái",
            render: (r: any) => renderStatusTag(r.status),
        },
        {
            title: "Thao tác",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={
                            <EyeOutlined
                                style={{ fontSize: 16, color: "blue" }}
                            />
                        }
                        onClick={() => handleOpenDetail(record)}
                    />
                    {record.status === "PENDING" ? (
                        <>
                            <Button
                                style={{ fontSize: 16, color: "green" }}
                                icon={<EditFilled />}
                                onClick={() => {
                                    handleOpenDetail(record);
                                }}
                            >
                                Xác nhận
                            </Button>
                            <Button
                                style={{ fontSize: 16, color: "red" }}
                                onClick={() => {
                                    handleOpenDetail(record);
                                }}
                            >
                                Từ chối
                            </Button>
                        </>
                    ) : null

                    }
                </Space>
            ),
        },
    ];

    return (
        <>
            {/* ======================== TABLE ======================== */}
            <Card
                style={{
                    borderRadius: 20,
                    padding: 20,
                    margin: 30,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 18,
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                        }}
                    >
                        <FileTextOutlined
                            style={{ fontSize: 22, color: "#52c41a" }}
                        />
                        <Text style={{ fontSize: 18, fontWeight: 600 }}>
                            Danh sách ủy quyền
                        </Text>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <Input
                            placeholder="Tìm kiếm theo tên..."
                            prefix={<SearchOutlined />}
                            allowClear
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ width: 260, borderRadius: 8 }}
                        />
                    </div>
                </div>

                <Spin spinning={loading}>
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="_id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            showSizeChanger: true,
                            pageSizeOptions: ["5", "10", "15", "20", "100"],
                            onChange: (page, pageSize) => {
                                setPagination({ current: page, pageSize });
                            },
                        }}
                    />
                </Spin>
            </Card>

            {/* ======================== MODAL CHI TIẾT ======================== */}
            <Modal
                open={openDetail}
                onCancel={() => setOpenDetail(false)}
                centered
                width={720}
                title={
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background:
                                    "linear-gradient(135deg, #d9f7be, #b7eb8f)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <EyeOutlined
                                style={{ fontSize: 20, color: "#52c41a" }}
                            />
                        </div>
                        <span
                            style={{ fontSize: 20, fontWeight: 600 }}
                        >
                            Chi tiết ủy quyền
                        </span>
                    </div>
                }
                footer={[
                    detail?.status === "PENDING" && (
                        <Button
                            key="reject"
                            danger
                            style={{
                                paddingInline: 26,
                                height: 40,
                                fontWeight: 500,
                                fontSize: 15,
                                borderRadius: 8,
                            }}
                            onClick={() =>
                                setRejectReasonModal({
                                    open: true,
                                    reason: "",
                                })
                            }
                        >
                            Từ chối
                        </Button>
                    ),
                    detail?.status === "PENDING" && (
                        <Button
                            key="approve"
                            type="primary"
                            style={{
                                background: "#52c41a",
                                borderColor: "#52c41a",
                                paddingInline: 26,
                                height: 40,
                                fontWeight: 600,
                                fontSize: 15,
                                borderRadius: 8,
                            }}
                            onClick={() => setConfirmApproveOpen(true)}
                        >
                            Phê duyệt
                        </Button>
                    ),
                    <Button
                        key="close"
                        style={{
                            paddingInline: 26,
                            height: 40,
                            fontWeight: 500,
                            fontSize: 15,
                            borderRadius: 8,
                        }}
                        onClick={() => setOpenDetail(false)}
                    >
                        Đóng
                    </Button>,
                ]}
            >
                {detail && (
                    <div style={{ padding: "8px 6px" }}>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong style={{ color: "#389e0d" }}>
                                Trạng thái
                            </Text>
                            <div style={{ marginTop: 6 }}>
                                {renderStatusTag(detail.status)}
                            </div>
                        </div>

                        <Row gutter={20}>
                            <Col span={12}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        marginBottom: 18,
                                        background: "#f6ffed",
                                        borderColor: "#b7eb8f",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 54,
                                                height: 54,
                                                borderRadius: "50%",
                                                background: "#e6fffb",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#52c41a",
                                                fontWeight: 700,
                                                fontSize: 20,
                                            }}
                                        >
                                            {detail.delegatorId.fullName?.charAt(
                                                0
                                            )}
                                        </div>
                                        <div>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 17,
                                                    color: "#389e0d",
                                                }}
                                            >
                                                Người ủy quyền
                                            </Text>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div style={{ lineHeight: "1.9" }}>
                                        <p>
                                            <strong>Họ và tên:</strong>{" "}
                                            {detail.delegatorId.fullName}
                                        </p>
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {detail.delegatorId.email}
                                        </p>
                                        <p>
                                            <strong>Vị trí:</strong>{" "}
                                            {detail.delegatorId.position}
                                        </p>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={12}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        marginBottom: 18,
                                        background: "#edf9ff",
                                        borderColor: "#91d5ff",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 14,
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: 54,
                                                height: 54,
                                                borderRadius: "50%",
                                                background: "#e6f7ff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                color: "#1890ff",
                                                fontWeight: 700,
                                                fontSize: 20,
                                            }}
                                        >
                                            {detail.delegateId.fullName?.charAt(
                                                0
                                            )}
                                        </div>
                                        <div>
                                            <Text
                                                strong
                                                style={{
                                                    fontSize: 17,
                                                    color: "#096dd9",
                                                }}
                                            >
                                                Người được ủy quyền
                                            </Text>
                                        </div>
                                    </div>

                                    <Divider />

                                    <div style={{ lineHeight: "1.9" }}>
                                        <p>
                                            <strong>Họ và tên:</strong>{" "}
                                            {detail.delegateId.fullName}
                                        </p>
                                        <p>
                                            <strong>Email:</strong>{" "}
                                            {detail.delegateId.email}
                                        </p>
                                        <p>
                                            <strong>Vị trí:</strong>{" "}
                                            {detail.delegateId.position}
                                        </p>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* --- INFORMATION --- */}
                        <div style={{ padding: "12px 6px" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Ngày tạo
                            </Text>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 500,
                                    marginTop: 4,
                                }}
                            >
                                {formatDate(detail.createdAt)}
                            </div>
                        </div>

                        <div style={{ padding: "12px 6px" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Lý do ủy quyền
                            </Text>
                            <div
                                style={{
                                    fontSize: 16,
                                    fontWeight: 500,
                                    marginTop: 4,
                                }}
                            >
                                {detail.delegateReason}
                            </div>
                        </div>

                        <Divider />

                        <div
                            style={{
                                fontSize: 13,
                                color: "#888",
                                textAlign: "center",
                            }}
                        >
                            <i>
                                Thông tin được trích xuất tự động từ hồ sơ ủy
                                quyền.
                            </i>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ======================== MODAL XÁC NHẬN PHÊ DUYỆT ======================== */}
            <Modal
                open={confirmApproveOpen}
                centered
                onCancel={() => setConfirmApproveOpen(false)}
                footer={null}
            >
                <div style={{ padding: "10px 4px" }}>
                    <h3
                        style={{
                            marginBottom: 12,
                            fontWeight: 600,
                            fontSize: 16,
                        }}
                    >
                        Xác nhận phê duyệt ủy quyền?
                    </h3>

                    <p style={{ marginBottom: 20 }}>
                        Bạn có chắc chắn muốn phê duyệt ủy quyền này? Thao tác
                        này sẽ cập nhật trạng thái trên hệ thống.
                    </p>

                    <Space
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                        }}
                    >
                        <Button onClick={() => setConfirmApproveOpen(false)}>
                            Hủy
                        </Button>

                        <Button
                            type="primary"
                            style={{
                                background: "#52c41a",
                                borderColor: "#52c41a",
                            }}
                            onClick={handleApprove}
                        >
                            Phê duyệt
                        </Button>
                    </Space>
                </div>
            </Modal>

            {/* ======================== MODAL NHẬP LÝ DO TỪ CHỐI ======================== */}
            <Modal
                title="Nhập lý do từ chối"
                open={rejectReasonModal.open}
                centered
                onCancel={() =>
                    setRejectReasonModal({ open: false, reason: "" })
                }
                footer={null}
            >
                <div style={{ marginBottom: 16 }}>
                    <Text strong>Lý do từ chối:</Text>
                    <Input.TextArea
                        value={rejectReasonModal.reason}
                        onChange={(e) =>
                            setRejectReasonModal({
                                ...rejectReasonModal,
                                reason: e.target.value,
                            })
                        }
                        rows={4}
                        placeholder="Nhập lý do từ chối..."
                    />
                </div>

                <Space
                    style={{
                        justifyContent: "flex-end",
                        width: "100%",
                    }}
                >
                    <Button
                        onClick={() =>
                            setRejectReasonModal({
                                open: false,
                                reason: "",
                            })
                        }
                    >
                        Hủy
                    </Button>

                    <Button danger type="primary" onClick={handleReject}>
                        Xác nhận từ chối
                    </Button>
                </Space>
            </Modal>
        </>
    );
};

export default AuthorizationTable;
