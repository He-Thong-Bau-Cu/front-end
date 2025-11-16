import { Decision } from "./Decision.interface";
import { DelegationSummary } from "./Delegate.interface";

export interface SummaryDelegate {
 _id: string;
 election: Decision;
 documents: string;
 status: string;
 delegations: DelegationSummary[];
}
