import { Card, Typography } from "antd";
import React from "react";

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

            </div>
        </Card>
    );
};

export default VotingResultHeader;
