import React from "react";
import {
  Modal,
  Typography,
  Upload,
  Input,
  Button,
  Space,
  Row,
  Col,
  message
} from "antd";
import {
  UploadOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from "@ant-design/icons";
import "../../style/digitalSignature/DigitalSignModal.model.css";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { file: File; password: string }) => void;
}

const DigitalSignModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const [fileObj, setFileObj] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState("Chưa chọn tệp nào...");
  const [password, setPassword] = React.useState("");

  const handleUpload = (file: File) => {
    setFileObj(file);
    setFileName(file.name);
    return false;
  };

  const handleConfirm = () => {
    if (!fileObj) return message.warning("Vui lòng chọn file .p12");
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
          <Row gutter={10} align="middle" className="upload-row">
            <Col flex="auto">
              <Input value={fileName} readOnly className="file-input-display" />
            </Col>
            <Col>
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />} className="file-btn">
                  Chọn tệp
                </Button>
              </Upload>
            </Col>
          </Row>
          <Text type="secondary" className="hint">
            Định dạng được hỗ trợ: .p12 (CA Token)
          </Text>
        </div>

        {/* PASSWORD */}
        <div className="field-group">
          <Text strong>Mật khẩu chứng thư số</Text>
          <Input.Password
            placeholder="Nhập mật khẩu chứng thư số..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="password-input"
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
          >
            Xác nhận ký
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DigitalSignModal;
