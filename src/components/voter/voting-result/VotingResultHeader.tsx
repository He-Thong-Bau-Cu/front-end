import React from "react";
import { Card, Button, Typography } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const VotingResultHeader: React.FC = () => {
    return (
        <Card className="voting-result-header-card">
            <div className="voting-result-header">
                <div>
                    <Title level={3}>Kết quả Bầu cử</Title>
                    <Text type="secondary">
                        Xem kết quả chi tiết các cuộc bầu cử đã hoàn thành
                    </Text>
                </div>

                <Button
                    icon={<ArrowLeftOutlined />}
                    className="voting-result-back-btn"
                >
                    Quay lại
                </Button>
            </div>
        </Card>
    );
};

export default VotingResultHeader;
