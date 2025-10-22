import { Card, Typography, Avatar } from "antd";
import { SmileOutlined } from "@ant-design/icons";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const WelcomeCard = () => (
    <Card className="voter-welcome-card">
        <Text strong className="voter-welcome-title">👋 Chào mừng trở lại!</Text>
        <p className="voter-welcome-subtitle">
            Công thông tin bầu cử điện tử
        </p>

        <div className="voter-welcome-user">
            <Avatar size={70} icon={<SmileOutlined />} />
            <div>
                <Text strong className="voter-user-name">Nguyễn Văn An</Text>
                <div className="voter-user-info">
                    Mã cử tri: CT-2105-001234 | Khu vực: Quận Hoàn Kiếm, Hà Nội
                </div>
            </div>
        </div>
    </Card>
);

export default WelcomeCard;
