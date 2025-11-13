import {
    Breadcrumb,
    Input,
    Button,
    Card,
    Row,
    Col,
    Space,
    Typography,
    Empty,
} from "antd";
import {
    AppstoreOutlined,
    UnorderedListOutlined,
    UploadOutlined,
    SearchOutlined,
    FolderFilled,
    FilePdfOutlined,
    FileExcelOutlined,
} from "@ant-design/icons";
import { useState, useMemo } from "react";

const { Text } = Typography;

interface DocumentItem {
    name: string;
    type: "folder" | "pdf" | "excel";
    size?: string;
    count?: number;
}

interface DocumentContentProps {
    activeFolder: string;
    selectedTypes: string[];
}

const dataByFolder: Record<string, DocumentItem[]> = {
    "Báo cáo Tài chính": [
        { name: "Năm 2025", type: "folder", count: 3 },
        { name: "Năm 2024", type: "folder", count: 12 },
        { name: "Báo cáo Q3-2025.pdf", type: "pdf", size: "2.1 MB" },
        { name: "PhanTichChiSo.xlsx", type: "excel", size: "876 KB" },
    ],
    "Cuộc họp HĐQT": [
        { name: "Biên bản họp tháng 9.pdf", type: "pdf", size: "1.2 MB" },
        { name: "Danh sách thành viên.xlsx", type: "excel", size: "623 KB" },
    ],
    "Kế hoạch Kinh doanh": [
        { name: "Chiến lược 2025.pdf", type: "pdf", size: "3.4 MB" },
        { name: "Dự toán ngân sách.xlsx", type: "excel", size: "954 KB" },
    ],
    "Nhân sự": [
        { name: "Danh sách nhân viên.xlsx", type: "excel", size: "1.1 MB" },
        { name: "Báo cáo đào tạo.pdf", type: "pdf", size: "2.3 MB" },
    ],
};

const DocumentContent: React.FC<DocumentContentProps> = ({
    activeFolder,
    selectedTypes,
}) => {
    const [search, setSearch] = useState("");

    const documents = dataByFolder[activeFolder] || [];

    /** ✅ Lọc tài liệu theo loại file được chọn + từ khóa tìm kiếm */
    const filteredDocs = useMemo(() => {
        let result = documents;

        // Nếu có chọn loại file thì lọc theo selectedTypes
        if (selectedTypes.length > 0) {
            result = result.filter((d) => {
                if (d.type === "pdf" && selectedTypes.includes("PDF")) return true;
                if (d.type === "excel" && selectedTypes.includes("Excel")) return true;
                if (d.type === "folder") return true; // luôn hiển thị folder
                return false;
            });
        }

        // Lọc theo nội dung tìm kiếm
        if (search.trim() !== "") {
            const keyword = search.toLowerCase();
            result = result.filter((d) => d.name.toLowerCase().includes(keyword));
        }

        return result;
    }, [documents, selectedTypes, search]);

    return (
        <div className="document-main">
            {/* ========== HEADER ========== */}
            <div className="document-header fancy-card">
                <Space>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder="Tìm kiếm file..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />

                </Space>
                <Button type="primary" icon={<UploadOutlined />} className="upload-btn">
                    Tải lên
                </Button>
            </div>

            {/* ========== DANH SÁCH FILE ========== */}
            <Row gutter={[20, 20]} className="document-grid">
                {filteredDocs.length > 0 ? (
                    filteredDocs.map((item, index) => (
                        <Col key={index} xs={24} sm={12} md={8} lg={6}>
                            <Card className="doc-item fancy-card">
                                <div className="doc-icon">
                                    {item.type === "folder" && (
                                        <FolderFilled style={{ color: "#F6C23E", fontSize: 46 }} />
                                    )}
                                    {item.type === "pdf" && (
                                        <FilePdfOutlined style={{ color: "#E74C3C", fontSize: 46 }} />
                                    )}
                                    {item.type === "excel" && (
                                        <FileExcelOutlined
                                            style={{ color: "#2ECC71", fontSize: 46 }}
                                        />
                                    )}
                                </div>

                                <div className="doc-info">
                                    <Text strong className="doc-name">
                                        {item.name}
                                    </Text>
                                    <p className="doc-meta">
                                        {item.type === "folder" ? `${item.count} mục` : item.size}
                                    </p>
                                </div>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col span={24} style={{ textAlign: "center", marginTop: 40 }}>
                        <Empty description="Không có tệp phù hợp" />
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default DocumentContent;
