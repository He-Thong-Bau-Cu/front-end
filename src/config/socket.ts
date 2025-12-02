
const getSocketUrl = (): string => {
  const env = import.meta.env.VITE_ENVIRONMENT || "prod";
  const isDev = env === "dev";

  if (isDev) {
    return "http://localhost:3000/notification";
  } else {
    return "https://api.datvexe-manage.id.vn/notification";
  }
};

export const SOCKET_URL = getSocketUrl();

