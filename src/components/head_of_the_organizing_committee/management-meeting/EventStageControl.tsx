import React from "react";
import { Card, Button } from "antd";
import {
    CheckCircleFilled,
    ClockCircleOutlined,
    StopOutlined,
    FlagOutlined,
} from "@ant-design/icons";

const EventStageControl: React.FC = () => {
    return (
        <Card bordered={false} className="stage-card">
            <h4 className="stage-title">Kiểm soát Quy trình & Giai đoạn</h4>

            <div className="stage-timeline">
                {/* Giai đoạn 1 */}
                <div className="stage-item completed">
                    <div className="stage-icon">
                        <CheckCircleFilled />
                    </div>
                    <div className="stage-content">
                        <strong>Giai đoạn Check-in</strong>
                        <p>Đã hoàn tất lúc 09:15 AM</p>
                    </div>
                </div>

                {/* Giai đoạn 2 */}
                <div className="stage-item completed">
                    <div className="stage-icon">
                        <CheckCircleFilled />
                    </div>
                    <div className="stage-content">
                        <strong>Phát biểu & Báo cáo</strong>
                        <p>Đã hoàn tất lúc 10:00 AM</p>
                    </div>
                </div>

                {/* Giai đoạn 3 */}
                <div className="stage-item active">
                    <div className="stage-icon">
                        <ClockCircleOutlined />
                    </div>
                    <div className="stage-content">
                        <strong>Giai đoạn Bỏ phiếu</strong>
                        <p>Đang diễn ra. Kết thúc dự kiến: 11:00 AM</p>

                        <Button
                            block
                            className="end-vote-btn"
                            icon={<FlagOutlined />}
                        >
                            KẾT THÚC GIAI ĐOẠN BỎ PHIẾU
                        </Button>
                    </div>
                </div>

                {/* Giai đoạn 4 */}
                <div className="stage-item pending">
                    <div className="stage-icon">
                        <StopOutlined />
                    </div>
                    <div className="stage-content">
                        <strong>Công bố Kết quả</strong>
                        <p>Chưa bắt đầu</p>
                    </div>
                </div>

                {/* Giai đoạn 5 */}
                <div className="stage-item pending">
                    <div className="stage-icon">
                        <StopOutlined />
                    </div>
                    <div className="stage-content">
                        <strong>Bế mạc</strong>
                        <p>Chưa bắt đầu</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventStageControl;
