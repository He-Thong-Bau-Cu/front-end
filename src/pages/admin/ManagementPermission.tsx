import PermissionStats from "@/components/admin/management-permission/PermissionStats";
import ListPermissions from "@/components/admin/management-permission/ListPermissions";
import { useLoading } from "@/contexts/LoadingContext";
import { useEffect, useState } from "react";
import SystemService from "@/services/SystemService";

const ManagementPermission = () => {
  const { showLoading, hideLoading } = useLoading();
  const [stats, setStats] = useState({
    totalPermission: 0,
    activePermission: 0,
    inactivePermission: 0
  });
  const [permissionData, setPermissionData] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchStats();
    fetchPermission({page: 1, limit: 10});
  }, []);

  const fetchStats = async () => {
    try {
      showLoading();
      const response = await SystemService.getStatsPermission();
      if(response.success) setStats({
        totalPermission: response.data.totalPermission,
        activePermission: response.data.activePermission,
        inactivePermission: response.data.inactivePermission
      });
    } catch (error) {
      console.log(error);
    }finally{
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  };

  const fetchPermission = async (values: any) => {
    try {
      showLoading();
      const response = await SystemService.getPermission(values);
      if (response.success) {
        setPermissionData(response.data.content);
        setTotal(response.data.totalItems);
      }
    } catch (error) {
      console.log(error)
    }finally{
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  }
  return (
    <div style={{ padding: "20px 32px" }}>
      <PermissionStats data={stats}/>
      <ListPermissions permissions={permissionData} total={total} onSearch={fetchPermission} />
    </div>
  );
};

export default ManagementPermission;
