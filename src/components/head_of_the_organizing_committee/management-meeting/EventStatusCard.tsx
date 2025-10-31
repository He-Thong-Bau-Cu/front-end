import React, { useEffect, useState } from "react";
import { Card, Button, Progress, Tag } from "antd";

const EventStatusCard: React.FC = () => {
    // tổng thời gian còn lại (giây)
    const [timeLeft, setTimeLeft] = useState(5140); // 1h25m40s
    const [isRunning, setIsRunning] = useState(true);

    // format về dạng HH:MM:SS
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
            .toString()
            .padStart(2, "0");
        const m = Math.floor((seconds % 3600) / 60)
            .toString()
            .padStart(2, "0");
        const s = Math.floor(seconds % 60)
            .toString()
            .padStart(2, "0");
        return `${h}:${m}:${s}`;
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning, timeLeft]);

    return (
        <Card bordered={false} className="event-status-card">
            <h4 className="event-status-title">Trạng thái Sự kiện</h4>

            <div className="event-status-content">
                <Tag className="event-status-tag">
                    {isRunning ? "ĐANG DIỄN RA" : "TẠM DỪNG"}
                </Tag>

                <h2 className="event-status-timer">{formatTime(timeLeft)}</h2>

                <div className="event-status-buttons">
                    <Button
                        className="pause-btn"
                        onClick={() => setIsRunning((prev) => !prev)}
                    >
                        {isRunning ? "⏸️ Tạm dừng Sự kiện" : "▶️ Tiếp tục Sự kiện"}
                    </Button>
                    <Button
                        className="stop-btn"
                        onClick={() => {
                            setIsRunning(false);
                            setTimeLeft(0);
                        }}
                    >
                        🛑 Kết thúc Sự kiện
                    </Button>
                </div>

                <div className="event-status-progress">
                    <div className="progress-row">
                        <span>Check-in:</span>
                        <Progress
                            percent={65}
                            size="small"
                            strokeColor="#6FCF97"
                            showInfo={false}
                        />
                        <span className="percent">65%</span>
                    </div>
                    <div className="progress-row">
                        <span>Bỏ phiếu:</span>
                        <Progress
                            percent={45}
                            size="small"
                            strokeColor="#2F80ED"
                            showInfo={false}
                        />
                        <span className="percent">45%</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EventStatusCard;
