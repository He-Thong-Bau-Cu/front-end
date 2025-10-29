import { Input, Button } from "antd";
import "../../../style/preside/Reports.model.css";

const ReportFilter = ({ searchValue, onSearch, activeTab, onTabChange }) => {
  const tabs = ["Tất cả", "Kết quả", "Cử tri"];

  return (
    <>
      <Input.Search
        placeholder="Tìm kiếm tên báo cáo..."
        className="reports-search"
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        allowClear
      />
      <div className="report-filter">
        {tabs.map((tab) => (
          <Button
            key={tab}
            type={tab === activeTab ? "primary" : "default"}
            style={{
              background: tab === activeTab ? "#b7eb8f" : "#fff",
              borderColor: "#b7eb8f",
              color: tab === activeTab ? "#000" : "#666",
              fontWeight: 500,
            }}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>
    </>
  );
};

export default ReportFilter;
