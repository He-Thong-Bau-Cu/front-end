import React, { useState, useEffect, useRef } from "react";
import { Input, Select, Row, Col } from "antd";
import { ReportArchiveFilter } from "@/types/ReportArchive.interface";

interface Props {
  onSearch: (values: Partial<ReportArchiveFilter>) => void;
  availableTypes: string[];
}

export default function ArchiveSearchBar({ onSearch, availableTypes }: Props) {
  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("Tất cả");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Tự động tìm kiếm khi các filter thay đổi
  useEffect(() => {
    // Clear timer cũ nếu có
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce 300ms để tránh gọi quá nhiều lần
    debounceTimer.current = setTimeout(() => {
      onSearch({
        keyword,
        type,
      });
    }, 300);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, type, onSearch]);

  return (
    <div className="ra-search-card">
      <Row gutter={[16, 0]} align="middle">
        <Col xs={24} sm={16} md={18} lg={20}>
          <Input
            placeholder="Tìm kiếm theo tên báo cáo hoặc Mã Lưu trữ"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="ra-input"
            allowClear
          />
        </Col>

        <Col xs={24} sm={8} md={6} lg={4}>
          <Select
            value={type}
            onChange={(val) => setType(val)}
            className="ra-select"
            style={{ width: "100%" }}
          >
            <Select.Option value="Tất cả">Tất cả</Select.Option>
            {availableTypes.map((typeOption) => (
              <Select.Option key={typeOption} value={typeOption}>
                {typeOption}
              </Select.Option>
            ))}
          </Select>
        </Col>
      </Row>
    </div>
  );
}