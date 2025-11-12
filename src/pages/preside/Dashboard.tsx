import HeaderStats from "@/components/preside/dashboard/HeaderStats";
import '../../style/preside/Dashboard.model.css'
import DashboardStats from "@/components/preside/dashboard/DashboardStats";
import DashboardActivity from "@/components/preside/dashboard/DashboardActivity";
import { Col, Row } from "antd";
import DecisionList from "@/components/preside/dashboard/DecisionList";
import DashboardCharts from "@/components/preside/dashboard/DashboardCharts";

const Dashboard = () => {
    return (
        <div>
            <HeaderStats />
            <DashboardStats />
            <DashboardCharts />

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={24}>
                    <DecisionList />
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;

