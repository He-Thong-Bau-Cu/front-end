export interface OrganizerUser {
  name: string;
  role: string;
}

export interface StatCardData {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface EventProgressData {
  title: string;
  checkinPercent: number;
  votePercent: number;
  checkinText: string;
  voteText: string;
}

export interface TaskItem {
  id: string;
  label: string;
  variant?: "checkbox" | "square";
  done?: boolean;
  squareColor?: string;
}

export interface ActivityItem {
  id: string;
  content: string;
  type: "start" | "group" | "notify";
}

export interface UpcomingEvent {
  id: string;
  name: string;
  time: string;
  status: string;
  linkText: string;
}
