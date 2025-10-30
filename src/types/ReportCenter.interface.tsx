export interface ReportStat {
  title: string;
  value: string | number;
  subLabel?: string;
}

export interface FavoriteReport {
  id: string;
  title: string;
  frequency: string;
}

export interface RecentReport {
  id: string;
  name: string;
  createdBy: string;
  timeAgo: string;
}
