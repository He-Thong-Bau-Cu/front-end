import HeaderStats from "@/components/preside/dashboard/HeaderStats";
import '../../style/preside/Dashboard.model.css'
import DashboardStats from "@/components/preside/dashboard/DashboardStats";
import { Col, Row } from "antd";
import DecisionList from "@/components/preside/dashboard/DecisionList";
import DashboardCharts from "@/components/preside/dashboard/DashboardCharts";

const Dashboard = () => {
    return (
        <div>
            <HeaderStats />
            <div style={{
                marginLeft: 32,
                marginRight: 32,
                marginTop: 0,
                marginBottom: 0,
                width: 'calc(100% - 64px)',
                boxSizing: 'border-box',
                paddingLeft: 0,
                paddingRight: 0
            }}>
                <DashboardStats />
            </div>
            <DashboardCharts />
        </div>
    );
};

export default Dashboard;

