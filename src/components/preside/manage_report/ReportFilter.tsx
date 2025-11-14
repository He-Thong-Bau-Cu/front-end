import { Input, Button } from "antd";
import "../../../style/preside/Reports.model.css";
interface ReportFilterProps {
  searchValue: string;
  onSearch: (v: string) => void;
  activeTab: string;
  onTabChange: (v: string) => void;
}
const ReportFilter: React.FC<ReportFilterProps> = ({
  searchValue,
  onSearch,
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { label: "Tất cả", value: "" },
    { label: "Báo cáo bình thường", value: "Normal" },
    { label: "Báo cáo bất bình thường", value: "Abnormal" },
    { label: "Báo cáo tổng kết", value: "Final" },
  ];

  return (
    <>
      <Input.Search
        placeholder="Tìm kiếm báo cáo theo tiêu đề hoặc mô tả..."
        className="reports-search"
        value={searchValue}
        onChange={(e) => onSearch(e.target.value)}
        allowClear
      />

      <div className="report-filter">
        {tabs.map((t) => (
          <Button
            key={t.value}
            type={activeTab === t.value ? "primary" : "default"}
            style={{
              background: activeTab === t.value ? "#b7eb8f" : "#fff",
              borderColor: "#b7eb8f",
              color: activeTab === t.value ? "#000" : "#666",
              fontWeight: 500,
              borderRadius: 6,
              padding: "0 20px",
              height: 36,
            }}
            onClick={() => onTabChange(t.value)}
          >
            {t.label}
          </Button>
        ))}
      </div>
    </>
  );
};

export default ReportFilter;
