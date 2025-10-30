import { Card, Button } from "antd";
import {
    EditOutlined,
    FileExcelOutlined,
    UserAddOutlined,
    ProfileOutlined,
} from "@ant-design/icons";

const DelegateManagement: React.FC = () => {
    return (
        <Card
            className="delegate-card"
            title={
                <span className="delegate-title">
                    <ProfileOutlined className="delegate-icon" />
                    Quản lý Danh sách Đại biểu
                </span>
            }
            bordered={false}
        >
            <Button block icon={<EditOutlined />} className="delegate-btn">
                Xem & Chỉnh sửa Danh sách
            </Button>

            <Button block icon={<FileExcelOutlined />} className="delegate-btn">
                Nhập từ file Excel
            </Button>

            <Button block icon={<UserAddOutlined />} className="delegate-btn">
                Thêm Đại biểu mới
            </Button>
        </Card>
    );
};

export default DelegateManagement;
