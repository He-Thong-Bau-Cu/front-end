import { Card, Button } from "antd";
import { EditOutlined, FileTextOutlined} from "@ant-design/icons";
import { SignatureRequest } from "../../../types/DashBoardBoardOfControl.interface";
import "../../../style/board-of-control/DashBoard.model.css"
interface Props {
  data: SignatureRequest[];
}

export default function SignatureRequests({ data }: Props) {
  return (
    <div className="sr-card">
      {/* ===== HEADER ===== */}
      <div className="sr-header">
        <FileTextOutlined className="sr-header-icon" />
        <h3 className="sr-header-title">
          Yêu cầu Chờ Xác thực & Ký số ({data.length})
        </h3>
      </div>

      {/* ===== LIST ===== */}
      <div className="sr-list">
        {data.map((item, index) => (
          <div
            key={index}
            className={`sr-item ${index !== data.length - 1 ? "sr-divider" : ""}`}
          >
            <div className="sr-left">
              <div className="sr-title">{item.title}</div>
              <div className="sr-type">Loại: {item.type}</div>
            </div>

            <div className="sr-middle">
              Gửi lúc: <span>{item.time}</span>
            </div>

            <button className="sr-btn">
              <EditOutlined /> <span>Xem & Ký số</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}