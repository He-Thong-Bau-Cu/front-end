import DataStats from "@/components/admin/management-data/DataStats";
import ImportExportData from "@/components/admin/management-data/ImportExportData";
import DatabaseOverview from "@/components/admin/management-data/DatabaseOverview";
import "@/style/admin/ManagementData.model.css";

const ManagementData = () => {
  return (
    <div className="management-data-container">
      <DataStats />
      <ImportExportData />
      <DatabaseOverview />
    </div>
  );
};

export default ManagementData;
