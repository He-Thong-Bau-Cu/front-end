// types/meeting.d.ts
export interface Meeting {
  id: string;
  name: string;
  description: string;
  time: string;
  location: string;
  participants: number;
  status: "upcoming" | "active" | "ended";
}
