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
    message,
} from "antd";
import {
    SearchOutlined,
    EyeOutlined,
    FileTextOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import { useState, useEffect } from "react";
import DelegationService from "@/services/DelegationService";
import AuthorizationDetailModal from "./AuthorizationDetailModal";
import { SummaryDelegate } from "@/types/SummaryDelegate.interface";
import FileService from "@/services/FileService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import { useNotification } from "@/contexts/NotificationContext";
const { Text } = Typography;
const { Option } = Select;

const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

// remove accents
const removeVietnameseTones = (str: string) => {
    if (!str) return "";
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
};

const AuthorizationTable = () => {
    const [data, setData] = useState<any[]>([]);
    const [rawData, setRawData] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailRecordId, setDetailRecordId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [monthFilter, setMonthFilter] = useState<string>("");
    const { notify } = useNotification();
    // Pagination state
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });

    const [signRecord, setSignRecord] = useState<any>(null);
    const [selectedDelegations, setSelectedDelegations] = useState<string[]>([]);
    const [signModalOpen, setSignModalOpen] = useState(false);
    const loadDelegation = async () => {
        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            if (search.trim()) params.textSearch = search.trim();
            const res = await DelegationService.getAllSummaryDelegation(params);
            const list = res?.data || [];
            setRawData(list);
            setData(list);
        } catch (err: any) {
            notify(err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDelegation();
    }, [statusFilter]);

    // debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadDelegation();
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // ================== MỞ MODAL CHI TIẾT ==================
    const openDetail = (record: any) => {
        setDetailRecordId(record?.election?._id);
        setSignRecord(record);
        setDetailOpen(true);
    };

    // ================== TẢI FILE ==================
    // const downloadUrlFile = async (data: SummaryDelegate) => {
    //     try {
    //         const response = await DelegationService.getSummaryDelegationPdf({
    //             secretaryId: "651f0a7c1f2b4d1a12345678",
    //             electionId: data?.election?._id,
    //             recipient: "Chủ tịch",
    //         });

    //         const blob = new Blob([response], { type: "application/pdf" });
    //         const url = URL.createObjectURL(blob);
    //         const a = document.createElement("a");
    //         a.href = url;
    //         a.download = "Danh_sach_uy_quyen.pdf";
    //         a.click();

    //         URL.revokeObjectURL(url);
    //     } catch (err: any) {
    //         notify(err.message, "error");
    //     }
    // };

    
    const downloadUrlFileSign = async (data: any) => {
        try {
            const data1 = await ElectionDocumentService.getDocumentByElectionId(
                data?.election?._id
            );
            const signedDocuments = data1.filter((item: any) => item?.type === "delegation-summary-signed");
            const response = await FileService.getSignedFile(signedDocuments[0]?.fileUrl);
            const blob = new Blob([response], { type: "application/pdf" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "Danh_sach_uy_quyen_da_ky.pdf";
            a.click();

            URL.revokeObjectURL(url);
        } catch (err: any) {
            notify(err.message, "error");
        }
    };

    // ================== FILTER CLIENT ==================
    const filteredData = data.filter((item) => {
        const text = search.trim().toLowerCase();
        const noAccentText = removeVietnameseTones(text);
        const decisionNumber = item?.election?.decisionNumber || "";
        const decisionName = item?.election?.decisionName || "";
        const delegationEnd = item?.election?.delegationEnd;
        if (text) {
            const d1 = decisionNumber.toLowerCase();
            const d2 = decisionName.toLowerCase();
            const nd1 = removeVietnameseTones(decisionNumber);
            const nd2 = removeVietnameseTones(decisionName);
            if (
                !(
                    d1.includes(text) ||
                    d2.includes(text) ||
                    nd1.includes(noAccentText) ||
                    nd2.includes(noAccentText)
                )
            ) {
                return false;
            }
        }
        if (monthFilter && delegationEnd) {
            const m = new Date(delegationEnd).getMonth() + 1;
            if (m.toString() !== monthFilter) return false;
        }

        return true;
    });
    const columns = [
        {
            title: "STT",
            width: 70,
            align: "center" as const,
            render: (_: any, __: any, index: number) =>
                (pagination.current - 1) * pagination.pageSize + (index + 1),
        },
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
            title: "Số ủy quyền",
            align: "center" as const,
            render: (r: any) => {
                const total = r.delegations?.length || 0;
                return (
                    <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
                        {total}
                    </Tag>
                );
            },
        },
        {
            title: "Hạn ủy quyền",
            render: (r: any) => (
                <Text strong className="white-nowrap">
                    {formatDate(r.election?.delegationEnd) || "—"}
                </Text>
            ),
        }
        ,
        {
            title: "Thao tác",
            render: (_: any, record: any) => {
                
                return (
                    <Space>
                        <Button
                            icon={<EyeOutlined style={{ fontSize: 16, color: "blue" }} />}
                            onClick={() => openDetail(record)}
                        >
                            Xem hoặc ký
                        </Button>
                        {record.status === "SIGNED" && (
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => downloadUrlFileSign(record)}
                            >
                                Tải tài liệu
                            </Button>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <Card
            style={{
                borderRadius: 20,
                padding: 20,
                margin: 30,
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
                        allowClear
                        onClear={() => setSearch("")}
                        style={{ width: 260, borderRadius: 8 }}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <Select
                        value={monthFilter}
                        style={{ width: 160 }}
                        onChange={(v) => setMonthFilter(v)}
                        placeholder="Lọc theo tháng"
                    >
                        <Option value="">Tất cả tháng</Option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <Option key={i + 1} value={(i + 1).toString()}>
                                Tháng {i + 1}
                            </Option>
                        ))}
                    </Select>
                </div>
            </div>

            {/* TABLE */}
            <Spin spinning={loading}>
                <Table
                    columns={columns}
                    dataSource={filteredData}
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

            {/* MODAL CHI TIẾT */}
            <AuthorizationDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                recordId={detailRecordId}
                onSelectApproved={(ids) => {
                    setSelectedDelegations(ids);
                    setSignModalOpen(true);
                }}
            />
        </Card>
    );
};

export default AuthorizationTable;
