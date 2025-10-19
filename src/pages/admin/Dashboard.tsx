import DashboardStats from '@/components/admin/dashboard/DashboardStats';
import DashboardCharts from '@/components/admin/dashboard/DashboardCharts';
import DashboardElections from '@/components/admin/dashboard/DashboardElections';
import DashboardActivity from '@/components/admin/dashboard/DashboardActivity';

const Dashboard = () => {
    return (
        <>
            <DashboardStats />
            <DashboardCharts />
            <div style={{ display: 'flex', gap: '24px' }}>
                <div style={{ flex: 2 }}>
                    <DashboardElections />
                </div>
                <div style={{ flex: 1 }}>
                    <DashboardActivity />
                </div>
            </div>
        </>
    );
};

export default Dashboard;

