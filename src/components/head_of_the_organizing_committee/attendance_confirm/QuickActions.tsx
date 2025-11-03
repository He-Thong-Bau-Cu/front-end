import { Card, Button } from "antd";

const QuickActions = () => (
    <Card
        title="⚡ Hành động nhanh"
        bordered={false}
        className="quick-actions-card-track"
    >
        <div className="quick-actions-container">
            <Button className="quick-btn print-btn" block>
                🖨️ In lại thẻ
            </Button>
            <Button className="quick-btn report-btn" block>
                📑 Báo cáo sự cố
            </Button>
            <Button className="quick-btn support-btn" block>
                🛠️ Yêu cầu hỗ trợ kỹ thuật
            </Button>
        </div>
    </Card>
);

export default QuickActions;
