import DashboardStats, { Stats } from '@/components/admin/dashboard/DashboardStats';
import DashboardCharts, { LineData, PieData } from '@/components/admin/dashboard/DashboardCharts';
import DashboardElections, { Election } from '@/components/admin/dashboard/DashboardElections';
import DashboardActivity, { Activity } from '@/components/admin/dashboard/DashboardActivity';
import { useLoading } from '@/contexts/LoadingContext';
import { useNotification } from '@/contexts/NotificationContext';
import SystemService from '@/services/SystemService';
import { useEffect, useState } from 'react';
import { P } from 'framer-motion/dist/types.d-BJcRxCew';
import { IconColor, IconMap } from '@/enums/IconMap';
import { getTimeAgo } from '@/utils/format';
import { progress } from 'framer-motion';
import { PROGRESS_STATUS, STATUS_ELECTION } from '@/enums/STATUS';

const Dashboard = () => {
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();
  const [statisticsCards, setStatisticsCards] = useState<Stats[]>([]);
  const [resultDistributionChart, setResultDistributionChart] = useState<PieData[]>([]);
  const [participationRateChart, setParticipationRateChart] = useState<LineData[]>([]);
  const [ongoingPolls, setOngoingPolls] = useState<Election[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    try {
      showLoading();
      fetchStatistics();
      fetchParticipationRate();
      fetchResultDistributionChart();
      fetchOngoingPolls();
      fetchRecentActivities();
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  }, [])

  const fetchStatistics = async () => {
    try {
      const response = await SystemService.getStatisticsCards();
      if (response.success) {
        let dataSat = response.data.map((item: any) => {
          const iconKey = item.icon?.toLowerCase() as keyof typeof IconMap;
          const colorKey = item.icon?.toLowerCase() as keyof typeof IconColor;
          const value =
            item.unit === "%"
              ? parseFloat(item.value.toFixed(2)) // 2 số thập phân
              : item.value;
          return {
            title: item.title,
            value: value,
            icon: IconMap[iconKey],
            color: IconColor[colorKey],
          }
        });
        setStatisticsCards(dataSat as Stats[]);
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }

  const fetchParticipationRate = async () => {
    try {
      const response = await SystemService.getParticipationRateChart();
      if (response.success) {
        setParticipationRateChart(response.data as LineData[]);
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }

  const fetchResultDistributionChart = async () => {
    try {
      const response = await SystemService.getResultDistributionChart();
      if (response.success) {
        let data = [];
        const dataResult = response.data;
        data.push({ name: "Hoạt động", value: dataResult.active })
        data.push({ name: "Chưa hoạt động", value: dataResult.inactive })
        setResultDistributionChart(data as PieData[]);
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }
  const fetchOngoingPolls = async () => {
    try {
      const response = await SystemService.getOngoingPolls();
      if (response.success) {
        let data = response.data.map((item: any) => {
          let statusKey = item.statusData as keyof typeof STATUS_ELECTION;
          let progressKey = item.statusData as keyof typeof PROGRESS_STATUS;
          return {
            title: item.name,
            time: item.remainingTime,
            progress: PROGRESS_STATUS[progressKey],
            status: STATUS_ELECTION[statusKey]
          }
        })
        setOngoingPolls(data as Election[]);
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }

  const fetchRecentActivities = async () => {
    try {
      const response = await SystemService.getRecentActivities();
      if (response.success) {
        let data = response.data.map((item: any) => {
          return {
            title: item.activity,
            time: getTimeAgo(item.time)
          }
        })
        setRecentActivities(data as Activity[]);
      }
    } catch (error) {
      console.log("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    }
  }

  return (
    <>
      <DashboardStats stats={statisticsCards} />
      <DashboardCharts lineData={participationRateChart} pieData={resultDistributionChart} />
      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ flex: 2 }}>
          <DashboardElections elections={ongoingPolls} />
        </div>
        <div style={{ flex: 1 }}>
          <DashboardActivity activities={recentActivities} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;

