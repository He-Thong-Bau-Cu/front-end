import { Card, Button } from "antd";
import {
    EditOutlined,
    FileExcelOutlined,
    UserAddOutlined,
    ProfileOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const DelegateManagement: React.FC = () => {
    const navigate = useNavigate();
    const handleNavigateToManageDelegates = () => {
        navigate("/organizing-committee/manage-delegates");
    };

    const handleOpenCreateDelegateModal = () => {
        handleNavigateToManageDelegates();
        setTimeout(() => {
            const createButton = document.getElementById("delegate-manual-add-button");
            if (createButton) {
                createButton.click();
            }
        }, 200);
    };

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
            <Button
                block
                icon={<EditOutlined />}
                className="delegate-btn"
                onClick={handleNavigateToManageDelegates}
            >
                Xem & Chỉnh sửa Danh sách
            </Button>

            <Button block icon={<FileExcelOutlined />} className="delegate-btn">
                Nhập từ file Excel
            </Button>

            <Button
                block
                icon={<UserAddOutlined />}
                className="delegate-btn"
                onClick={handleOpenCreateDelegateModal}
            >
                Thêm Đại biểu mới
            </Button>
        </Card>
    );
};

export default DelegateManagement;
