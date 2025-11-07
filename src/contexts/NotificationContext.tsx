import React, { createContext, useContext } from "react";
import { notification } from "antd";
import type { NotificationArgsProps } from "antd";

type NotificationType = "success" | "error" | "info" | "warning";

interface NotificationContextType {
  notify: (message: string, type?: NotificationType, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [api, contextHolder] = notification.useNotification();

  const notify = (
    message: string,
    type: NotificationType = "info",
    description?: string
  ) => {
    const config: NotificationArgsProps = {
      message,
      description,
      placement: "topRight",
      duration: 3,
      style: {
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    };

    switch (type) {
      case "success":
        api.success({
          ...config,
          style: {
            ...config.style,
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
          },
        });
        break;
      case "error":
        api.error({
          ...config,
          style: {
            ...config.style,
            background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            border: '1px solid #fca5a5',
          },
        });
        break;
      case "warning":
        api.warning({
          ...config,
          style: {
            ...config.style,
            background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fcd34d',
          },
        });
        break;
      case "info":
      default:
        api.info({
          ...config,
          style: {
            ...config.style,
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1px solid #93c5fd',
          },
        });
    }
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

// Demo component
export default function NotificationDemo() {
  const { notify } = useNotification();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => notify(
                "Thành công!",
                "success",
                "Thao tác của bạn đã được thực hiện thành công"
              )}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Success
            </button>

            <button
              onClick={() => notify(
                "Lỗi xảy ra!",
                "error",
                "Đã có lỗi trong quá trình xử lý"
              )}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Error
            </button>

            <button
              onClick={() => notify(
                "Thông tin",
                "info",
                "Đây là thông tin quan trọng bạn cần biết"
              )}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Info
            </button>

            <button
              onClick={() => notify(
                "Cảnh báo!",
                "warning",
                "Vui lòng kiểm tra lại thông tin của bạn"
              )}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md"
            >
              Warning
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
