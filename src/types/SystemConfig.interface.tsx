export type SystemSettingsGroup =
  | "OVERVIEW"
  | "NOTIFY"
  | "SECURITY"
  | "INTEGRATION"
  | "ADVANCED"
  | "ELECTION_TYPES";

export interface SystemConfig {
  _id: string;
  configKey: string;
  configValue: any;
  groupType: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfigSearchPayload {
  textSearch?: string;
  groupType?: string;
  page?: number;
  limit?: number;
}

export interface SystemConfigUpsertPayload {
  configKey: string;
  groupType: string;
  configValue: any;
}

