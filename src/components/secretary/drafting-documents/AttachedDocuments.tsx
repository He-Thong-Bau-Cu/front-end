import { useState } from "react";
import { Card, Upload, Button } from "antd";
import {
    FileExcelOutlined,
    FilePptOutlined,
    UploadOutlined,
    DeleteOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";

interface FileItem {
    name: string;
    size: string;
    type: string;
}

const initialFiles: FileItem[] = [
    { name: "BaoCao_Q3_2025.xlsx", size: "1.2 MB", type: "excel" },
    { name: "KeHoach_Q4_Presentation.pptx", size: "5.8 MB", type: "ppt" },
];

const iconByType = (type: string) => {
    if (type.includes("xls")) return <FileExcelOutlined style={{ color: "#217346", fontSize: 18 }} />;
    if (type.includes("ppt")) return <FilePptOutlined style={{ color: "#d24726", fontSize: 18 }} />;
    return <PaperClipOutlined style={{ color: "#333", fontSize: 18 }} />;
};

const AttachedDocuments: React.FC = () => {
    const [files, setFiles] = useState<FileItem[]>(initialFiles);

    // Hàm xử lý khi người dùng chọn file từ máy
    const handleUpload = (file: File) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
        const type =
            file.name.endsWith(".xlsx") || file.name.endsWith(".xls")
                ? "excel"
                : file.name.endsWith(".ppt") || file.name.endsWith(".pptx")
                    ? "ppt"
                    : "other";

        const newFile = { name: file.name, size: sizeMB, type };
        setFiles((prev) => [...prev, newFile]);
        return false; // không upload thật, chỉ hiển thị
    };

    const handleDelete = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    return (
        <Card
            className="meeting-side-card"
            title={
                <div className="card-header">
                    <span style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>📎 Tài liệu đính kèm</span>

                    {/* Nút tải lên thực tế */}
                    <Upload beforeUpload={handleUpload} showUploadList={false}>
                        <Button type="link" className="add-link" icon={<UploadOutlined />}>
                            Tải lên
                        </Button>
                    </Upload>
                </div>
            }
        >
            {files.map((f, i) => (
                <div key={i} className="file-item">
                    <div className="file-left">
                        {iconByType(f.type)}
                        <div>
                            <p className="file-name">{f.name}</p>
                            <span className="file-size">{f.size}</span>
                        </div>
                    </div>
                    <DeleteOutlined
                        onClick={() => handleDelete(i)}
                        style={{
                            color: "#888",
                            cursor: "pointer",
                            marginLeft: "auto",
                            fontSize: 16,
                        }}
                    />

                </div>
            ))}
        </Card>
    );
};

export default AttachedDocuments;
