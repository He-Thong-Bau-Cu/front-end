import React, { useEffect, useState } from "react";
import {
    Modal,
    Card,
    Typography,
    Row,
    Col,
    Table,
    Button,
    Spin,
    message,
    Divider,
    Tag,
    Input,
} from "antd";
import {
    DownloadOutlined,
    EyeOutlined,
} from "@ant-design/icons";

import DelegationService from "@/services/DelegationService";
import { SummaryDelegate } from "@/types/SummaryDelegate.interface";
import { DelegationSummary } from "@/types/Delegate.interface";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import FileService from "@/services/FileService";
import { set } from "react-hook-form";
import { formatDateNoOffset, formatDateNoOffset2 } from "@/utils/format";
const { Title, Text } = Typography;

const formatDate = (dateString: string | Date | null | undefined): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return "";
    }
};

interface AuthorizationDetailModalProps {
    open: boolean;
    onClose: () => void;
    recordId: string | null;

    onSelectApproved?: (ids: string[]) => void;
}

const AuthorizationDetailModal: React.FC<AuthorizationDetailModalProps> = ({
    open,
    onClose,
    recordId,
    onSelectApproved,
}) => {
    const [data, setData] = useState<SummaryDelegate | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailView, setDetailView] = useState<any>(null);
    const { showLoading, hideLoading } = useLoading();
    const [selectedDelegations, setSelectedDelegations] = useState<string[]>([]);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [reject1ModalOpen, setReject1ModalOpen] = useState(false);
    const { notify } = useNotification();
    const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});
    const [warningModalOpen, setWarningModalOpen] = useState(false);
    const [delegationsToReject, setDelegationsToReject] = useState<string[]>([]);

    const loadDetail = async () => {
        if (!recordId) return;
        setLoading(true);
        try {
            const res = await DelegationService.getDelegationPresideByElectionId(recordId);
            setData(res[0]);
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadDetail();
            setSelectedDelegations([]);
        }
    }, [open, recordId]);


    const handleOpenSign = () => {
        if (selectedDelegations.length === 0) {
            return message.warning("Hãy chọn ít nhất 1 ủy quyền để ký số!");
        }

        // Lấy toàn bộ ủy quyền đang ở trạng thái CHỜ DUYỆT (CONFIRMED)
        const confirmedIds = mappedList
            .filter(item => item.status === "CONFIRMED")
            .map(item => item.id);

        // Những ủy quyền CONFIRMED nhưng KHÔNG được chọn -> phải bị từ chối
        const toReject = confirmedIds.filter(id => !selectedDelegations.includes(id));

        if (toReject.length > 0) {
            setDelegationsToReject(toReject);
            setWarningModalOpen(true);
            return;
        }

        // Không có mục nào cần từ chối -> mở ký số luôn
        onSelectApproved?.(selectedDelegations);
        setModalOpen(true);
    };
    const handleReject = async () => {
        try {

            const delegationList = selectedDelegations.map((id) => ({
                id,
                rejectReason: rejectReasons[id] || "",
            }));
            const payload = {
                electionId: data?.election?._id,
                delegationIds: delegationList
            };
            const reject = await DelegationService.delegationReject(payload);
            if (reject.success) {
                notify(reject.message, "success");
            } else {
                notify(reject.message, "error");
            }
            loadDetail();
            setRejectModalOpen(false);
            // setSelectedDelegations([]);
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };

    const handleReject1 = async () => {
        try {

            const delegationList = delegationsToReject.map((id) => ({
                id,
                rejectReason: rejectReasons[id] || "",
            }));

            const payload = {
                electionId: data?.election?._id,
                delegationIds: delegationList,
            };
            const reject = await DelegationService.delegationReject(payload);
            if (!reject.success) {
                notify(reject.message, "error");
                // notify(reject.message, "success");
            }
            setReject1ModalOpen(false);
            onSelectApproved?.(selectedDelegations);
            loadDetail();
            setModalOpen(true);

        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };
    const downloadUrlFile = async () => {
        try {
            const response = await DelegationService.getSummaryDelegationPdf({
                secretaryId: "651f0a7c1f2b4d1a12345678",
                electionId: recordId,
                recipient: "Chủ tịch",
            });

            const blob = new Blob([response], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Danh_sach_uy_quyen.pdf";
            a.click();
            URL.revokeObjectURL(url);
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        }
    };

    const handleDigitalSign = async ({ file, password }: { file: File; password: string }) => {
        try {
            showLoading();
            const formData = new FormData();
            formData.append("file", file);
            formData.append("password", password);
            formData.append("electionId", recordId || "");
            selectedDelegations.forEach(id => {
                formData.append("delegationIds", id);
            });
            const res = await DelegationService.delegationApprove(formData);
            if (res.success) {
                notify(res.message, "success");
                loadDetail();
                setModalOpen(false);
            } else {
                notify(res.message, "error");
            }
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        } finally {
            hideLoading();
        }
    };
    const isDelegationExpired = (endDate?: string) => {
        if (!endDate) return false;
        return new Date(endDate).getTime() < Date.now();
    };
    const isDelegationSigne = (status?: string) => {
        if (!status) return false;
        return status === "SIGNED";
    };
    const check = isDelegationExpired(data?.election?.delegationEnd);
    const checkSign = isDelegationSigne(data?.status);


    const columns = [
        {
            title: "STT",
            dataIndex: "index",
            width: 60,
            align: "center" as const,
        },
        {
            title: "Người ủy quyền",
            dataIndex: ["delegator", "fullName"],
        },
        {
            title: "Người được ủy quyền",
            dataIndex: ["delegate", "fullName"],
        },
        {
            title: "Loại",
            dataIndex: "delegationType",
            render: (status: string) => {
                let color = "";
                let text = "";

                switch (status) {
                    case "LONG_TERM":
                        color = "yellow";
                        text = "Dài hạn";
                        break;
                    case "LONG_TERM":
                        color = "green";
                        text = "Trong cuộc bầu cử";
                        break;
                    default:
                        color = "default";
                        text = status;
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            width: 140,
            align: "center" as const,
            render: (status: string) => {
                let color = "";
                let text = "";

                switch (status) {
                    case "PENDING":
                        color = "yellow";
                        text = "Chờ thư ký xác nhận";
                        break;
                    case "CONFIRMED":
                        color = "gold";
                        text = "Chờ duyệt";
                        break;
                    case "SIGNED":
                        color = "green";
                        text = "Đã ký duyệt";
                        break;
                    case "REJECTED":
                        color = "red";
                        text = "Từ chối";
                        break;
                    default:
                        color = "default";
                        text = status;
                }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            width: 140,
            align: "center" as const,
        },
        {
            title: "Chi tiết",
            width: 70,
            align: "center" as const,
            render: (_: any, record: any) => (
                <Button
                    icon={<EyeOutlined style={{ color: "#52c41a" }} />}
                    type="text"
                    onClick={() => setDetailView(record)}
                />
            ),
        },
    ];

    const mappedList =
        data?.delegations?.map((item: DelegationSummary, idx: number) => ({
            id: item.id,
            index: idx + 1,
            delegator: item.delegator,
            delegate: item.delegate,
            createdAt: formatDate(item.createdAt),
            status: item.status,
            delegateReason: item.delegateReason,
            raw: item,
            delegationType: item.delegationType,
        })) || [];
    return (
        <>
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                width={850}
                centered
                styles={{
                    body: {
                        padding: 0,
                        background: "#f6f9f4",
                    },
                }}
            >
                <Spin spinning={loading}>
                    <Card
                        style={{
                            borderRadius: 14,
                            padding: "24px 28px",
                            margin: 0,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 10,
                            }}
                        >
                            <div>
                                <Title level={4} style={{ margin: 0 }}>
                                    Danh sách ủy quyền
                                </Title>
                                <Text type="secondary" style={{ fontSize: 13 }}>
                                    Xem – chọn – phê duyệt các ủy quyền hợp lệ
                                </Text>
                                <Text type="secondary" style={{ fontSize: 13, whiteSpace: "pre-line", color: "#faad14", display: "block", marginTop: 6 }}>
                                    {"\n"}Lưu ý:
                                    {"\n"}1. Chỉ những ủy quyền có trạng thái "Chờ duyệt" mới có thể được ký số.
                                    {"\n"}2. Những ủy quyền đã "Đã ký duyệt" hoặc "Từ chối" sẽ không thể được chọn.
                                    {"\n"}3. Khi bấm "Ký số", hệ thống sẽ ký số tập trung tất cả các ủy quyền bạn đã chọn.
                                    {"\n"}4. Các ủy quyền không được chọn sẽ bị bắt buộc từ chối. Bạn hãy kiểm tra lại và chắc chắn với sự lựa chọn của mình.
                                </Text>

                            </div>
                        </div>

                        <Divider />

                        <Row gutter={16} style={{ marginBottom: 12 }}>
                            <Col span={12}>
                                <Text strong style={{ color: "#52c41a" }}>
                                    Cuộc bầu cử
                                </Text>
                                <p style={{ marginTop: 4 }}>{data?.election?.title}</p>
                            </Col>

                            <Col span={12}>
                                <Text strong style={{ color: "#52c41a" }}>
                                    Hạn nhận ủy quyền
                                </Text>
                                <p style={{ marginTop: 4 }}>
                                    {formatDateNoOffset2(data?.election?.delegationEnd)}
                                </p>
                            </Col>
                        </Row>

                        <Divider />

                        <Table
                            rowKey={(record) => record.id}
                            columns={columns}
                            dataSource={mappedList}
                            pagination={false}
                            rowSelection={{
                                type: "checkbox",
                                getCheckboxProps: (record: any) => ({
                                    disabled: record.status === "SIGNED" || record.status === "REJECTED" || record.status === "PENDING" || !check || checkSign,
                                }),
                                selectedRowKeys: selectedDelegations,
                                onChange: (keys) => setSelectedDelegations(keys as string[]),
                            }}
                            style={{
                                borderRadius: 10,
                                overflow: "hidden",
                            }}
                        />

                        <Row justify="end" style={{ marginTop: 22 }} gutter={12}>
                            {data?.status === "PENDING" || data?.status === "CONFIRMED" ? (
                                <Col>
                                    <Button icon={<DownloadOutlined />} onClick={downloadUrlFile}>
                                        Tải danh sach ủy quyền
                                    </Button>
                                </Col>

                            ) : null}
                            {check && !checkSign && (
                                <>
                                    <Col>
                                        <Button
                                            danger
                                            disabled={selectedDelegations.length === 0}
                                            onClick={() => setRejectModalOpen(true)}
                                        >
                                            Từ chối
                                        </Button>

                                    </Col>

                                    <Col>
                                        <Button
                                            type="primary"
                                            onClick={handleOpenSign}
                                            disabled={selectedDelegations.length === 0}
                                            style={{
                                                background: "#52c41a",
                                                borderColor: "#52c41a",
                                                color: "white"
                                            }}
                                        >
                                            Ký số
                                        </Button>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </Card>
                </Spin>
            </Modal>

            {/* MODAL XEM CHI TIẾT */}
            <Modal
                open={!!detailView}
                onCancel={() => setDetailView(null)}
                centered
                width={720}   // ★ RỘNG HƠN — HỢP MÀN HÌNH LỚN
                title={
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #d9f7be, #b7eb8f)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <EyeOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>
                            Chi tiết ủy quyền
                        </span>
                        <b />

                    </div>
                }
                footer={[
                    <Button
                        key="close"
                        type="primary"
                        style={{
                            background: "#52c41a",
                            borderColor: "#52c41a",
                            paddingInline: 32,
                            height: 40,
                            fontWeight: 500,
                            fontSize: 15,
                        }}
                        onClick={() => setDetailView(null)}
                    >
                        Đóng
                    </Button>,
                ]}
            >
                {detailView && (
                    <div style={{ padding: "8px 6px" }}>

                        {/* --- GRID 2 CỘT --- */}
                        <Row gutter={20}>

                            {/* --- CARD NGƯỜI ỦY QUYỀN --- */}
                            <Col span={12}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        marginBottom: 18,
                                        background: "#f6ffed",
                                        borderColor: "#b7eb8f",
                                        height: "100%",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                                            {detailView.delegator.fullName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: 17, color: "#389e0d" }}>
                                                Người ủy quyền
                                            </Text>
                                            <div style={{ fontSize: 13, color: "#777" }}>
                                                Thông tin cá nhân & liên hệ
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{ margin: "14px 0" }} />

                                    <div style={{ lineHeight: "1.9" }}>
                                        <p><strong>Họ và tên:</strong> {detailView.delegator.fullName}</p>
                                        <p><strong>Email:</strong> {detailView.delegator.email}</p>
                                        <p><strong>Số điện thoại:</strong> {detailView.delegator.phone}</p>
                                        <p><strong>Địa chỉ:</strong> {detailView.delegator.address}</p>
                                        <p><strong>Vị trí:</strong> {detailView.delegator.position}</p>
                                    </div>
                                </Card>
                            </Col>

                            {/* --- CARD NGƯỜI ĐƯỢC ỦY QUYỀN --- */}
                            <Col span={12}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        marginBottom: 18,
                                        background: "#edf9ff",
                                        borderColor: "#91d5ff",
                                        height: "100%",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
                                            {detailView.delegate.fullName?.charAt(0) || "D"}
                                        </div>
                                        <div>
                                            <Text strong style={{ fontSize: 17, color: "#096dd9" }}>
                                                Người được ủy quyền
                                            </Text>
                                            <div style={{ fontSize: 13, color: "#777" }}>
                                                Thông tin liên hệ & vai trò
                                            </div>
                                        </div>
                                    </div>

                                    <Divider style={{ margin: "14px 0" }} />

                                    <div style={{ lineHeight: "1.9" }}>
                                        <p><strong>Họ và tên:</strong> {detailView.delegate.fullName}</p>
                                        <p><strong>Email:</strong> {detailView.delegate.email}</p>
                                        <p><strong>Số điện thoại:</strong> {detailView.delegate.phone}</p>
                                        <p><strong>Địa chỉ:</strong> {detailView.delegate.address}</p>
                                        <p><strong>Vị trí:</strong> {detailView.delegate.position}</p>
                                    </div>
                                </Card>
                            </Col>

                        </Row>

                        {/* --- NGÀY TẠO --- */}
                        <div style={{ padding: "12px 6px" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Loại ủy quyền
                            </Text>
                            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                                {detailView?.delegstionType}
                            </div>
                        </div>
                        <div style={{ padding: "12px 6px" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Ngày tạo
                            </Text>
                            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                                {detailView.createdAt}
                            </div>
                        </div>
                        <div style={{ padding: "12px 6px" }}>
                            <Text type="secondary" style={{ fontSize: 14 }}>
                                Lý do ủy quyền
                            </Text>
                            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 4 }}>
                                {detailView.delegateReason}
                            </div>
                        </div>


                        <Divider />

                        <div style={{ fontSize: 13, color: "#888", textAlign: "center" }}>
                            <i>Thông tin được trích xuất tự động từ hồ sơ ủy quyền.</i>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL KÝ SỐ */}
            <DigitalSignModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleDigitalSign}
            />
            <Modal
                title="Từ chối ủy quyền"
                open={rejectModalOpen}
                onCancel={() => setRejectModalOpen(false)}
                onOk={handleReject}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true }}
                width={650}
            >
                <p style={{ marginBottom: 10 }}>
                    Bạn đang từ chối <strong>{selectedDelegations.length}</strong> ủy quyền.
                    Vui lòng nhập lý do cho từng ủy quyền:
                </p>

                <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 5 }}>
                    {selectedDelegations.map((id) => {
                        const info = mappedList.find((row) => row.id === id);

                        return (
                            <div
                                key={id}
                                style={{
                                    marginBottom: 16,
                                    padding: "12px 14px",
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    background: "#fafafa"
                                }}
                            >
                                <p style={{ marginBottom: 6 }}>
                                    <strong>Người ủy quyền:</strong>{" "}
                                    {info?.delegator.fullName || "Không rõ"}
                                </p>

                                <Input.TextArea
                                    rows={3}
                                    placeholder="Nhập lý do từ chối cho ủy quyền này..."
                                    value={rejectReasons[id] || ""}
                                    onChange={(e) =>
                                        setRejectReasons((prev) => ({
                                            ...prev,
                                            [id]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        );
                    })}

                </div>
            </Modal>
            <Modal
                title="Từ chối ủy quyền"
                open={reject1ModalOpen}
                onCancel={() => setReject1ModalOpen(false)}
                onOk={handleReject1}
                okText="Xác nhận từ chối"
                okButtonProps={{ danger: true }}
                width={650}
            >
                <p style={{ marginBottom: 10 }}>
                    Bạn đang từ chối <strong>{selectedDelegations.length}</strong> ủy quyền.
                    Vui lòng nhập lý do cho từng ủy quyền:
                </p>

                <div style={{ maxHeight: 400, overflowY: "auto", paddingRight: 5 }}>
                    {delegationsToReject.map((id) => {
                        const info = mappedList.find((row) => row.id === id);

                        return (
                            <div
                                key={id}
                                style={{
                                    marginBottom: 16,
                                    padding: "12px 14px",
                                    border: "1px solid #eee",
                                    borderRadius: 8,
                                    background: "#fafafa"
                                }}
                            >
                                <p style={{ marginBottom: 6 }}>
                                    <strong>Người ủy quyền:</strong>{" "}
                                    {info?.delegator.fullName || "Không rõ"}
                                </p>

                                <Input.TextArea
                                    rows={3}
                                    placeholder="Nhập lý do từ chối cho ủy quyền này..."
                                    value={rejectReasons[id] || ""}
                                    onChange={(e) =>
                                        setRejectReasons((prev) => ({
                                            ...prev,
                                            [id]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        );
                    })}

                </div>
            </Modal>

            <Modal
                open={warningModalOpen}
                title={
                    <span style={{ color: "red", fontWeight: 600 }}>
                        ⚠️ Cảnh báo quan trọng
                    </span>
                }
                centered
                okText="Đã hiểu"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}   // nút OK màu đỏ
                onOk={() => {
                    setWarningModalOpen(false);
                    setReject1ModalOpen(true);
                }}
                onCancel={() => {
                    setWarningModalOpen(false);
                }}
            >
                <div
                    style={{
                        background: "#fff1f0",       // nền đỏ nhạt cảnh báo
                        border: "1px solid #ffa39e",
                        padding: "12px 16px",
                        borderRadius: 8,
                    }}
                >
                    <p style={{
                        fontSize: 15,
                        color: "#cf1322",
                        margin: 0,
                        lineHeight: "22px"
                    }}>
                        Các ủy quyền <strong>không được chọn</strong> sẽ bị
                        <strong> bắt buộc từ chối</strong>.<br />
                        Bạn phải nhập <strong>lý do từ chối cho từng ủy quyền </strong>
                        trước khi thực hiện ký số.
                    </p>
                </div>
            </Modal>

        </>
    );
};

export default AuthorizationDetailModal;
