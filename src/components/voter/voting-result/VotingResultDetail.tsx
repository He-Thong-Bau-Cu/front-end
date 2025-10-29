import React from "react";
import VotingResultDetailList from "./result-detail/VotingResultDetailList";
import VotingResultSummary from "./result-detail/VotingResultSummary";
import "../../../style/voter/VotingResult.model.css";


const VotingResultDetail: React.FC = () => {

    return (
        <div>
            <VotingResultSummary />
            <VotingResultDetailList />
        </div>
    );
};

export default VotingResultDetail;
