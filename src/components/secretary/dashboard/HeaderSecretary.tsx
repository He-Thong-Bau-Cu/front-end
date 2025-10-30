import { BarChartOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Typography } from "antd";


const { Text } = Typography;

const HeaderSecretary = () => (
    <Card className="dashboard-header-card">
        <div className="dashboard-header-content">
            <div className="dashboard-header-left">
                <Text strong className="dashboard-header-title">Thư ký chủ tọa</Text>
                <p className="dashboard-header-subtitle">
                    Hỗ trợ chủ tịch các công việc trong bầu cử
                </p>

                <div className="dashboard-header-user">
                    <Avatar size={64} icon={<UserOutlined />} className="dashboard-avatar" />
                    <div className="dashboard-user-info">
                        <Text strong className="dashboard-user-name">Nhân viên Lưu Hồng Nhật</Text>
                        <p className="dashboard-user-role">Thư ký Chủ tọa Hội đồng Bầu cử khóa 10</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-header-actions">
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

export default HeaderSecretary;
