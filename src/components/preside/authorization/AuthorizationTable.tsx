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
import { getUserLogin } from "@/utils/auth";
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
    const [isSystemPreside, setIsSystemPreside] = useState(true);
    const [currentElectionId, setCurrentElectionId] = useState<string | undefined>(undefined);
    const [userFetched, setUserFetched] = useState(false);

    // Lấy thông tin user và electionId
    useEffect(() => {
        const fetchUserAndElectionId = async () => {
            try {
                // Clear data trước khi fetch user để tránh hiển thị data sai
                setData([]);
                setRawData([]);

                const userData = await getUserLogin();
                const isSystemPresideValue = userData?.chairmanOfTheBoardOfDirectors === true;
                setIsSystemPreside(isSystemPresideValue);

                // Nếu không phải system preside, lấy electionId từ localStorage
                if (!isSystemPresideValue) {
                    const electionId = localStorage.getItem("currentElectionId") || undefined;
                    setCurrentElectionId(electionId);
                } else {
                    setCurrentElectionId(undefined);
                }
                setUserFetched(true);
            } catch (error) {
                console.error("Error fetching user:", error);
                setUserFetched(true);
            }
        };
        fetchUserAndElectionId();
    }, []);

    const loadDelegation = async () => {
        // Chỉ load khi đã fetch user xong
        if (!userFetched) return;

        setLoading(true);
        try {
            const params: any = {};
            if (statusFilter) params.status = statusFilter;
            if (search.trim()) params.textSearch = search.trim();
            // Nếu không phải system preside, chỉ lấy delegations của election hiện tại
            if (!isSystemPreside && currentElectionId) {
                params.electionId = currentElectionId;
            }
            const res = await DelegationService.getAllSummaryDelegation(params);
            const list = res?.data || [];
            setRawData(list);
            setData(list);
        } catch (err: any) {
            notify(err.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDelegation();
    }, [statusFilter, currentElectionId, userFetched, isSystemPreside]);

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
            notify(err.response?.data?.message, "error");
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

    const statusMap: { [key: string]: string } = {
        "PENDING": "Chờ xác nhận của thư ký",
        "CONFIRMED": "Chờ ký",
        "SIGNED": "Đã ký",
        "REJECTED": "Từ chối",
    };
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
                <a>{r.election?.decisionNumber || "—"}</a>
            ),
        },
        {
            title: "Tên cuộc ủy quyền",
            render: (r: any) => (
                <span>{r.election?.decisionName}</span>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status", render: (statusData: string) => {
                const color =
                    statusData === "PENDING"
                        ? "gold"
                        : statusData === "CONFIRMED"
                            ? "orange"
                            : statusData === "SIGNED"
                                ? "green"
                                : statusData === "REJECTED"
                                    ? "red"
                                    : "gray";
                return <Tag 
                style={{ padding: 10, cursor: "pointer", fontSize: 14}}
                color={color}>{statusMap[statusData] || statusData || "Chờ duyệt"}</Tag>;
            },
        },
        {
            title: "Hạn ủy quyền",
            render: (r: any) => (
                <Text className="white-nowrap">
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
                        <Tag
                            style={{ padding: 10, cursor: "pointer", fontSize: 14, border: "1px solid " }}
                            color="yellow"
                            icon={<EyeOutlined />}
                            onClick={() => openDetail(record)}
                        >
                            Xem hoặc ký
                        </Tag>
                        {record.status === "SIGNED" && (
                            <Tag
                                style={{ padding: 10, cursor: "pointer", fontSize: 14, border: "1px solid "}}
                                color="blue"
                                icon={<DownloadOutlined />}
                                onClick={() => downloadUrlFileSign(record)}
                            >
                                Tải tài liệu ký số
                            </Tag>
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
                data1={signRecord}
                onSelectApproved={(ids) => {
                    setSelectedDelegations(ids);
                    setSignModalOpen(true);
                }}
            />
        </Card>
    );
};

export default AuthorizationTable;
