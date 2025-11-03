import { Card, Progress, Typography } from "antd";

const { Text } = Typography;

const CheckinSummary = () => (
    <Card className="checkin-summary-card" >
        <Text className="checkin-title" >Tổng tiến độ Check-in</Text>

        <div className="checkin-progress-wrapper">
            <Progress
                type="dashboard"
                percent={65}
                strokeColor={{
                    '0%': '#a0e635',
                    '100%': '#16a34a',
                }}
                trailColor="#f0f0f0"
                size={150}
                className="checkin-progress"
            />
        </div>

        <p className="checkin-total">
            <b>98 / 150 Đại biểu</b>
        </p>
    </Card>
);

export default CheckinSummary;
