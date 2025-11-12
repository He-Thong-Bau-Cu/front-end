import VotingHeader from "@/components/voter/voting-history/VotingHeader";
import "../../style/voter/VotingHistory.model.css";
import VotingHistoryContent from "@/components/voter/voting-history/VotingHistoryContent";

const VotingHistory = () => {
    return (
        <div className="voting-history-page">
            <VotingHeader />
            <VotingHistoryContent />

        </div>
    );
};

export default VotingHistory;
