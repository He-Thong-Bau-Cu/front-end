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
            <DashboardStats />
            <DashboardCharts />
        </div>
    );
};

export default Dashboard;

