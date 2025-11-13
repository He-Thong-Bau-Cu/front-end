export interface Ballot {
  _id: string;
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
  voterId: {
    _id: string;
    electionId: string;
    userId: {
      _id: string;
      username: string;
      fullName: string;
      email: string;
      position: string;
    };
    eligible: boolean;
    status: string;
    updatedAt: string;
    createdAt: string;
    __v: number;
  };
  voteValue: string | null;
  encryptedVote: string | null;
  status: string;
  issuedAt: string | null;
  castAt: string | null;
  updatedAt: string;
  createdAt: string;
  allocations: {
    entityId: string;
    voteValue: number;
  }[];
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

export interface BallotStatusCount {
  _id: string;
  totalBallots: number;
}

export interface BallotStatistics {
  total: number;
  ballotStatus: BallotStatusCount[];
}


