import { Decision } from "./Decision.interface";
import { DelegationSummary } from "./Delegate.interface";

export interface SummaryDelegate {
 _id: string;
 election: Decision;
 status: string;
 delegations: DelegationSummary[];
}
