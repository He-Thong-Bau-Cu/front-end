import { Card, Input, DatePicker, TimePicker, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";

const { Text } = Typography;

const MeetingInfo: React.FC = () => {
    return (
        <Card title={<Text style={{ paddingLeft: 20, fontSize: 16 }}>📄 Thông tin Cuộc họp</Text>} className="meeting-card">
            <div className="form-item">
                <label>Tên cuộc họp</label>
                <Input placeholder="Nhập tên cuộc họp" />
            </div>

            <div className="form-row">
                <div className="form-item half">
                    <label>Ngày</label>
                    <DatePicker style={{ width: "100%" }} defaultValue={undefined} />
                </div>
                <div className="form-item half">
                    <label>Thời gian</label>
                    <TimePicker style={{ width: "100%" }} defaultValue={undefined} />
                </div>
            </div>

            <div className="form-item">
                <label>Địa điểm</label>
                <Input placeholder="Nhập địa điểm" />
            </div>

            <div className="form-item">
                <label>Mô tả</label>
                <TextArea
                    rows={3}
                    placeholder="Mô tả thêm về cuộc họp"
                />
            </div>
        </Card>
    );
};

export default MeetingInfo;
