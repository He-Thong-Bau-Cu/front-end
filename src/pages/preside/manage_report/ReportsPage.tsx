import React, { useState } from "react";
import ReportFilter from "../../../components/preside/manage_report/ReportFilter";
import ReportList from "../../../components/preside/manage_report/ReportList";
import "../../../style/preside/Reports.model.css";
const ReportsPage: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("");

  return (
    <div className="reports-container">
      <ReportFilter
        searchValue={searchValue}
        onSearch={setSearchValue}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* 🔥 TRUYỀN CẢ SEARCH + FILTER */}
      <ReportList filter={activeTab} searchValue={searchValue} />
    </div>
  );
};

export default ReportsPage;
