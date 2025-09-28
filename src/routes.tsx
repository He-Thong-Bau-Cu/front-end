// src/routes.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ElectionDocuments from "./pages/ElectionDocuments";
import ElectionList from "./pages/ElectionList";
import ElectionDetail from "./pages/ElectionDetail";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/elections" element={<ElectionList />} />
        <Route path="/election/:id" element={<ElectionDetail />} />
        <Route path="/documents/:id" element={<ElectionDocuments />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
