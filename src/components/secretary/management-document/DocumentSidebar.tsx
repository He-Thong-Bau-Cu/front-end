import { Card, Checkbox } from "antd";
import {
    FolderOutlined,
    FolderOpenOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    FileImageOutlined,
} from "@ant-design/icons";

interface DocumentSidebarProps {
    activeFolder: string;
    onSelectFolder: (folder: string) => void;
    selectedTypes: string[];
    onSelectTypes: (types: string[]) => void;
}

const folders = [
    "Cuộc họp HĐQT",
    "Báo cáo Tài chính",
    "Kế hoạch Kinh doanh",
    "Nhân sự",
];

const fileTypes = [
    { label: "PDF", icon: <FileTextOutlined /> },
    { label: "Word", icon: <FileTextOutlined /> },
    { label: "Excel", icon: <FileExcelOutlined /> },
    { label: "Hình ảnh", icon: <FileImageOutlined /> },
];

const DocumentSidebar: React.FC<DocumentSidebarProps> = ({
    activeFolder,
    onSelectFolder,
    selectedTypes,
    onSelectTypes,
}) => {
    const handleTypeChange = (checkedValues: (string | number | boolean)[]) => {
        onSelectTypes(checkedValues as string[]);
    };


    return (
        <div className="document-sidebar">
            <Card className="sidebar-card fancy-card" style={{ paddingLeft: 20 }} title="📁 Thư mục">
                <ul className="folder-list">
                    {folders.map((f, i) => (
                        <li
                            key={i}
                            className={f === activeFolder ? "active-folder" : ""}
                            onClick={() => onSelectFolder(f)}
                        >
                            {f === activeFolder ? <FolderOpenOutlined /> : <FolderOutlined />}{" "}
                            {f}
                        </li>
                    ))}
                </ul>
            </Card>

            <Card className="sidebar-card fancy-card" style={{ paddingLeft: 20 }} title="📂 Loại file">
                <Checkbox.Group
                    value={selectedTypes}
                    onChange={handleTypeChange}
                    style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                    {fileTypes.map((t) => (
                        <Checkbox key={t.label} value={t.label}>
                            {t.icon} {t.label}
                        </Checkbox>
                    ))}
                </Checkbox.Group>
            </Card>
        </div>
    );
};

export default DocumentSidebar;
