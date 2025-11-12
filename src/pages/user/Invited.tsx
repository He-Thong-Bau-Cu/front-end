import { useNotification } from "@/contexts/NotificationContext";
import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Invited: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
   const {notify} = useNotification();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get("token");

    if (token) {
        try {
        localStorage.setItem("invitedToken", token);
      } catch {
       throw new Error("Failed to store invited token");
      }

     notify("Xác nhận mail thành công. Dùng tài khoản của bạn để đăng nhập.", "success");
      navigate("/login", { replace: true });                     
    } 
  }, [search, navigate]);

  
  return null;
};

export default Invited;
