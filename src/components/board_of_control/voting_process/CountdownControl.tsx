import { Card, Typography, Button, Space } from "antd";
import { PlusOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { CountdownProps } from "../../../types/VottingProcess.interface";

const { Text } = Typography;

export default function CountdownControl({ timeLeft }: CountdownProps) {
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
        icon={<LockOutlined />}
        className="vd-close-btn"
      >
        ĐÓNG BỎ PHIẾU
      </Button>
    </Card>
  );
}