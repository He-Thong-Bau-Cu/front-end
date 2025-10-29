import React, { useState } from "react";
import ReportFilter from "../../../components/preside/manage_report/ReportFilter";
import ReportList from "../../../components/preside/manage_report/ReportList";
import "../../../style/preside/Reports.model.css";

const ReportsPage = () => {
    const [searchValue, setSearchValue] = useState("");
    const [activeTab, setActiveTab] = useState("Tất cả");

    return (
        <div className="reports-container">
            <ReportFilter
                searchValue={searchValue}
                onSearch={setSearchValue}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />
            <ReportList filter={activeTab} />
        </div>
    );

};

export default ReportsPage;
