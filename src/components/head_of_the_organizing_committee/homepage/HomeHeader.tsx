import { Button, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const HomeHeader: React.FC = () => (
    <div className="home-header">
        <div>
            <Title level={3} style={{ margin: 0 }}>
                Hệ thống bầu cử
            </Title>
            <Text type="secondary">Sự lựa chọn của doanh nghiệp</Text>
        </div>

        <Button type="primary" icon={<PlusOutlined />} size="large" className="home-btn">
            Tạo cuộc họp mới
        </Button>
    </div>
);

export default HomeHeader;
