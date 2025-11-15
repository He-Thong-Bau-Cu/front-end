import { useEffect, useState } from "react";
import {
    Card,
    Button,
    Row,
    Col,
    Modal,
    Form,
    Upload,
    Input,
    message
} from "antd";
import {
    FilePdfOutlined,
    DownloadOutlined,
    UploadOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    PaperClipOutlined
} from "@ant-design/icons";

import ElectionDocumentService from "@/services/ElectionDocumentService";
import { useNotification } from "@/contexts/NotificationContext";
const { TextArea } = Input;

const AttachedDocuments = () => {
    const [documents, setDocuments] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { notify } = useNotification();
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");

    const [form] = Form.useForm();

    const electionId = localStorage.getItem("currentElectionId");
    const preparedBy = localStorage.getItem("userId");

    // --- Load tài liệu ---
    const loadDocuments = async () => {
        // const res = await ElectionDocumentService.GetDocuments(electionId);
        // setDocuments(res.data || []);
    };
    const iconByType = (type: string) => {
        if (type.includes("xls")) return <FileExcelOutlined style={{ color: "#217346", fontSize: 18 }} />;
        if (type.includes("ppt")) return <FilePptOutlined style={{ color: "#d24726", fontSize: 18 }} />;
        return <PaperClipOutlined style={{ color: "#333", fontSize: 18 }} />;
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    // --- Chọn file ---
    const handleUpload = (file: File) => {
        setFileObj(file);
        setFileName(file.name);
        return false;
    };
    const handelDelete = async () => {
        try {



        } catch (error) {
            console.error(error);
            message.error("Lỗi xóa tài liệu!");

        }
    }

    // --- Lưu document ---
    const handleSave = async (values: any) => {
        if (!fileObj) {
            message.warning("Vui lòng tải tài liệu lên!");
            return;
        }

        try {
            setLoading(true);
            let body = {
                electionId: electionId,
                preparedBy: preparedBy,
                title: values.title,
                content: values.content,
                fileUrl: fileObj,
                status: "INACTIVE",
                remarks: values.remarks
            }
            const res = await ElectionDocumentService.CreateDocument(body);
            if (res.success) {
                notify(res.message, "success");
                message.success("Tạo tài liệu thành công!");
                setModalOpen(false);
                form.resetFields();
                setFileObj(null);
                setFileName("");
                loadDocuments();
            } else {
                notify(res.message, "error");
            }

        } catch (err) {
            console.error(err);
            message.error("Lỗi tạo tài liệu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card
                className="meeting-side-card"
                title={
                    <div className="card-header">
                        <span style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>📎 Tài liệu đính kèm</span>

                        {/* Nút tải lên thực tế */}
                        {/* <Upload beforeUpload={handleUpload} showUploadList={false}>
                            <Button type="link" className="add-link" icon={<UploadOutlined />}>
                                Tải lên
                            </Button>
                        </Upload> */}
                        <Col>
                            <Button
                                icon={<DownloadOutlined />}
                                type="link"
                                onClick={() => setModalOpen(true)} // mở modal
                            >
                                Tải tài liệu lên
                            </Button>
                        </Col>
                    </div>
                }
            >
                {documents.map((f, i) => (
                    <div key={i} className="file-item">
                        <div className="file-left">
                            {iconByType(f.type)}
                            <div>
                                <p className="file-name">{f.name}</p>
                                <span className="file-size">{f.size}</span>
                            </div>
                        </div>
                        <DeleteOutlined
                            onClick={() => handelDelete()}
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

            {/* Modal tạo document */}
            <Modal
                title="Tạo tài liệu mới"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                footer={null}
                centered
                width={600}
            >
                <Form layout="vertical" form={form} onFinish={handleSave}>
                    <Form.Item
                        name="title"
                        label="Tên tài liệu"
                        rules={[{ required: true, message: "Nhập tên tài liệu" }]}
                    >
                        <Input placeholder="Nhập tên tài liệu..." />
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="Mô tả tài liệu"
                        rules={[{ required: true, message: "Nhập mô tả" }]}
                    >
                        <TextArea rows={3} placeholder="Nhập mô tả..." />
                    </Form.Item>

                    <Form.Item label="File đính kèm">
                        <Upload beforeUpload={handleUpload} showUploadList={false}>
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                        {fileName && <p style={{ marginTop: 6 }}><b>Đã chọn:</b> {fileName}</p>}
                    </Form.Item>

                    <Form.Item name="remarks" label="Ghi chú">
                        <TextArea rows={2} placeholder="Ghi chú..." />
                    </Form.Item>

                    <div style={{ textAlign: "right" }}>
                        <Button onClick={() => setModalOpen(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Lưu tài liệu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </>
    );
};

export default AttachedDocuments;
