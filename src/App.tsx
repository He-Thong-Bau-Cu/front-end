import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import { LoadingProvider } from "./contexts/LoadingContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import AppWrapper from "./components/loading/AppWrapper";

const App: React.FC = () => (
  <NotificationProvider>
    <LoadingProvider>
      <AppWrapper>
        <RouterProvider router={router} />
      </AppWrapper>
    </LoadingProvider>
  </NotificationProvider>
);

export default App;
