import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { message } from "antd";
import { useNotification } from "@/contexts/NotificationContext";

// ====== Type cho notification ======
export interface INotification {
  _id: string;
  message: string;
  time?: string;
  read: boolean;
}

// ====== Props ======
interface NotificationListenerProps {
  userId: string;
  onNewNotification?: (data: INotification) => void;
}

const NotificationListener: React.FC<NotificationListenerProps> = ({
  userId,
  onNewNotification,
}) => {
  const { notify } = useNotification();

  useEffect(() => {
    if (!userId) return;

    // ====== Connect socket ======
    const socket: Socket = io("http://54.253.192.210:80/notification", {
      auth: { userId },           // truyền userId qua auth
      transports: ["websocket"],  // chỉ dùng websocket
    });

    // ====== Connection log ======
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    // ====== Nhận notification ======
    socket.on("notification", (data: INotification) => {
      console.log("Notification received:", data);
      notify(data.message, "info");
      onNewNotification?.(data);
    });

    // ====== Cleanup khi component unmount ======
    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [userId, onNewNotification, notify]);

  return null;
};

export default NotificationListener;
