
export interface VotingRight {
    _id: string;
    voterId: {
        _id: string;
        electionId: string;
        userId: string;
        eligible: boolean;
        status: string;
        updatedAt: string;
        createdAt: string;
    };
    electionId: {
        _id: string;
        title: string;

    };
    shares: number;
    votes: number;
    status: string;
}