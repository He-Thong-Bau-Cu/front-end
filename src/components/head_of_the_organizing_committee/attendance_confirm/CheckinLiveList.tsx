import React from "react";
import { Card, Table, Tag, Empty } from "antd";
import {
    CheckCircleFilled,
    CloseCircleOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

interface AttendeeItem {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    checkInTime?: string;
    checkInTimeFormatted?: string;
    hasCheckedIn: boolean;
    hasBallot: boolean;
}

interface CheckinLiveListProps {
    recentCheckins: AttendeeItem[];
    onRefresh?: () => void;
}

const CheckinLiveList: React.FC<CheckinLiveListProps> = ({
    recentCheckins,
    onRefresh,
}) => {
    const columns: ColumnsType<AttendeeItem> = [
        {
            title: "STT",
            key: "index",
            width: 60,
            align: "center",
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Họ và tên",
            dataIndex: "name",
            key: "name",
            width: 200,
            render: (text: string) => <strong>{text}</strong>,
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
            width: 200,
            render: (text: string) => text || "-",
        },
        {
            title: "Số điện thoại",
            dataIndex: "phone",
            key: "phone",
            width: 150,
            render: (text: string) => text || "-",
        },
        {
            title: "Trạng thái Check-in",
            key: "checkinStatus",
            width: 180,
            align: "center",
            render: (_: any, record: AttendeeItem) => {
                if (record.hasCheckedIn) {
                    return (
                        <Tag
                            icon={<CheckCircleFilled />}
                            color="success"
                            style={{ padding: "4px 12px", fontSize: "13px" }}
                        >
                            Đã Check-in
                        </Tag>
                    );
                }
                return (
                    <Tag
                        icon={<CloseCircleOutlined />}
                        color="default"
                        style={{ padding: "4px 12px", fontSize: "13px" }}
                    >
                        Chưa Check-in
                    </Tag>
                );
            },
        },
        {
            title: "Thời gian Check-in",
            key: "checkInTime",
            width: 150,
            align: "center",
            render: (_: any, record: AttendeeItem) => {
                if (record.hasCheckedIn && record.checkInTimeFormatted) {
                    return (
                        <span style={{ color: "#52c41a", fontWeight: 500 }}>
                            {record.checkInTimeFormatted}
                        </span>
                    );
                }
                return <span style={{ color: "#999" }}>-</span>;
            },
        },
        {
            title: "Phiếu bầu cử",
            key: "ballotStatus",
            width: 150,
            align: "center",
            render: (_: any, record: AttendeeItem) => {
                if (record.hasBallot) {
                    return (
                        <Tag
                            icon={<FileTextOutlined />}
                            color="blue"
                            style={{ padding: "4px 12px", fontSize: "13px" }}
                        >
                            Đã có phiếu
                        </Tag>
                    );
                }
                return (
                    <Tag color="default" style={{ padding: "4px 12px", fontSize: "13px" }}>
                        Chưa có phiếu
                    </Tag>
                );
            },
        },
    ];

    return (
        <Card
            title="Danh sách Đại biểu"
            bordered={false}
            className="checkin-live-card"
            extra={
                <span style={{ fontSize: "12px", color: "#888", paddingRight: 30 }}>
                    Tổng: {recentCheckins.length} đại biểu
                </span>
            }
        >
            {recentCheckins.length === 0 ? (
                <Empty
                    description="Chưa có đại biểu nào"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
            ) : (
                <Table
                    columns={columns}
                    dataSource={recentCheckins}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} đại biểu`,
                    }}
                    scroll={{ x: 1000 }}
                    size="middle"
                />
            )}
        </Card>
    );
};

export default CheckinLiveList;
