export interface BackupUserRef {
  _id?: string;
  fullName?: string;
  email?: string;
  position?: string;
}

export interface BackupRecord {
  _id: string;
  tableName: string;
  recordId?: number;
  action: string;
  actionBy?: BackupUserRef | string | null;
  note?: string | null;
  filePath?: string | null;
  dataBefore?: Record<string, any> | null;
  dataAfter?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface BackupPagination {
  content: BackupRecord[];
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface BackupSearchPayload {
  tableName?: string;
  action?: string;
  recordId?: string | number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface BackupExportPayload {
  tableName?: string;
  action?: string;
  fromDate?: string;
  toDate?: string;
  format?: "csv" | "json";
}

export interface ImportBackupPayload {
  tableName: string;
  action?: string;
  recordId?: number;
  note?: string;
  dataBefore?: string;
  dataAfter?: string;
  file: File;
}

export interface DataManagementStats {
  totalRecords: number;
  uniqueTables: number;
  latestBackupAt?: string | null;
  latestActionBy?: string | null;
  topAction?: { action: string; count: number };
  attachmentCount: number;
}

