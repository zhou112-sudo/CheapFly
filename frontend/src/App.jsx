import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/layout/AppShell";
import { DealDetailPage } from "@/pages/DealDetailPage";
import { ExplorePage } from "@/pages/ExplorePage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SearchPage } from "@/pages/SearchPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<SearchPage />} />
        <Route path="explore" element={<ExplorePage />} />
        <Route path="deal/:id" element={<DealDetailPage />} />
      </Route>
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
