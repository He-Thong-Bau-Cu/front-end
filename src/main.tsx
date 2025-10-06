import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ConfigProvider } from 'antd'
import dayjs from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
import viVN from 'antd/locale/vi_VN';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConfigProvider locale={viVN}>
      <App />
    </ConfigProvider>
  </StrictMode>,
)
