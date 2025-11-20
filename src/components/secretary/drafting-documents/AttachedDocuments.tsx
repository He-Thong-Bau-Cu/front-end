import { useState } from "react";
import {
    Card,
    Button,
    Col,
    Modal,
    Form,
    Upload,
    Input,
    message,
    List,
} from "antd";
import {
    FilePdfOutlined,
    UploadOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import { useNotification } from "@/contexts/NotificationContext";

const { TextArea } = Input;

interface Props {
    onChange: (data: any[]) => void;
}

const AttachedDocuments: React.FC<Props> = ({ onChange }) => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [form] = Form.useForm();
    const { notify } = useNotification();

    /* ===========================================================
       CHỈ CHỌN FILE — KHÔNG UPLOAD
    ============================================================ */
    const handleUpload = (file: File) => {
        setFileObj(file);
        setFileName(file.name);
        return false; // không upload thật
    };

    /* ===========================================================
        ICON FILE
    ============================================================ */
    const iconByType = (name: string) => {
        if (!name) return <PaperClipOutlined />;
        if (name.endsWith(".pdf")) return <FilePdfOutlined style={{ color: "red" }} />;
        if (name.endsWith(".xlsx") || name.endsWith(".xls"))
            return <FileExcelOutlined style={{ color: "#217346" }} />;
        if (name.endsWith(".ppt") || name.endsWith(".pptx"))
            return <FilePptOutlined style={{ color: "#d24726" }} />;
        return <PaperClipOutlined />;
    };

    /* ===========================================================
        LƯU NHƯNG CHỈ VÀO STATE (LOCAL) — KHÔNG GỌI API
    ============================================================ */
    const handleSaveLocal = (values: any) => {
        if (!fileObj) {
            message.warning("Vui lòng chọn file trước!");
            return;
        }

        const newDoc = {
            id: Date.now(),
            title: values.title,
            content: values.content,
            remarks: values.remarks,
            fileName: fileName,
            fileObj: fileObj, // file thật để cha xử lý khi gửi duyệt
        };

        const updated = [...documents, newDoc];
        setDocuments(updated);
        onChange(updated); // 👉 trả dữ liệu về DraftingDocuments
        setModalOpen(false);
        form.resetFields();
        setFileObj(null);
        setFileName("");
    };

    /* ===========================================================
        XÓA LOCAL — KHÔNG GỌI API
    ============================================================ */
    const handleDeleteLocal = (id: number) => {
        const filtered = documents.filter((doc) => doc.id !== id);
        setDocuments(filtered);
        onChange(filtered);
    };

    return (
        <>
            <Card
                className="meeting-side-card"
                title={
                    <div className="card-header">
                        <span style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
                            📎 Tài liệu đính kèm
                        </span>
                        <Col>
                            <Button
                                icon={<UploadOutlined />}
                                type="link"
                                onClick={() => setModalOpen(true)}
                            >
                                Tải tài liệu lên
                            </Button>
                        </Col>
                    </div>
                }
            >
                {/* Danh sách tài liệu LOCAL */}
                <List
                    dataSource={documents}
                    renderItem={(item) => (
                        <List.Item
                            actions={[
                                <DeleteOutlined
                                    onClick={() => handleDeleteLocal(item.id)}
                                    style={{ color: "red" }}
                                />,
                            ]}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                {iconByType(item.fileName)}
                                <div>
                                    <p className="file-name">{item.fileName}</p>
                                    {item.title && (
                                        <span className="file-size" style={{ color: "#888" }}>
                                            {item.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            {/* Modal thêm tài liệu */}
            <Modal
                title="Tạo tài liệu mới"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
                width={600}
            >
                <Form layout="vertical" form={form} onFinish={handleSaveLocal}>
                    <Form.Item name="title" label="Tên tài liệu" rules={[{ required: true }]}>
                        <Input placeholder="Nhập tên tài liệu..." />
                    </Form.Item>

                    <Form.Item name="content" label="Mô tả tài liệu">
                        <TextArea rows={3} placeholder="Nhập mô tả..." />
                    </Form.Item>

                    <Form.Item label="File đính kèm">
                        <Upload beforeUpload={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>

                        {fileName && (
                            <p style={{ marginTop: 6 }}>
                                <b>Đã chọn:</b> {fileName}
                            </p>
                        )}
                    </Form.Item>

                    <Form.Item name="remarks" label="Ghi chú">
                        <TextArea rows={2} placeholder="Ghi chú..." />
                    </Form.Item>

                    <div style={{ textAlign: "right" }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu tài liệu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AttachedDocuments;
