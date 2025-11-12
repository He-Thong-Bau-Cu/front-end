import ListRoles from "@/components/admin/management-role/ListRoles";
import RoleStats from "@/components/admin/management-role/RoleStats";
import { useLoading } from "@/contexts/LoadingContext";
import SystemService from "@/services/SystemService";
import { useEffect, useState } from "react";

const ManagementRole = () => {
  const [dataStats, setDataStats] = useState({
    totalRole: 0,
    activeRole: 0,
    inactiveRole: 0
  });
  const [totalRole, setTotalRole] = useState(0);
  const [rolePermission, setRolePermission] = useState<any>([]);
  const {showLoading, hideLoading} = useLoading();

  useEffect(() => {
    fetchStatsRole();
    fetchRolePermission({page: 1, limit: 10});
  }, []);

  const fetchStatsRole = async () => {
    try {
      showLoading()
      const response = await SystemService.getStatsRole();
      if (response.success) setDataStats({
        totalRole: response.data.totalRole,
        activeRole: response.data.activeRole,
        inactiveRole: response.data.inactiveRole
      });
    } catch (error) {
      console.log(error);
    }finally{
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  }

  const fetchRolePermission = async (body: any) => {
    try {
      showLoading();
      const response = await SystemService.searchRolePermission(body);
      if (response.success) {
        setTotalRole(response.data.totalItems);
        setRolePermission(response.data.content)
      }
    } catch (error) {
      console.log(error);
    }finally{
      setTimeout(() => {
        hideLoading();
      }, 1000);
    }
  }

  return (
    <div style={{ padding: "30px 30px", minHeight: "100vh" }}>
      <RoleStats data={dataStats}/>
      <ListRoles dataRolePermission={rolePermission} onSearch={fetchRolePermission} total={totalRole}/>
    </div>
  );
};

export default ManagementRole;
