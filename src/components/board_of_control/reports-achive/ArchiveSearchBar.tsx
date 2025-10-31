import React, { useState } from "react";
import dayjs from "dayjs";
import { Input, DatePicker, Select, Button, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";

interface Props {
  onSearch: (values: any) => void;
}

export default function ArchiveSearchBar({ onSearch }: Props) {
  const [keyword, setKeyword] = useState("");
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const [type, setType] = useState("Tất cả");
  const [event, setEvent] = useState("Tất cả");

  const handleSubmit = () => {
    onSearch({
      keyword,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : null,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : null,
      type,
      event,
    });
  };

  return (
    <div className="ra-search-card">
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            placeholder="Tìm kiếm theo Tên hoặc Mã Lưu trữ"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="ra-input"
          />
        </Col>

        <Col xs={24} md={6}>
          <DatePicker
            placeholder="Từ ngày"
            value={startDate}
            onChange={(val) => setStartDate(val)}
            className="ra-date"
            format="DD/MM/YYYY"
          />
        </Col>

        <Col xs={24} md={6}>
          <DatePicker
            placeholder="Đến ngày"
            value={endDate}
            onChange={(val) => setEndDate(val)}
            className="ra-date"
            format="DD/MM/YYYY"
          />
        </Col>

        <Col xs={24} md={6}>
          <Select
            value={type}
            onChange={(val) => setType(val)}
            className="ra-select"
            style={{ width: "100%" }}
          >
            <Select.Option value="Tất cả">Tất cả</Select.Option>
            <Select.Option value="Kết quả Bầu cử">Kết quả Bầu cử</Select.Option>
            <Select.Option value="Báo cáo Kiểm soát">Báo cáo Kiểm soát</Select.Option>
            <Select.Option value="Biên bản Họp">Biên bản Họp</Select.Option>
          </Select>
        </Col>

        <Col xs={24} md={6}>
          <Select
            value={event}
            onChange={(val) => setEvent(val)}
            className="ra-select"
            style={{ width: "100%" }}
          >
            <Select.Option value="Tất cả">Tất cả</Select.Option>
            <Select.Option value="Bầu cử HĐQT 2024">Bầu cử HĐQT 2024</Select.Option>
            <Select.Option value="ĐH Cổ đông 2024">ĐH Cổ đông 2024</Select.Option>
          </Select>
        </Col>

        <Col span={24}>
          <Button
            className="ra-btn-search"
            icon={<SearchOutlined />}
            onClick={handleSubmit}
          >
            Tìm kiếm
          </Button>
        </Col>
      </Row>
    </div>
  );
}