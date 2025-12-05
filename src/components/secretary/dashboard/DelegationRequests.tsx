import { Card, Table, Tag, Spin, Input, Button, Modal, Space, message } from "antd";
import { useEffect, useState } from "react";
import '../../../style/secretary/Dashboard.model.css'
import DelegationService from "@/services/DelegationService";
import { SearchOutlined, CloseCircleOutlined, FileDoneOutlined, EyeOutlined } from "@ant-design/icons";
import { useNotification } from "@/contexts/NotificationContext";
// ================= FORMAT DATE =================
const formatDate = (str?: string) => {
    if (!str) return "—";
    return new Date(str).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// ================= REMOVE ACCENTS =================
const removeVietnameseTones = (str: string) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};
// ================= MAP STATUS =================
const renderStatus = (status: string) => {
    const map: any = {
        PENDING: { color: "orange", label: "Chờ duyệt" },
    };
    const s = map[status] || { color: "default", label: status };
    return <Tag color={s.color}>{s.label}</Tag>;
};

const DelegationRequests = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();
    const [search, setSearch] = useState("");
    const electionId = localStorage.getItem("currentElectionId") || "";
    // ========= Pagination ============
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    // ========= Modal xác nhận ký ============
    const [confirmSignModal, setConfirmSignModal] = useState({
        open: false,
        reject: false,
        record: null as any,
    });

    // ========= Modal lý do từ chối ============
    const [rejectModal, setRejectModal] = useState({
        open: false,
        record: null as any,
        reject: true,
        reason: "",
    });

    // ================= LOAD USER'S OWN REQUESTS =================
    const loadData = async () => {
        setLoading(true);
        try {
            const res = await DelegationService.getDelegationByElectionId(electionId);
            const list = res || [];

            // Filter search
            const filtered = list.filter((item: any) => {
                const text = removeVietnameseTones(search.trim().toLowerCase());
                const code = removeVietnameseTones(item?.election?.decisionNumber || "");
                const name = removeVietnameseTones(item?.election?.decisionName || "");
                return code.includes(text) || name.includes(text);
            });

            // Only PENDING
            const onlyPending = filtered.filter((item: any) => item?.status === "PENDING");

            const mapped = onlyPending.map((item: any) => ({
                ...item,
                code: item?.election?.decisionNumber,
                name: item?.election?.decisionName,
                date: formatDate(item?.createdAt),
            }));

            setData(mapped);
        } catch (err: any) {
            notify(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);


    // ================== HANDLE SIGN ==================
    const handleSign = async () => {
        const record = confirmSignModal.record;
        if (!record?._id) return;
        try {
            message.loading("Đang xác nhận yêu cầu...", 0);
            const res = await DelegationService.delegationConfirmed({
                delegationId: record._id,
                status: "CONFIRMED",
            });
            if (res.success) {
                notify(res.message, "success")
            } else {
                notify(res.message, "error")
            }
            message.destroy();
            message.success("Xác nhận yêu cầu thành công!");
            setConfirmSignModal({ open: false, reject: false, record: null });
            loadData();
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };

    // ================== HANDLE REJECT ==================
    const handleReject = async () => {
        const record = rejectModal.record;
        if (!record?._id) return;

        if (!rejectModal.reason.trim()) {
            return message.warning("Vui lòng nhập lý do từ chối!");
        }

        try {
            message.loading("Đang từ chối...", 0);

            await DelegationService.delegationConfirmed(
                {
                    delegationId: record._id,
                    status: "REJECTED",
                    rejectReason: rejectModal.reason,
                }
            );

            message.destroy();
            message.success("Đã từ chối yêu cầu!");

            setRejectModal({ open: false, record: null, reject: false, reason: "" });
            loadData();
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };

    // ================== COLUMNS ==================
    const columns = [
        {
            title: "STT",
            align: "center" as const,
            width: 70,
            render: (_: any, __: any, index: number) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        { title: "Người ủy quyền", dataIndex: ["delegatorId", "fullName"] },
        { title: "Người được ủy quyền", dataIndex: ["delegateId", "fullName"] },
        { title: "Ngày gửi", dataIndex: "createdAt", render: (val: string) => formatDate(val) },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: renderStatus,
        },
        {
            title: "Hành động",
            width: 200,
            render: (_: any, record: any) => (
                <Space>

                    <Button
                        icon={<FileDoneOutlined />}
                        type="primary"
                        onClick={() => setConfirmSignModal({ open: true, reject: false, record })}
                    >
                        Xác nhận
                    </Button>

                    <Button
                        icon={<CloseCircleOutlined />}
                        danger
                        onClick={() => setRejectModal({ open: true, record, reject: true, reason: "" })}
                    >
                        Từ chối
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card
            className="delegation-card"
            title={<span className="delegation-title">📄 Yêu cầu ủy quyền của tôi (Chờ xác nhận)</span>}
        >
            <Input
                placeholder="Tìm kiếm..."
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 250, marginBottom: 14 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="_id"
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        showSizeChanger: true,
                        pageSizeOptions: ["5", "10", "20", "100"],
                        onChange: (page, pageSize) => {
                            setPagination({ current: page, pageSize });
                        },
                    }}
                />
            </Spin>

            {/* ===== MODAL KÝ ===== */}
            <Modal
                open={confirmSignModal.open}
                onCancel={() => setConfirmSignModal({ open: false, reject: false, record: null })}
                footer={null}
                centered
                styles={{ header: { borderBottom: "none" } }}
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #d9f7be, #b7eb8f)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <FileDoneOutlined style={{ fontSize: 22, color: "#52c41a" }} />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>Xác nhận yêu cầu</span>
                    </div>
                }
            >
                <div style={{ padding: "4px 4px 10px 4px", fontSize: 16 }}>
                    Bạn có chắc chắn muốn <b> xác nhận</b> yêu cầu ủy quyền này không?
                </div>

                <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                    <Button
                        onClick={() => setConfirmSignModal({ open: false, reject: false, record: null })}
                        style={{
                            height: 40,
                            paddingInline: 24,
                            fontSize: 15,
                            borderRadius: 8,
                        }}
                    >
                        Hủy
                    </Button>

                    <Button
                        type="primary"
                        onClick={handleSign}
                        style={{
                            background: "#52c41a",
                            borderColor: "#52c41a",
                            height: 40,
                            paddingInline: 28,
                            fontSize: 15,
                            borderRadius: 8,
                            fontWeight: 600,
                        }}
                    >
                        Xác nhận
                    </Button>
                </Space>
            </Modal>


            {/* ===== MODAL TỪ CHỐI ===== */}
            <Modal
                open={rejectModal.open}
                onCancel={() => setRejectModal({ open: false, record: null, reject: false, reason: "" })}
                footer={null}
                centered
                styles={{ header: { borderBottom: "none" } }}
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 46,
                                height: 46,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #fff1f0, #ffa39e)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <CloseCircleOutlined style={{ fontSize: 22, color: "#ff4d4f" }} />
                        </div>
                        <span style={{ fontSize: 18, fontWeight: 600 }}>Từ chối yêu cầu</span>
                    </div>
                }
            >
                <div style={{ marginBottom: 12, fontSize: 16 }}>
                    Vui lòng nhập lý do từ chối để gửi lại cho người yêu cầu:
                </div>

                <Input.TextArea
                    rows={4}
                    value={rejectModal.reason}
                    onChange={(e) =>
                        setRejectModal({ ...rejectModal, reason: e.target.value })
                    }
                    placeholder="Nhập lý do từ chối..."
                    style={{
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 15,
                        borderColor: "#ffccc7",
                    }}
                />

                <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                    <Button
                        onClick={() =>
                            setRejectModal({ open: false, record: null, reject: false, reason: "" })
                        }
                        style={{
                            height: 40,
                            paddingInline: 24,
                            fontSize: 15,
                            borderRadius: 8,
                        }}
                    >
                        Hủy
                    </Button>

                    <Button
                        danger
                        type="primary"
                        onClick={handleReject}
                        style={{
                            height: 40,
                            paddingInline: 28,
                            fontSize: 15,
                            borderRadius: 8,
                            fontWeight: 600,
                        }}
                    >
                        Xác nhận từ chối
                    </Button>
                </Space>
            </Modal>

        </Card>
    );
};

export default DelegationRequests;
