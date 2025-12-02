import { useState, useCallback } from "react";
import DecisionStats from "@/components/preside/management-decision/DecisionStats";
import DecisionTable from "@/components/preside/management-decision/DecisionTable";
import '../../style/preside/ManagementDecision.model.css'

const ManagementDecision = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // Callback để trigger refresh cho DecisionStats
    const handleRefreshStats = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    return (
        <div style={{ padding: '0 32px', marginTop: '30px' }}>
            {/* <DecisionStats 
                refreshTrigger={refreshTrigger}
                autoRefreshInterval={30000} // Tự động refresh mỗi 30 giây
                enableAutoRefresh={true}
            /> */}
            <DecisionTable  />
        </div>
    )
}

export default ManagementDecision;