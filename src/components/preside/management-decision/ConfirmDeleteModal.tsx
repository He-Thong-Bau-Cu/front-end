import { Modal, Typography, Button } from "antd";

const { Text } = Typography;

interface ConfirmDeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ open, onConfirm, onCancel }) => {
  return (
    <Modal
      open={open}
      centered
      onCancel={onCancel}
      footer={null}
      className="confirm-delete-modal"
    >
      <div style={{ textAlign: "center", padding: "20px" }}>
        <Text strong style={{ fontSize: 16, color: "#124d2d" }}>
          Bạn có chắc chắn muốn xóa nghị quyết này không?
        </Text>
        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 16 }}>
          <Button onClick={onCancel}>Hủy</Button>
          <Button danger type="primary" onClick={onConfirm}>
            Xóa
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteModal;
