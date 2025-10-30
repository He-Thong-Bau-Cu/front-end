// src/interfaces/Ballot.ts
export interface Ballot {
  id: number;
  title: string;
  desc: string;
  endTime: string;
  status: "Đang diễn ra" | "Chưa bắt đầu" | "Đã kết thúc";
  type: 1 | 2; // 1 = Biểu quyết nghị quyết, 2 = Bầu cử dồn phiếu
}
