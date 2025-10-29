import { Card, Button, Typography, Avatar } from "antd";
import { FileTextOutlined, BarChartOutlined, UserOutlined } from "@ant-design/icons";


const { Text } = Typography;

const HeaderStats = () => (
    <Card className="dashboard-header-card">
        <div className="dashboard-header-content">
            <div className="dashboard-header-left">
                <Text strong className="dashboard-header-title">Chủ tọa</Text>
                <p className="dashboard-header-subtitle">
                    Quản lý và giám sát toàn bộ quy trình bầu cử
                </p>

                <div className="dashboard-header-user">
                    <Avatar size={64} icon={<UserOutlined />} className="dashboard-avatar" />
                    <div className="dashboard-user-info">
                        <Text strong className="dashboard-user-name">PGS.TS Lưu Hồng Nhật</Text>
                        <p className="dashboard-user-role">Chủ tọa Hội đồng Bầu cử khóa 10</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-header-actions">
                <Button
                    icon={<FileTextOutlined />}
                    className="btn-create-decision"
                >
                    Tạo quyết định
                </Button>
                <Button
                    icon={<BarChartOutlined />}
                    className="btn-report-summary"
                >
                    Báo cáo tổng hợp
                </Button>
            </div>
        </div>
    </Card>
);

export default HeaderStats;
