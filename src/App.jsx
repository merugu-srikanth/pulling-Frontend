import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Websites from "./pages/Websites";
import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-y-auto scrollbar-thin">
        <Routes>
          <Route path="/"          element={<Dashboard />} />
          <Route path="/websites"  element={<Websites />} />
          <Route path="/jobs"      element={<Jobs />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
