import { useLoading } from "@/contexts/LoadingContext";
import { User } from "@/types/User.interface";
import { getUserLogin } from "@/utils/auth";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Card, Typography } from "antd";
import { useEffect, useState } from "react";
import "../../../style/voter/Dashboard.model.css";

const { Text } = Typography;

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        showLoading();
        const userId = localStorage.getItem("userId");
        if (userId) {
          const userData = await getUserLogin();
          setUser(userData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        hideLoading();
      }
    };

    fetchUserData();
  }, []);



  // if (loading) {
  //   return (
  //     <Card className="voter-welcome-card">
  //       <div style={{ textAlign: "center", padding: "40px 0" }}>
  //         <Spin size="large" />
  //       </div>
  //     </Card>
  //   );
  // }

  return (
    <Card className="voter-welcome-card">
      <Text strong className="voter-welcome-title">👋 Chào mừng trở lại!</Text>
      <p className="voter-welcome-subtitle">
        Kiểm soát viên giám sát cuộc bầu cử
      </p>

      <div className="voter-welcome-user">
        <Avatar
          size={70}
          src={user?.image}
          icon={user?.image ? undefined : <UserOutlined />}
        />
        <div>
          <Text strong className="voter-user-name">
            {user?.fullName || "Người dùng"}
          </Text>
          {/* <div className="voter-user-info">
            Khu vực: {user?.address || "Chưa cập nhật"}
          </div> */}
        </div>
      </div>
    </Card>
  );
};

export default Header;
