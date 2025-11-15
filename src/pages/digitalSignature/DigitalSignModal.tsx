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
import {
  UploadOutlined,
  CheckCircleOutlined,
  SafetyOutlined,
} from "@ant-design/icons";
import "../../style/digitalSignature/DigitalSignModal.model.css";
import DelegationService from "@/services/DelegationService";
import { useNotification } from "@/contexts/NotificationContext";
import { useLoading } from "@/contexts/LoadingContext";

const { Title, Text } = Typography;


interface Props {
  open: boolean;
  electionId?: string;
  delegate: boolean;
  onClose: () => void;
  onSuccess: () => void; // callback khi ký thành công
}

const DigitalSignModal: React.FC<Props> = ({
  open,
  electionId,
  onClose,
  onSuccess,
  delegate
}) => {
  const [fileObj, setFileObj] = React.useState<File | null>(null);
  const [fileName, setFileName] = React.useState("Chưa chọn tệp nào...");
  const [password, setPassword] = React.useState("");
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  // Khi user chọn file p12
  const handleUpload = (file: File) => {
    setFileObj(file);       // <--- file thật
    setFileName(file.name); // tên file
    return false;           // không cho upload tự động
  };

  // Hàm ký số
  const handleSign = async () => {

    if (!fileObj) {
      message.warning("Vui lòng chọn file .p12");
      return;
    }
    if (!password.trim()) {
      message.warning("Vui lòng nhập mật khẩu ký số");
      return;
    }

    try {
      showLoading();
      const formData = new FormData();
      formData.append("file", fileObj);            // file gốc
      formData.append("electionId", electionId ? electionId : "");
      formData.append("password", password);
      let approve;
      if (delegate) {
        approve = await DelegationService.delegationApprove(formData);
      }
      if (approve.success) {
        notify(approve.message, "success");
      } else {
        notify(approve.message, "error");
      }
    } catch (err: any) {
      console.error("Lỗi ký số:", err);
      message.error("Ký số thất bại!");
    } finally {
      hideLoading()
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width={500}
      className="digital-sign-modal"
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
            Vui lòng chọn tệp chứng thư số của bạn (.p12)
          </Text>
        </div>

        {/* Mật khẩu */}
        <div className="field-group">
          <Text strong>Mật khẩu Chứng thư số</Text>
          <Input.Password
            placeholder="Nhập mật khẩu..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Thông tin */}
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
            onClick={handleSign}
          >
            Xác nhận Ký & Gửi
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default DigitalSignModal;
