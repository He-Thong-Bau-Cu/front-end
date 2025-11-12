import UserList from "@/components/admin/management-user/UserList";
import UserStats from "@/components/admin/management-user/UserStats";
import { useLoading } from "@/contexts/LoadingContext";
import { useNotification } from "@/contexts/NotificationContext";
import UserService from "@/services/UserService";
import { useEffect, useState } from "react";
import { set } from "react-hook-form";

const ManagementUser = () => {
  const [userData, setUserData] = useState([]);
  const [stats, setStats] = useState([]);
  const [total, setTotal] = useState(0);
  const { showLoading, hideLoading } = useLoading();
  const { notify } = useNotification();

  useEffect(() => {
    fetchStatsUser();
    onSearch();
  }, []);

  const onSearch = async (values?: any) => {
    try {
      showLoading();
      const response = await UserService.search(values);
      if (response.success) {
        setUserData(response.data.content);
        setTotal(response.data.totalElements);
        notify(response.message, "success");
      } else {
        notify(response.message, "error");
      }
    } catch (error) {
      notify("Đã có lỗi xảy ra. Vui lòng thử lại.", "error");
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  const fetchStatsUser = async () => {
    try {
      showLoading();
      const response = await UserService.statistics();
      if (response.success) setStats(response.data);
      else setStats([]);
    } catch (error) {
      console.log(error);
    } finally {
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  return (
    <div>
      <UserStats statsData={stats}/>
      <UserList users={userData} total={total} onSearch={onSearch} />
    </div>
  );
};

export default ManagementUser;
