import { Card, Typography } from "antd";
import { CountdownProps } from "../../../types/VottingProcess.interface";

const { Text } = Typography;

export default function CountdownControl({ timeLeft }: CountdownProps) {
  return (
    <Card className="vd-card vd-control-card" bordered={false}>
      <Text className="vd-section-title">Điều khiển & Đếm ngược</Text>

      <div className="vd-timer-text">Thời gian còn lại</div>
      <div className="vd-timer-value">{timeLeft}</div>


      {/* <Button
        danger
        icon={<LockOutlined />}
        className="vd-close-btn"
      >
        ĐÓNG BỎ PHIẾU
      </Button> */}
    </Card>
  );
}