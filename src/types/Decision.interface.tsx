import { ElectionTypes } from "./ElectionTypes.interface";
import { Threshols } from "./Threshols.interface";
import { TimeLine } from "./TimeLine.interface";
import { User } from "./User.interface";
import { VotingMethods } from "./VotingMethods.interface";

export interface Decision {
    _id: string;
    title: string;
    typeId: ElectionTypes;
    votingMethodId: VotingMethods;
    thresholdId: Threshols;
    startDate: string;
    endDate: string;
    timeline: TimeLine;
    delegationStart: string;
    delegationEnd: string;
    status: string;
    statusData: string;
    decisionNumber: string;
    decisionName: string;
    createdByUserId: User;
    createdAt: string;
    updatedAt: string;
}
