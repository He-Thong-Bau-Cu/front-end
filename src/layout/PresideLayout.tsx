import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import Header from "@/components/preside/Header";
import Sideber from "@/components/preside/Sidebar";
import { Outlet, useLocation } from "react-router-dom";
import bannerContent from "@/assets/banner_content.png";
import { getUserLogin } from "@/utils/auth";
import { PATH } from "@/enums/PATH";

const PresideLayout = () => {
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchDataUser = async () => {
      const dataUser = await getUserLogin();
      setUser(dataUser);

      const permissions = JSON.parse(localStorage.getItem("permissions") || "[]");
      const permissionsElections = JSON.parse(localStorage.getItem("permissionsElections") || "[]");
      if(dataUser.chairmanOfTheBoardOfDirectors){
        permissions.push("/preside/decision-approval");
        localStorage.setItem("permissions", JSON.stringify(permissions));
      }else{
        let permissionFIltered = permissionsElections.filter((item: string) => item !== "/preside/decision-approval");
        localStorage.setItem("permissionsElections", JSON.stringify(permissionFIltered));
      }

      const map: Record<string, string> = {
        "/preside": "Tổng quan",
        "/preside/decision": "Quản lý quyết định",
        "/preside/decision-approval": "Phê duyệt quyết định",
        "/preside/authorization": "Phê duyệt ủy quyền",
        "/preside/election-monitor": "Giám sát bầu cử",
        "/preside/reports": "Quản lý báo cáo",
      };

        let filteredMap = { ...map };
        if (dataUser.chairmanOfTheBoardOfDirectors) {
          filteredMap = map;
        } else {
          filteredMap = Object.fromEntries(
            Object.entries(map).filter(([key]) => {
              return key !== PATH.PRESIDE_APPROVED_REQ_FROM_USER;
            })
          );
        }

      setPageTitle(filteredMap[location.pathname] || filteredMap[location.pathname] || "Bảng điều khiển");
    };

    fetchDataUser();
  }, [location.pathname]);

  return (
    <Layout style={{ minHeight: "100vh", width: "100vw", overflow: "hidden" }}>
      <Sideber onMenuSelect={setPageTitle} />

      <Header title={pageTitle} />
      <Layout
        style={{
          marginLeft: 250, // bằng đúng width sidebar
          height: "100vh",
          overflow: "hidden", // ẩn scroll ngoài
        }}
      >
        <Content
          style={{
            height: "100vh",
            overflow: "auto",
            padding: "100px 24px 24px 24px",
            margin: 0,
            backgroundImage: `url(${bannerContent})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PresideLayout;
