import { UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Typography } from "antd";

const { Text } = Typography;

const CommitteeInfo = () => (
    <Card className="dashboard-header-card">
        <div className="dashboard-header-content">
            <div className="dashboard-header-left">
                <Text strong className="dashboard-header-title">Thành Viên ban tổ chức</Text>
                <p className="dashboard-header-subtitle">
                    Hỗ trợ trưởng ban tổ chức
                </p>

                <div className="dashboard-header-user">
                    <Avatar size={64} icon={<UserOutlined />} className="dashboard-avatar" />
                    <div className="dashboard-user-info">
                        <Text strong className="dashboard-user-name">Nhân viên Lưu Hồng Nhật</Text>
                        <p className="dashboard-user-role">Thành viên ban tổ chức: Hội đồng Bầu cử khóa 10</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-header-actions">
                <Button
                    className="btn-report-summary"
                >
                    + Tạo cuộc họp mới
                </Button>
            </div>
        </div>
    </Card>
);

export default CommitteeInfo;

