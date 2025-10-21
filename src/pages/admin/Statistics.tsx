import RealTimeData from "@/components/admin/statistics/RealTimeData";
import StatisticsFilterBar from "@/components/admin/statistics/StatisticsFilterBar";
import StatisticsReportSection from "@/components/admin/statistics/StatisticsReportSection";
import StatisticsStats from "@/components/admin/statistics/StatisticsStats";


const Statistics = () => {
    return (
        <div >
            <StatisticsFilterBar />
            <StatisticsStats />
            <RealTimeData />
            <StatisticsReportSection />
        </div>
    );
};

export default Statistics;
