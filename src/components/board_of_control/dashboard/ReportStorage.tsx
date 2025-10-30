import { Card, Input, Select, Button } from "antd";
import { SearchOutlined, InboxOutlined } from "@ant-design/icons";

export default function ReportStorage() {
  return (
    <Card className="bks-card">
      <h3 className="bks-section-title">
        <InboxOutlined /> Kho Báo cáo & Lưu trữ
      </h3>

      <Input
        placeholder="Tìm kiếm theo tên"
        className="bks-input"
        style={{ marginBottom: 10 }}
      />

      <Select defaultValue="Tất cả" className="bks-select" style={{ width: "100%" }}>
        <Select.Option value="all">Tất cả</Select.Option>
        <Select.Option value="finance">Tài chính</Select.Option>
        <Select.Option value="audit">Kiểm toán</Select.Option>
      </Select>

      <Button icon={<SearchOutlined />} type="default" className="bks-search-btn">
        Tìm kiếm
      </Button>
    </Card>
  );
}
