import { Card, List } from "antd";
import {
    CheckCircleFilled,
    ExclamationCircleFilled,
    ClockCircleFilled,
} from "@ant-design/icons";

const liveData = [
    {
        id: "NV0078",
        name: "Nguyễn Thị Lan Anh",
        time: "10:18:31 AM",
        status: "success",
        reason: "",
    },
    {
        id: "NV0015",
        name: "Trần Minh Hoàng",
        time: "10:15:25 AM",
        status: "error",
        reason: "Mã QR không hợp lệ",
    },
    {
        id: "NV0012",
        name: "Lê Gia Bảo",
        time: "10:15:10 AM",
        status: "manual",
        reason: "Check-in thủ công",
    },
    {
        id: "NV0099",
        name: "Phạm Đức Trung",
        time: "10:14:58 AM",
        status: "success",
        reason: "",
    },
];

const CheckinLiveList = () => (
    <Card
        title="Luồng Check-in Trực tiếp"
        bordered={false}
        className="checkin-live-card"
    >
        <List
            dataSource={liveData}
            renderItem={(item) => (
                <List.Item className={`checkin-live-item ${item.status}`}>
                    <div className="checkin-live-left">
                        {item.status === "success" && (
                            <CheckCircleFilled className="icon-success" />
                        )}
                        {item.status === "error" && (
                            <ExclamationCircleFilled className="icon-error" />
                        )}
                        {item.status === "manual" && (
                            <ClockCircleFilled className="icon-manual" />
                        )}

                        <div className="checkin-info">
                            <b>{item.name}</b>
                            <p>
                                Mã ĐB: {item.id}
                                {item.reason && (
                                    <span className="checkin-reason"> | {item.reason}</span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="checkin-time">{item.time}</div>
                </List.Item>
            )}
        />
    </Card>
);

export default CheckinLiveList;
