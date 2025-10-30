import { Card, Button } from "antd";
import { EditOutlined, FileTextOutlined} from "@ant-design/icons";
import { SignatureRequest } from "../../../types/DashBoardBoardOfControl.interface";
import "../../../style/board-of-control/DashBoard.model.css"
interface Props {
  data: SignatureRequest[];
}

export default function SignatureRequests({ data }: Props) {
  return (
    <Card className="bks-card signature-card" bordered={false}>
      <div className="bks-card-header">
        <FileTextOutlined className="bks-card-icon" />
        <h3 className="bks-section-title">
          Yêu cầu Chờ Xác thực & Ký số ({data.length})
        </h3>
      </div>

      <div className="bks-request-list">
        {data.map((item, index) => (
          <div
            key={index}
            className={`bks-request-item ${
              index !== data.length - 1 ? "bks-request-divider" : ""
            }`}
          >
            {/* Cột trái */}
            <div className="bks-request-info">
              <div className="bks-request-title">{item.title}</div>
              <div className="bks-request-type">Loại: {item.type}</div>
            </div>

            {/* Cột giữa */}
            <div className="bks-request-time">
              Gửi lúc: <span>{item.time}</span>
            </div>

            {/* Cột phải */}
            <Button
              icon={<EditOutlined />}
              className="bks-request-btn"
              type="default"
            >
              Xem & Ký số
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}