import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppSidebar from "./components/AppSidebar";

import CalendarPage from "./pages/CalendarPage";
import RuleListPage from "./pages/RuleListPage";
import MakeRulePage from "./pages/MakeRulePage";
import EditRulePage from "./pages/EditRulePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <AppSidebar />

        <main className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<CalendarPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/rules" element={<RuleListPage />} />
            <Route path="/make-rule" element={<MakeRulePage />} />
            <Route path="/edit/:name" element={<EditRulePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;