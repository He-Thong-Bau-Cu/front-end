import DecisionStats from "@/components/preside/management-decision/DecisionStats";
import DecisionTable from "@/components/preside/management-decision/DecisionTable";
import '../../style/preside/ManagementDecision.model.css'

const ManagementDecision = () => {
    return (
        <div style={{ padding: '0 32px' }}>
            <DecisionStats />
            <DecisionTable />
        </div>
    )
}

export default ManagementDecision;