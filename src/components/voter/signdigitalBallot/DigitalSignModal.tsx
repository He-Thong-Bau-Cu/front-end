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
  message,
} from "antd";
import { UploadOutlined, CheckCircleOutlined, SafetyOutlined } from "@ant-design/icons";
import "@/style/digitalSignature/DigitalSignModal.model.css";

const { Title, Text } = Typography;

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DigitalSignModal: React.FC<Props> = ({ open, onClose, onConfirm }) => {
  const [fileName, setFileName] = React.useState<string>("Chưa chọn tệp nào...");

  const handleUpload = (file: any) => {    
    setFileName(file.name);
    message.success("Tệp đã được chọn.");
    return false; // Ngăn upload thật
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="digital-sign-modal"
      closable
    >
      <div className="digital-sign-header">
        <SafetyOutlined className="digital-sign-icon" />
        <Title level={4} className="digital-sign-title">
          Xác thực Ký số & Gửi
        </Title>
      </div>

      <div className="digital-sign-body">
        {/* Chứng thư số */}
        <div className="field-group">
          <Text strong>Chứng thư số (.p12)</Text>
          <Row gutter={8} align="middle" className="upload-row">
            <Col flex="auto">
              <Input value={fileName} readOnly />
            </Col>
            <Col>
              <Upload beforeUpload={handleUpload} showUploadList={false}>
                <Button icon={<UploadOutlined />}>Chọn Tệp</Button>
              </Upload>
            </Col>
          </Row>
          <Text type="secondary" className="hint">
            Vui lòng chọn tệp chứng thư số của bạn (định dạng .p12).
          </Text>
        </div>

        {/* Mật khẩu */}
        <div className="field-group">
          <Text strong>Mật khẩu Chứng thư số</Text>
          <Input.Password placeholder="Nhập mật khẩu..." />
        </div>

        {/* Mã OTP */}
        <div className="field-group">
          <Text strong>Mã xác nhận (OTP)</Text>
          <Input placeholder="– – – – – –" maxLength={6} />
          <Text type="secondary" className="hint">
            Mở ứng dụng xác thực hoặc kiểm tra SMS để lấy mã.
          </Text>
        </div>

        {/* Tài liệu */}
        <div className="doc-info-box">
          <Text>
            <strong>Hành động:</strong> Ký số & Phê duyệt
          </Text>
        </div>
      </div>

      {/* Footer */}
      <div className="digital-sign-footer">
        <Space>
          <Button className="cancel-btn" onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            className="confirm-btn-s"
            onClick={onConfirm}
          >
            Xác nhận Ký & Gửi
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DigitalSignModal;
