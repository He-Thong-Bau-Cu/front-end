import {
    Card,
    Input,
    Button,
    Select,
    Table,
    Tag,
    Space,
    Typography,
} from "antd";
import {
    SearchOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from "@ant-design/icons";
import type { Decision } from "@/types/Decision.interface";

const { Text } = Typography;
const { Option } = Select;



const data: Decision[] = [
    {
        key: "1",
        code: "QD-001/2025",
        title: "Triệu tập Quốc hội",
        election: "Bầu cử Quốc hội khóa XVI",
        date: "15/11/2025",
        location: "Hội trường A - Tòa nhà Quốc hội",
        level: "Cao",
        status: "Đã phê duyệt",
        createdAt: "01/10/2025",
        creator: "Nguyễn Văn A",
    },
    {
        key: "2",
        code: "QD-002/2025",
        title: "Triệu tập HĐND tỉnh",
        election: "Bầu cử HĐND cấp tỉnh",
        date: "20/11/2025",
        location: "Trụ sở UBND Tỉnh",
        level: "Cao",
        status: "Chờ duyệt",
        createdAt: "02/10/2025",
        creator: "Trần Thị B",
    },
    {
        key: "3",
        code: "QD-003/2025",
        title: "Triệu tập HĐND huyện",
        election: "Bầu cử HĐND cấp huyện",
        date: "25/11/2025",
        location: "Hội trường UBND Huyện",
        level: "Trung bình",
        status: "Bản nháp",
        createdAt: "03/10/2025",
        creator: "Lê Văn C",
    },
];

/* ----------------------------- COLUMNS ----------------------------- */
const columns = [
    {
        title: "SỐ QUYẾT ĐỊNH",
        dataIndex: "code",
        render: (text: string, record: Decision) => (
            <>
                <a>{text}</a>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {record.title}
                </Text>
            </>
        ),
    },
    { title: "KỲ BẦU CỬ", dataIndex: "election" },
    { title: "NGÀY TRIỆU TẬP", dataIndex: "date" },
    { title: "ĐỊA ĐIỂM", dataIndex: "location" },
    {
        title: "MỨC ĐỘ",
        dataIndex: "level",
        render: (level: string) => {
            const color =
                level === "Cao" ? "red" : level === "Trung bình" ? "gold" : "#2ecc71";
            return <Tag color={color}>{level}</Tag>;
        },
    },
    {
        title: "TRẠNG THÁI",
        dataIndex: "status",
        render: (status: string) => {
            const color =
                status === "Đã phê duyệt"
                    ? "green"
                    : status === "Chờ duyệt"
                        ? "orange"
                        : "gray";
            return <Tag color={color}>{status}</Tag>;
        },
    },
    { title: "NGÀY TẠO", dataIndex: "createdAt" },
    { title: "NGƯỜI TẠO", dataIndex: "creator" },
    {
        title: "THAO TÁC",
        render: () => (
            <Space>
                <Button size="small" icon={<EditOutlined />} />
                <Button size="small" danger icon={<DeleteOutlined />} />
            </Space>
        ),
    },
];

/* ----------------------------- COMPONENT ----------------------------- */
const DecisionTable = () => (
    <Card className="decision-table-card">
        {/* --- Thanh công cụ --- */}
        <div className="decision-toolbar">
            <Input
                placeholder="Tìm kiếm theo số quyết định, kỳ bầu cử..."
                prefix={<SearchOutlined />}
                style={{ width: 300 }}
            />
            <div className="decision-toolbar-actions">
                <Select defaultValue="Tất cả trạng thái" style={{ width: 180 }}>
                    <Option>Tất cả trạng thái</Option>
                    <Option>Đã phê duyệt</Option>
                    <Option>Chờ duyệt</Option>
                    <Option>Bản nháp</Option>
                    <Option>Từ chối</Option>
                </Select>
                <Button icon={<FileExcelOutlined />}>Xuất Excel</Button>
                <Button icon={<FilePdfOutlined />}>Xuất PDF</Button>
                <Button type="primary" icon={<PlusOutlined />} className="btn-create">
                    Tạo quyết định mới
                </Button>
            </div>
        </div>

        <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            bordered={false}
            className="decision-table"
        />
    </Card>
);

export default DecisionTable;
