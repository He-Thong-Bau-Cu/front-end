import { Select } from "antd";
import React from "react";

export default function ReportFilters() {
  return (
    <div className="rc-filters">
      <div className="rc-filter-group">
        <span className="rc-filter-label">Khoảng thời gian</span>
        <Select
          defaultValue="30 ngày qua"
          className="rc-select"
          options={[
            { label: "7 ngày qua", value: "7days" },
            { label: "30 ngày qua", value: "30days" },
            { label: "90 ngày qua", value: "90days" },
          ]}
        />
      </div>

      <div className="rc-filter-group">
        <span className="rc-filter-label">Cuộc bầu cử</span>
        <Select
          defaultValue="Tất cả"
          className="rc-select"
          options={[
            { label: "Tất cả", value: "all" },
            { label: "HĐQT", value: "hdqt" },
            { label: "BKS", value: "bks" },
          ]}
        />
      </div>
    </div>
  );
}
