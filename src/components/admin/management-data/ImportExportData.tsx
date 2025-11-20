import {
  Card,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  InputNumber,
  DatePicker,
} from "antd";
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type {
  BackupExportPayload,
  BackupSearchPayload,
  ImportBackupPayload,
} from "@/types/DataManagement.interface";
import "@/style/admin/ManagementData.model.css";

const { Text } = Typography;
const { RangePicker } = DatePicker;

interface ImportExportDataProps {
  onImport: (payload: ImportBackupPayload) => Promise<void> | void;
  onExport: (payload: BackupExportPayload) => Promise<void> | void;
  importLoading?: boolean;
  exportLoading?: boolean;
  defaultFilters?: BackupSearchPayload;
}

const ImportExportData = ({
  onImport,
  onExport,
  importLoading,
  exportLoading,
  defaultFilters,
}: ImportExportDataProps) => {
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [importForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImportSubmit = async () => {
    try {
      const values = await importForm.validateFields();
      if (!importFile) {
        throw new Error("Vui lòng chọn tệp để nhập");
      }
      await onImport({
        tableName: values.tableName,
        action: values.action,
        recordId: values.recordId,
        note: values.note,
        dataBefore: values.dataBefore,
        dataAfter: values.dataAfter,
        file: importFile,
      });
      setImportModalVisible(false);
      setImportFile(null);
      importForm.resetFields();
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  };

  const handleExportSubmit = async () => {
    const values = await exportForm.validateFields();
    const payload: BackupExportPayload = {
      tableName: values.tableName,
      action: values.action,
      format: values.format,
    };
    if (values.range?.length === 2) {
      payload.fromDate = values.range[0].startOf("day").toISOString();
      payload.toDate = values.range[1].endOf("day").toISOString();
    }
    await onExport(payload);
    setExportModalVisible(false);
  };

  return (
    <>
      <Card
        className="import-export-card"
        style={{ padding: "20px 24px", borderRadius: 12, marginTop: 24 }}
        title={
          <span className="import-export-title" style={{ fontSize: 22.5 }}>
            📊 Chèn/Xuất dữ liệu
          </span>
        }
      >
        <div className="import-export-row">
          <div className="import-export-item">
            <div className="icon-box">
              <span className="icon" style={{ color: "#1677ff", fontSize: 64 }}>
                <CloudUploadOutlined />
              </span>
            </div>
            <div className="text">
              <strong>Nhập dữ liệu sao lưu</strong>
              <small>Tải file JSON/CSV được hệ thống hỗ trợ</small>
            </div>
            <Button
              type="primary"
              onClick={() => setImportModalVisible(true)}
              style={{ marginLeft: "auto" }}
            >
              Nhập dữ liệu
            </Button>
          </div>
          <div className="import-export-item">
            <div className="icon-box">
              <span className="icon" style={{ color: "#22c55e", fontSize: 64 }}>
                <CloudDownloadOutlined />
              </span>
            </div>
            <div className="text">
              <strong>Xuất dữ liệu sao lưu</strong>
              <small>Lọc theo bảng, hành động và thời gian</small>
            </div>
            <Button
              onClick={() => {
                exportForm.setFieldsValue({
                  tableName: defaultFilters?.tableName,
                  action: defaultFilters?.action,
                  format: "csv",
                  range: undefined,
                });
                setExportModalVisible(true);
              }}
            >
              Xuất
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        title="Nhập dữ liệu sao lưu"
        open={importModalVisible}
        onOk={handleImportSubmit}
        onCancel={() => setImportModalVisible(false)}
        confirmLoading={!!importLoading}
        okText="Nhập dữ liệu"
        destroyOnClose
      >
        <Form layout="vertical" form={importForm}>
          <Form.Item
            label="Tên bảng"
            name="tableName"
            rules={[{ required: true, message: "Vui lòng nhập tên bảng" }]}
          >
            <Input placeholder="VD: users" />
          </Form.Item>
          <Form.Item label="Hành động" name="action">
            <Input placeholder="IMPORT / EXPORT / RESTORE..." />
          </Form.Item>
          <Form.Item label="Record ID" name="recordId">
            <InputNumber style={{ width: "100%" }} placeholder="ID tham chiếu" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={2} placeholder="Mô tả ngắn" />
          </Form.Item>
          <Form.Item label="Data trước khi thay đổi" name="dataBefore">
            <Input.TextArea rows={3} placeholder="JSON string" />
          </Form.Item>
          <Form.Item label="Data sau khi thay đổi" name="dataAfter">
            <Input.TextArea rows={3} placeholder="JSON string" />
          </Form.Item>
          <Form.Item label="Tệp dữ liệu">
            <Upload.Dragger
              maxCount={1}
              beforeUpload={(file) => {
                setImportFile(file);
                return false;
              }}
              onRemove={() => setImportFile(null)}
            >
              <p className="ant-upload-drag-icon">
                <CloudUploadOutlined />
              </p>
              <p className="ant-upload-text">
                Kéo thả hoặc nhấp để chọn file
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xuất dữ liệu sao lưu"
        open={exportModalVisible}
        okText="Xuất dữ liệu"
        onOk={handleExportSubmit}
        confirmLoading={!!exportLoading}
        onCancel={() => setExportModalVisible(false)}
      >
        <Form layout="vertical" form={exportForm}>
          <Form.Item label="Tên bảng" name="tableName">
            <Input placeholder="VD: users" />
          </Form.Item>
          <Form.Item label="Hành động" name="action">
            <Input placeholder="IMPORT / EXPORT / RESTORE..." />
          </Form.Item>
          <Form.Item label="Khoảng thời gian" name="range">
            <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Định dạng"
            name="format"
            initialValue="csv"
            rules={[{ required: true, message: "Vui lòng chọn định dạng" }]}
          >
            <Select
              options={[
                { label: "CSV", value: "csv" },
                { label: "JSON", value: "json" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ImportExportData;
