import VotingResultHeader from "@/components/voter/voting-result/VotingResultHeader";
import VotingResultList from "@/components/voter/voting-result/VotingResultList";
import React from "react";
import '../../style/voter/VotingResult.model.css'


const VotingResult: React.FC = () => {
    return (
        <div className="voting-result-page">
            <VotingResultHeader />
            <VotingResultList />
        </div>
    );
};

export default VotingResult;
