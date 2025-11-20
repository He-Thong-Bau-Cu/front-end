import { useEffect, useState } from "react";
import DataStats from "@/components/admin/management-data/DataStats";
import ImportExportData from "@/components/admin/management-data/ImportExportData";
import DatabaseOverview from "@/components/admin/management-data/DatabaseOverview";
import "@/style/admin/ManagementData.model.css";
import DataManagementService from "@/services/DataManagementService";
import type {
  BackupExportPayload,
  BackupRecord,
  BackupSearchPayload,
  DataManagementStats,
  ImportBackupPayload,
} from "@/types/DataManagement.interface";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import { downloadBlob } from "@/utils/file";
import FileService from "@/services/FileService";

const initialStats: DataManagementStats = {
  totalRecords: 0,
  uniqueTables: 0,
  latestBackupAt: null,
  latestActionBy: null,
  topAction: undefined,
  attachmentCount: 0,
};

const ManagementData = () => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  const [records, setRecords] = useState<BackupRecord[]>([]);
  const [stats, setStats] = useState<DataManagementStats>(initialStats);
  const [filters, setFilters] = useState<BackupSearchPayload>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
  });
  const [tableLoading, setTableLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState<"csv" | "json" | null>(null);

  const buildStats = (content: BackupRecord[], totalItems: number) => {
    const actionCounter: Record<string, number> = {};
    let latestActionBy: string | null = null;
    let latestBackupAt: string | null = null;
    let attachmentCount = 0;

    if (content.length) {
      const latest = content[0];
      latestBackupAt = latest.createdAt;
      if (latest.actionBy && typeof latest.actionBy === "object") {
        latestActionBy =
          latest.actionBy.fullName ||
          latest.actionBy.email ||
          latest.actionBy.position ||
          null;
      }
    }

    content.forEach((item) => {
      const action = item.action || "UNKNOWN";
      actionCounter[action] = (actionCounter[action] || 0) + 1;
      if (item.filePath) {
        attachmentCount += 1;
      }
    });

    const topActionEntry = Object.entries(actionCounter).sort(
      (a, b) => b[1] - a[1]
    )[0];

    setStats({
      totalRecords: totalItems,
      uniqueTables: new Set(content.map((item) => item.tableName)).size,
      latestBackupAt,
      latestActionBy,
      topAction: topActionEntry
        ? { action: topActionEntry[0], count: topActionEntry[1] }
        : undefined,
      attachmentCount,
    });
  };

  const fetchBackups = async (payload?: Partial<BackupSearchPayload>) => {
    const body: BackupSearchPayload = {
      ...filters,
      ...payload,
    };

    setTableLoading(true);
    showLoading();
    try {
      const response = await DataManagementService.searchBackups(body);
      if (response.success && response.data) {
        const data = response.data;
        setRecords(data.content);
        setPagination({
          page: data.page,
          limit: data.limit,
          totalItems: data.totalItems,
          totalPages: data.totalPages,
        });
        setFilters({
          ...body,
          page: data.page,
          limit: data.limit,
        });
        buildStats(data.content, data.totalItems);
      } else {
        notify(response.message || "Không thể tải dữ liệu sao lưu", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Không thể tải dữ liệu sao lưu", "error");
    } finally {
      setTableLoading(false);
      hideLoading();
    }
  };

  useEffect(() => {
    fetchBackups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImport = async (payload: ImportBackupPayload) => {
    const formData = new FormData();
    formData.append("tableName", payload.tableName);
    if (payload.action) formData.append("action", payload.action);
    if (payload.recordId) formData.append("recordId", String(payload.recordId));
    if (payload.note) formData.append("note", payload.note);
    if (payload.dataBefore) formData.append("dataBefore", payload.dataBefore);
    if (payload.dataAfter) formData.append("dataAfter", payload.dataAfter);
    formData.append("file", payload.file);

    setImportLoading(true);
    showLoading();
    try {
      const response = await DataManagementService.importBackup(formData);
      if (response.success) {
        notify(response.message || "Nhập dữ liệu thành công", "success");
        fetchBackups();
      } else {
        notify(response.message || "Nhập dữ liệu thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      notify("Nhập dữ liệu thất bại", "error");
    } finally {
      setImportLoading(false);
      hideLoading();
    }
  };

  const handleExport = async (payload: BackupExportPayload) => {
    setExportLoading(true);
    showLoading();
    try {
      const blob = await DataManagementService.exportBackups(payload);
      const suffix = payload.format || "csv";
      downloadBlob(blob, `data-backups-${Date.now()}.${suffix}`);
      notify("Xuất dữ liệu thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Xuất dữ liệu thất bại", "error");
    } finally {
      setExportLoading(false);
      hideLoading();
    }
  };

  const handleQuickBackup = async (format: "csv" | "json") => {
    setBackupLoading(format);
    showLoading();
    try {
      const params: BackupExportPayload = {
        tableName: filters.tableName,
        action: filters.action,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        format,
      };
      const blob = await DataManagementService.exportBackups(params);
      const fileName =
        format === "csv"
          ? `data-backup-${Date.now()}.csv`
          : `data-backup-${Date.now()}.json`;
      downloadBlob(blob, fileName);
      notify("Backup dữ liệu thành công", "success");
    } catch (error) {
      console.error(error);
      notify("Backup dữ liệu thất bại", "error");
    } finally {
      setBackupLoading(null);
      hideLoading();
    }
  };

  const handleDownloadAttachment = async (key?: string | null) => {
    if (!key) {
      notify("Không tìm thấy tệp đính kèm", "warning");
      return;
    }
    showLoading();
    try {
      const blob = await FileService.getSignedFile(key);
      const fileName = key.split("/").pop() || "backup-file";
      downloadBlob(blob, fileName);
    } catch (error) {
      console.error(error);
      notify("Không thể tải tệp đính kèm", "error");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="management-data-container">
      <DataStats
        stats={stats}
        onRefresh={() => fetchBackups()}
        onBackup={handleQuickBackup}
        backupLoading={!!backupLoading}
      />
      <ImportExportData
        onImport={handleImport}
        onExport={handleExport}
        importLoading={importLoading}
        exportLoading={exportLoading}
        defaultFilters={filters}
      />
      <DatabaseOverview
        data={records}
        filters={filters}
        pagination={pagination}
        loading={tableLoading}
        onSearch={(payload) => fetchBackups({ ...payload, page: 1 })}
        onPageChange={(page, limit) => fetchBackups({ page, limit })}
        onDownloadFile={handleDownloadAttachment}
      />
    </div>
  );
};

export default ManagementData;
