import { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
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
  EditOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNotification } from "@/contexts/NotificationContext";
import FileService from "@/services/FileService";
import ElectionDocumentService from "@/services/ElectionDocumentService";
import { downloadBlob } from "@/utils/file";
import { useLoading } from "@/contexts/LoadingContext";

const { TextArea } = Input;

interface Props {
  onChange: (data: any[]) => void;
  electionId?: string;
  initialDocuments?: any[];
  disabled?: boolean;
}

const AttachedDocuments: React.FC<Props> = ({
  onChange,
  electionId,
  initialDocuments,
  disabled = false,
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [form] = Form.useForm();
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const { notify } = useNotification();
  const { showLoading, hideLoading } = useLoading();
  const userId = localStorage.getItem("userId") || "";

  // Track file đã upload nhưng chưa save (để cleanup khi cần)
  const uploadedFileUrlRef = useRef<string | null>(null);
  const isNewFileRef = useRef<boolean>(false);

  // Hàm xóa file trên server
  const deleteFileFromServer = async (fileUrl: string) => {
    try {
      if (fileUrl) {
        await FileService.deleteFileByKey(fileUrl);
        console.log("File deleted from server:", fileUrl);
      }
    } catch (error) {
      console.error("Error deleting file from server:", error);
      // Không throw error để không làm gián đoạn flow chính
    }
  };

  // Load existing documents - chỉ lọc những document có type là 'election-documents-important'
  useEffect(() => {
    if (initialDocuments && Array.isArray(initialDocuments)) {
      // Lọc chỉ lấy những document có type là 'election-documents-important'
      const filteredDocs = initialDocuments.filter(
        (doc: any) => doc.type === 'election-documents-important'
      );

      const mapped = filteredDocs.map((doc: any) => ({
        _id: doc._id,
        title: doc.title || "",
        content: doc.content || "",
        remarks: doc.remarks || "",
        fileUrl: doc.fileUrl || "",
        fileName: doc.fileUrl ? doc.fileUrl.split("/").pop() : "",
        type: doc.type || 'election-documents-important', // Đảm bảo có type
        isNew: false, // File đã load từ server nên không phải new
      }));
      setDocuments(mapped);
      onChange(mapped);
    }
  }, [initialDocuments]);

  // Cleanup khi component unmount - xóa file đã upload nhưng chưa save
  useEffect(() => {
    return () => {
      // Cleanup khi component unmount
      if (uploadedFileUrlRef.current && isNewFileRef.current) {
        deleteFileFromServer(uploadedFileUrlRef.current).catch((error) => {
          console.error("Error cleaning up file on unmount:", error);
        });
      }
    };
  }, []);

  /* ===========================================================
       CHỌN FILE VÀ UPLOAD NGAY LÊN MINIO
    ============================================================ */
  const handleUpload = async (file: File) => {
    setFileObj(file);
    setFileName(file.name);
    return false; // không upload tự động
  };

  const handleUploadToMinio = async (file: File): Promise<string> => {
    try {
      setUploading(true);
      console.log("file", file);
      let formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", "election-documents");
      formData.append("userId", userId);
      const response = await FileService.upfile(formData);

      // Response structure: { key: string }
      if (response && response.key) {
        // Lưu fileUrl tạm thời để cleanup nếu không save
        uploadedFileUrlRef.current = response.key;
        isNewFileRef.current = true;
        return response.key;
      }
      throw new Error("Upload failed - no key returned");
    } catch (error: any) {
      console.error("Error uploading file:", error);
      notify(
        "Lỗi khi upload file: " + (error.message || "Unknown error"),
        "error"
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /* ===========================================================
        ICON FILE
    ============================================================ */
  const iconByType = (name: string) => {
    if (!name) return <PaperClipOutlined />;
    if (name.endsWith(".pdf"))
      return <FilePdfOutlined style={{ color: "red" }} />;
    if (name.endsWith(".xlsx") || name.endsWith(".xls"))
      return <FileExcelOutlined style={{ color: "#217346" }} />;
    if (name.endsWith(".ppt") || name.endsWith(".pptx"))
      return <FilePptOutlined style={{ color: "#d24726" }} />;
    return <PaperClipOutlined />;
  };

  /* ===========================================================
        LƯU VÀO STATE SAU KHI UPLOAD FILE LÊN MINIO
    ============================================================ */
  const handleSaveLocal = async (values: any) => {
    if (!fileObj && !editingDoc) {
      message.warning("Vui lòng chọn file trước!");
      return;
    }

    try {
      let fileUrl = editingDoc?.fileUrl || "";
      let oldFileUrl: string | null = null;

      // Nếu có file mới, upload lên MinIO
      if (fileObj) {
        // Nếu đang edit và có file cũ, lưu lại để xóa sau
        if (editingDoc?.fileUrl) {
          oldFileUrl = editingDoc.fileUrl;
        }
        fileUrl = await handleUploadToMinio(fileObj);
      }

      const docData = {
        _id: editingDoc?._id || undefined, // Có _id nếu edit, không có nếu mới
        title: values.title,
        content: values.content || "",
        remarks: values.remarks || "",
        fileUrl: fileUrl,
        fileName: fileObj ? fileObj.name : editingDoc?.fileName || "",
        type: 'election-documents-important', // Đảm bảo type luôn là election-documents-important
        isNew: false, // Đã save rồi nên không còn là new
      };

      let updated: any[];
      if (editingDoc) {
        // Update existing
        updated = documents.map((doc) =>
          doc._id === editingDoc._id ? docData : doc
        );
      } else {
        // Add new
        updated = [...documents, docData];
      }

      setDocuments(updated);
      onChange(updated); // 👉 trả dữ liệu về DraftingDocuments

      // Reset refs vì đã save thành công
      uploadedFileUrlRef.current = null;
      isNewFileRef.current = false;

      // Xóa file cũ nếu có (khi edit và upload file mới)
      if (oldFileUrl) {
        await deleteFileFromServer(oldFileUrl);
      }

      setModalOpen(false);
      form.resetFields();
      setFileObj(null);
      setFileName("");
      setEditingDoc(null);
      message.success(
        editingDoc ? "Cập nhật tài liệu thành công" : "Thêm tài liệu thành công"
      );
    } catch (error) {
      console.error("Error saving document:", error);
      // Nếu save thất bại và có file đã upload, xóa file đó
      if (uploadedFileUrlRef.current && isNewFileRef.current) {
        await deleteFileFromServer(uploadedFileUrlRef.current);
        uploadedFileUrlRef.current = null;
        isNewFileRef.current = false;
      }
    }
  };

  const handleEdit = (doc: any) => {
    setEditingDoc(doc);
    form.setFieldsValue({
      title: doc.title,
      content: doc.content,
      remarks: doc.remarks,
    });
    setFileName(doc.fileName || "");
    setModalOpen(true);
  };

  /* ===========================================================
        XÓA LOCAL VÀ XÓA FILE TRÊN SERVER
    ============================================================ */
  const handleDeleteLocal = async (doc: any) => {
    // Xóa file trên server nếu có fileUrl
    if (doc.fileUrl) {
      await deleteFileFromServer(doc.fileUrl);
    }

    const filtered = documents.filter(
      (d) => d._id !== doc._id || (!d._id && d !== doc)
    );
    setDocuments(filtered);
    onChange(filtered);
  };

  // Cleanup file đã upload nhưng chưa save khi đóng modal
  const handleCloseModal = async () => {
    // Nếu có file đã upload nhưng chưa save, xóa file đó
    if (uploadedFileUrlRef.current && isNewFileRef.current) {
      await deleteFileFromServer(uploadedFileUrlRef.current);
      uploadedFileUrlRef.current = null;
      isNewFileRef.current = false;
    }

    setModalOpen(false);
    setEditingDoc(null);
    form.resetFields();
    setFileObj(null);
    setFileName("");
  };

  /* ===========================================================
        DOWNLOAD FILE
    ============================================================ */
  const handleDownload = async (doc: any) => {
    if (!doc.fileUrl) {
      notify("Không tìm thấy file để tải xuống", "warning");
      return;
    }

    try {
      showLoading();
      const blob = await FileService.downloadByKey(doc.fileUrl);
      const fileName = doc.fileName || doc.fileUrl.split("/").pop() || "document";
      downloadBlob(blob, fileName);
      notify("Tải file thành công", "success");
    } catch (error: any) {
      console.error("Error downloading file:", error);
      const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải file";
      notify(errorMessage, "error");
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <Card
        className="meeting-side-card"
        title={
          <div className="card-header">
            <span style={{ fontSize: 16, fontWeight: 500, paddingLeft: 20 }}>
              <PaperClipOutlined style={{ marginRight: 8 }} />
              Tài liệu đính kèm
            </span>
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <Button
                icon={<UploadOutlined />}
                type="link"
                disabled={disabled}
                onClick={() => !disabled && setModalOpen(true)}
              >
                Tải tài liệu lên
              </Button>
            </div>
          </div>
        }
      >
        {/* Danh sách tài liệu */}
        <List
          dataSource={documents}
          renderItem={(item) => (
            <List.Item
              actions={[
                <DownloadOutlined
                  onClick={() => handleDownload(item)}
                  style={{
                    color: "#52c41a",
                    marginRight: 8,
                    cursor: "pointer",
                    fontSize: 16
                  }}
                  title="Tải xuống"
                />,
                <EditOutlined
                  onClick={() => !disabled && handleEdit(item)}
                  style={{
                    color: disabled ? "#ccc" : "#1890ff",
                    marginRight: 8,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1
                  }}
                />,
                <DeleteOutlined
                  onClick={() => !disabled && handleDeleteLocal(item)}
                  style={{
                    color: disabled ? "#ccc" : "red",
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.5 : 1
                  }}
                />,
              ]}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {iconByType(item.fileName)}
                <div>
                  <p className="file-name">{item.title || item.fileName}</p>
                  {item.fileName && (
                    <span
                      className="file-size"
                      style={{ color: "#888", fontSize: 12 }}
                    >
                      {item.fileName}
                    </span>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Modal thêm/sửa tài liệu */}
      <Modal
        title={editingDoc ? "Chỉnh sửa tài liệu" : "Tạo tài liệu mới"}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSaveLocal}>
          <Form.Item
            name="title"
            label="Tên tài liệu"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên tài liệu..." disabled={disabled} />
          </Form.Item>

          <Form.Item name="content" label="Mô tả tài liệu">
            <TextArea rows={3} placeholder="Nhập mô tả..." disabled={disabled} />
          </Form.Item>

          <Form.Item label="File đính kèm">
            <Upload beforeUpload={handleUpload} showUploadList={false} disabled={disabled}>
              <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
                {editingDoc && !fileObj
                  ? "Chọn file mới (tùy chọn)"
                  : "Chọn file"}
              </Button>
            </Upload>

            {fileName && (
              <p style={{ marginTop: 6 }}>
                <b>Đã chọn:</b> {fileName}
              </p>
            )}
            {editingDoc && editingDoc.fileName && !fileObj && (
              <p style={{ marginTop: 6, color: "#888" }}>
                <b>File hiện tại:</b> {editingDoc.fileName}
              </p>
            )}
          </Form.Item>

          <Form.Item name="remarks" label="Ghi chú">
            <TextArea rows={2} placeholder="Ghi chú..." disabled={disabled} />
          </Form.Item>

          <div style={{ textAlign: "right" }}>
            <Button
              onClick={handleCloseModal}
              disabled={disabled}
              style={{ marginRight: 8 }}
            >
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={uploading} disabled={disabled}>
              {editingDoc ? "Cập nhật" : "Lưu tài liệu"}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AttachedDocuments;
