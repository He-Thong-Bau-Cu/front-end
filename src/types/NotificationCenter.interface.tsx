export interface NotificationItemData {
  id: string;
  iconType: "success" | "info" | "warning" | "error" | "mention";
  title: string;
  time: string;
  isUnread?: boolean;
}

export interface NotificationSectionData {
  title: string;
  items: NotificationItemData[];
}
