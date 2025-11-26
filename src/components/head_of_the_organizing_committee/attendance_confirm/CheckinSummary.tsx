import React from "react";
import { Card, Progress, Typography } from "antd";

const { Text } = Typography;

interface CheckinSummaryProps {
    totalAttendees: number;
    checkedInCount: number;
    checkinPercent: number;
}

const CheckinSummary: React.FC<CheckinSummaryProps> = ({
    totalAttendees,
    checkedInCount,
    checkinPercent,
}) => {
    return (
        <Card className="checkin-summary-card">
            <Text className="checkin-title">Tổng tiến độ Check-in</Text>

            <div className="checkin-progress-wrapper">
                <Progress
                    type="dashboard"
                    percent={checkinPercent}
                    strokeColor={{
                        '0%': '#a0e635',
                        '100%': '#16a34a',
                    }}
                    trailColor="#f0f0f0"
                    size={150}
                    className="checkin-progress"
                    format={(percent) => `${percent}%`}
                />
            </div>

            <p className="checkin-total">
                <b>{checkedInCount} / {totalAttendees} Đại biểu</b>
            </p>
        </Card>
    );
};

export default CheckinSummary;
