import {
    Card,
    Input,
    Button,
    Select,
    Table,
    Tag,
    Space,
    Typography,
    Spin,
    Empty,
    message,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    EditOutlined,
    CheckOutlined,
    CloseOutlined,
    FileTextOutlined,
    DownloadOutlined,
} from "@ant-design/icons";

import { useState, useEffect } from "react";
import DelegationService from "@/services/DelegationService";
import { useLoading } from "@/contexts/LoadingContext";
import AuthorizationDetailModal from "./AuthorizationDetailModal";
import DigitalSignModal from "@/pages/digitalSignature/DigitalSignModal";
import { SummaryDelegate } from "@/types/SummaryDelegate.interface";
import { DelegationSummary } from "@/types/Delegate.interface";

const { Text } = Typography;
const { Option } = Select;

const statusMap: Record<string, string> = {
    PENDING: "Chờ duyệt",
    SIGNED: "Đã duyệt",
    REJECT: "Từ chối",
};

const statusColor: Record<string, string> = {
    PENDING: "orange",
    SIGNED: "green",
    REJECT: "red",
};
interface AuthorizationTable {
    onClose: () => void;
}

const AuthorizationTable: React.FC<AuthorizationTable> = ({
    onClose,
}) => {
    const [data, setData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [detailData, setDetailData] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [urlFile, setUrlFile] = useState<any>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const [electionId, setElectionId] = useState<any>(null);


    // ================= LOAD API =================
    const loadDelegation = async () => {
        setLoading(true);
        try {
            const res = await DelegationService.getAllSummaryDelegation({
                status: statusFilter || undefined,
                textSearch: search.trim() || undefined,
            });
            setData(res?.data || []);
        } catch {
            console.error("Không thể load dữ liệu");
        } finally {
            setLoading(false);
        }
    };
    const handleViewDecision = async (record: SummaryDelegate) => {
        try {
            showLoading();
            setModalOpen(true);
        } catch (error: any) {
            console.error("Error loading decision details:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.message ||
                "Không thể tải chi tiết quyết định. Vui lòng thử lại.";
            message.error(errorMessage);
            setModalOpen(false);
        } finally {
            hideLoading();
        }
    };

        const downloadUrlFile = async (data: SummaryDelegate) => {
            try {
                const response = await DelegationService.getSummaryDelegationPdf({
                    secretaryId: "651f0a7c1f2b4d1a12345678",
                    electionId: data?.election?._id,
                    recipient: "Chủ tịch"
                });
                const blob = new Blob([response], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
    
                const a = document.createElement("a");
                a.href = url;
                a.download = "Danh_sach_uy_quyen.pdf";
                a.click();
    
                URL.revokeObjectURL(url); // cleanup
            } catch (err) {
                console.error(err);
                message.error("Không thể tải file!");
            }
        };


    useEffect(() => {
        loadDelegation();
    }, [statusFilter]);

    useEffect(() => {
        const timer = setTimeout(loadDelegation, 400);
        return () => clearTimeout(timer);
    }, [search]);

    const reload = () => loadDelegation();

    // Open modal
    const openDetail = (record: any) => {
        setDetailData(record);
        setDetailOpen(true);
    };
    // ================= TABLE COLUMNS =================
    const columns = [
        {
            title: "Số quyết định",
            render: (r: any) => (
                <Text strong>{r.election?.decisionNumber || "—"}</Text>
            ),
        },
        {
            title: "Tên cuộc ủy quyền",
            render: (r: any) => (
                <span style={{ fontWeight: 500 }}>{r.election?.decisionName}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (st: string) => (
                <Tag color={statusColor[st]}>{statusMap[st]}</Tag>
            ),
        },
        {
            title: "Thao tác",
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined style={{ fontSize: 16 }} />}
                        onClick={() => {
                            setDetailRecordId(record);
                            setDetailOpen(true);
                        }}
                    />
                    {record.status === "SIGNED" ? (
                        <>
                            <Button
                                icon={<DownloadOutlined />}
                                style={{ marginRight: 12 }}
                                // onClick={downloadUrlFile}
                            >
                                Tải file
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                icon={<DownloadOutlined />}
                                style={{ marginRight: 12 }}
                                onClick={() => downloadUrlFile(record)}
                            >
                                Tải file
                            </Button>
                        </>
                    )}

                    {record.status === "PENDING" && (
                        <>
                            <Button
                                onClick={() => handleViewDecision(record)}
                                icon={<CheckOutlined />}
                                size="small"
                                style={{
                                    background: "#52c41a",
                                    color: "#fff",
                                    borderRadius: 6,
                                    padding: 15
                                }}
                            >
                                Phê duyệt
                            </Button>

                            <Button
                                icon={<CloseOutlined />}
                                size="small"
                                danger
                                style={{ borderRadius: 6, padding: 15 }}
                            >
                                Từ chối
                            </Button>
                        </>
                    )}
                </Space>
            ),
        },
    ];

    // ================= RENDER =================
    return (
        <Card
            style={{
                borderRadius: 14,
                padding: 24,
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
            }}
        >
            {/* HEADER */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 18,
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FileTextOutlined style={{ fontSize: 22, color: "#52c41a" }} />
                    <Text style={{ fontSize: 18, fontWeight: 600 }}>
                        Danh sách ủy quyền
                    </Text>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                    <Input
                        placeholder="Tìm kiếm tài liệu..."
                        prefix={<SearchOutlined />}
                        style={{ width: 260, borderRadius: 8 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <Select
                        value={statusFilter}
                        style={{ width: 170 }}
                        onChange={(v) => setStatusFilter(v)}
                    >
                        <Option value="">Tất cả trạng thái</Option>
                        <Option value="PENDING">Chờ duyệt</Option>
                        <Option value="SIGNED">Đã duyệt</Option>
                        <Option value="REJECT">Từ chối</Option>
                    </Select>
                </div>
            </div>

            {/* TABLE */}
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={data}
                    pagination={{ pageSize: 8 }}
                    rowKey="_id"
                    locale={{
                        emptyText: (
                            <Empty
                                description="Không có dữ liệu ủy quyền"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ),
                    }}
                    style={{ borderRadius: 10 }}
                />
            </Spin>

            {/* MODAL CHI TIẾT */}
            <AuthorizationDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                recordId={detailRecordId}

            />
            <DigitalSignModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                electionId={electionId}
                delegate={true}
                onSuccess={() => {
                    message.success("Ký số thành công!");
                    setModalOpen(false);
                    onClose(); // đóng modal A4
                }}
            />
        </Card>
    );
};

export default AuthorizationTable;
