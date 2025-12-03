import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { message } from "antd";
import { useNotification } from "@/contexts/NotificationContext";
import { SOCKET_URL } from "@/config/socket";

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

    const socket: Socket = io(SOCKET_URL, {
      auth: { userId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("notification", (data: INotification) => {
      console.log("Notification received:", data);
      notify(data.message, "info");
      onNewNotification?.(data);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected");
    };
  }, [userId, onNewNotification, notify]);

  return null;
};

export default NotificationListener;
