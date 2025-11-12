// src/interfaces/Ballot.ts
export interface Ballot {
  id: number;
  title: string;
  desc: string;
  endTime: string;
  status: "Đang diễn ra" | "Chưa bắt đầu" | "Đã kết thúc";
  type: 1 | 2; // 1 = Biểu quyết nghị quyết, 2 = Bầu cử dồn phiếu
}



export interface BallotCast {
  _id: string;
  voterId: {
    _id: string;
    electionId: string;
    userId: {
      _id: string;
      username: string;
      fullName: string;
    };
  };
  electionId: {
    _id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
    delegationStart: string | null;
    delegationEnd: string | null;
    status: string;
    statusData: string;
    decisionNumber: string;
    decisionName: string;
  };
  voteValue: string | null;
  encryptedVote: string | null;
  issuedAt: string | null;
  castAt: string | null;
  allocations: {
    entityId: string;
    voteValue: number;
  }[];

}
