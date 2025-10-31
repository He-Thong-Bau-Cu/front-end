import React from "react";
import { Card, List } from "antd";

const SupportRequestCard: React.FC = () => {
    const requests = [
        { id: "NV0123", issue: "Mất kết nối" },
        { id: "NV0456", issue: "Quên mã PIN" },
    ];

    return (
        <Card bordered={false} className="support-card">
            <h4 className="support-title">Yêu cầu Hỗ trợ (2)</h4>

            <List
                dataSource={requests}
                className="support-list"
                renderItem={(item) => (
                    <List.Item
                        className="support-item"
                        actions={[
                            <a key="resolve" className="support-action">
                                Xử lý
                            </a>,
                        ]}
                    >
                        <span className="support-text">
                            Đại biểu <b>{item.id}</b> – {item.issue}
                        </span>
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default SupportRequestCard;
