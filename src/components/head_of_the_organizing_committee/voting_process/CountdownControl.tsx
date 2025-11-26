import { Card, Typography, Button, Space, Modal, message } from "antd";
import { PlusOutlined, MailOutlined, LockOutlined, FlagOutlined } from "@ant-design/icons";
import { CountdownProps } from "../../../types/VottingProcess.interface";
import ElectionService from "@/services/ElectionService";

const { Text } = Typography;

interface CountdownControlProps extends CountdownProps {
  onRefresh?: () => void;
  isVotingCompleted?: boolean;
}

export default function CountdownControl({ timeLeft, onRefresh, isVotingCompleted = false }: CountdownControlProps) {
  const handleCloseVoting = () => {
    Modal.confirm({
      title: "Xác nhận kết thúc giai đoạn bỏ phiếu",
      content: "Bạn có chắc chắn muốn kết thúc giai đoạn bỏ phiếu? Sau khi kết thúc, không thể bỏ phiếu thêm.",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        const electionId = localStorage.getItem("currentElectionId");
        if (!electionId) {
          message.error("Không tìm thấy thông tin cuộc bầu cử");
          return;
        }
        try {
          await ElectionService.endStage(electionId, 'voting');
          message.success("Đã kết thúc giai đoạn bỏ phiếu");
          if (onRefresh) {
            onRefresh();
          }
        } catch (error: any) {
          console.error("Error ending voting stage:", error);
          message.error(error?.response?.data?.message || "Không thể kết thúc giai đoạn bỏ phiếu");
        }
      },
    });
  };

  return (
    <Card className="vd-card vd-control-card" bordered={false}>
      <Text className="vd-section-title">Điều khiển & Đếm ngược</Text>

      <div className="vd-timer-text">Thời gian còn lại</div>
      <div className="vd-timer-value">{timeLeft}</div>

      <Space className="vd-timer-actions">
        <Button icon={<PlusOutlined />} className="vd-light-btn">
          +5 phút
        </Button>
        <Button icon={<MailOutlined />} className="vd-light-btn">
          Gửi nhắc nhở
        </Button>
      </Space>

      <Button
        danger
        icon={<FlagOutlined />}
        className="vd-close-btn"
        onClick={handleCloseVoting}
        block
        disabled={isVotingCompleted}
      >
        ĐÓNG BỎ PHIẾU
      </Button>
    </Card>
  );
}
