import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Input,
  Button,
  Space,
  message,
  Spin,
  Alert
} from "antd";
import {
  CheckCircleOutlined,
  SafetyOutlined,
  FileOutlined
} from "@ant-design/icons";
import "../../style/digitalSignature/DigitalSignModal.model.css";
import { getUserLogin } from "@/utils/auth";
import FileService from "@/services/FileService";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { file: File; password: string }) => void;
}

const DigitalSignModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [fileName, setFileName] = useState("Đang tải chứng thư số...");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSignCa, setHasSignCa] = useState(false);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  // Load file từ signCa khi modal mở
  useEffect(() => {
    if (open) {
      loadCertificateFile();
    } else {
      // Reset khi đóng modal
      setFileObj(null);
      setFileName("Đang tải chứng thư số...");
      setPassword("");
      setError(null);
    }
  }, [open]);

  const loadCertificateFile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy thông tin user
      const user = await getUserLogin();
      const signCa = (user as any)?.signCa;

      if (!signCa) {
        setHasSignCa(false);
        setError("Bạn chưa có chứng thư số. Vui lòng truy cập vào hồ sơ cá nhân để đăng ký chứng thư số.");
        setFileName("Không tìm thấy chứng thư số");
        return;
      }

      setHasSignCa(true);

      // Load file từ minio
      showLoading();
      const blob = await FileService.getSignedFile(signCa);
      hideLoading();

      // Convert Blob thành File
      const file = new File([blob], "certificate.p12", { type: "application/x-pkcs12" });
      setFileObj(file);
      setFileName("certificate.p12");

    } catch (err: any) {
      console.error("Error loading certificate:", err);
      setError("Không thể tải chứng thư số. Vui lòng thử lại sau.");
      setFileName("Lỗi khi tải chứng thư số");
      notify(err?.message || "Không thể tải chứng thư số", "error");
      hideLoading();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!fileObj) {
      if (error) {
        return message.warning(error);
      }
      return message.warning("Đang tải chứng thư số, vui lòng đợi...");
    }
    if (!password.trim()) return message.warning("Vui lòng nhập mật khẩu");

    onSubmit({ file: fileObj, password });
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={520}
      className="digital-sign-modal"
    >
      {/* HEADER */}
      <div className="digital-sign-header">
        <SafetyOutlined className="digital-sign-icon" />
        <div>
          <Title level={4} className="digital-sign-title">
            Xác thực chữ ký số (CA)
          </Title>
          <div className="digital-subtitle">
            Vui lòng nhập chứng thư số và mật khẩu CA để thực hiện ký số.
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="digital-sign-body">
        {/* Chứng thư số */}
        <div className="field-group">
          <Text strong>Chứng thư số (.p12)</Text>
          <Spin spinning={loading}>
            <div style={{ position: "relative" }}>
              <Input
                value={fileName}
                readOnly
                className="file-input-display"
                prefix={<FileOutlined />}
                style={{
                  backgroundColor: fileObj ? "#f6ffed" : "#fff",
                  borderColor: fileObj ? "#b7eb8f" : undefined,
                }}
              />
            </div>
          </Spin>
          {error && (
            <Alert
              message={
                <div>
                  <div style={{ marginBottom: 8 }}>{error}</div>
                  {!hasSignCa && (
                    <div style={{ fontSize: 13, color: "#595959" }}>
                      <strong>Hướng dẫn:</strong> Vui lòng truy cập vào <strong>Hồ sơ cá nhân</strong> (icon avatar ở góc phải trên) để đăng ký chứng thư số.
                    </div>
                  )}
                </div>
              }
              type="error"
              showIcon
              style={{ marginTop: 8 }}
            />
          )}
          {!error && !loading && fileObj && (
            <Text type="success" className="hint" style={{ display: "block", marginTop: 8 }}>
              ✓ Đã tải chứng thư số thành công
            </Text>
          )}
          {!error && !loading && !fileObj && (
            <Text type="secondary" className="hint">
              Đang tải chứng thư số từ hệ thống...
            </Text>
          )}
        </div>

        {/* PASSWORD */}
        <div className="field-group">
          <Text strong>Mật khẩu chứng thư số</Text>
          <Input.Password
            placeholder="Nhập mật khẩu chứng thư số..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
            disabled={!fileObj || !!error}
          />
        </div>

        {/* INFO BOX */}
        <div className="doc-info-box">
          <Text>
            <strong>Thao tác:</strong> Ký số tài liệu & phê duyệt yêu cầu.
          </Text>
        </div>
      </div>

      {/* FOOTER */}
      <div className="digital-sign-footer">
        <Space>
          <Button className="cancel-btn" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            className="confirm-btn-s"
            onClick={handleConfirm}
            disabled={!fileObj || !!error || loading}
            title={!fileObj || !!error ? "Vui lòng đăng ký chứng thư số trong hồ sơ cá nhân trước khi ký" : ""}
          >
            Xác nhận ký
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DigitalSignModal;
