import { Card, Input, Select, Button } from "antd";
import { SearchOutlined, InboxOutlined } from "@ant-design/icons";
import "../../../style/board-of-control/DashBoard.model.css"
export default function ReportStorage() {
  return (
    <div className="rs-card">
      {/* Header */}
      <div className="rs-header">
        <InboxOutlined className="rs-header-icon" />
        <h3 className="rs-header-title">Kho Báo cáo & Lưu trữ</h3>
      </div>

      {/* Form */}
      <div className="rs-body">
        <div className="rs-field">
          <label className="rs-label">Tìm kiếm theo tên</label>
          <Input
            placeholder="VD: Báo cáo tài chính Q3..."
            className="rs-input"
          />
        </div>

        <div className="rs-field">
          <label className="rs-label">Loại báo cáo</label>
          <Select defaultValue="Tất cả" className="rs-select" style={{ width: "100%" }}>
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="finance">Tài chính</Select.Option>
            <Select.Option value="audit">Kiểm toán</Select.Option>
          </Select>
        </div>

        <Button className="rs-btn" icon={<SearchOutlined />}>
          Tìm kiếm
        </Button>
      </div>
    </div>
  );
}