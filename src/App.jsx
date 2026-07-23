import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Websites from "./pages/Websites";
import Jobs from "./pages/Jobs";
import Settings from "./pages/Settings";

// Kanban Pages
import KanbanBoard from "./pages/KanbanBoard";
import MyTasks from "./pages/MyTasks";
import DailyReports from "./pages/DailyReports";
import TeamPerformance from "./pages/TeamPerformance";
import TaskAnalytics from "./pages/TaskAnalytics";

// Auth Pages
import Login from "./pages/Login";
import AdminManagement from "./pages/AdminManagement";

// Router Guard Component
function ProtectedRoute({ children, requiredPermission, requiredSuperAdmin }) {
  const token = localStorage.getItem("adminToken");
  const userStr = localStorage.getItem("adminUser");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);

    if (requiredSuperAdmin && user.role !== "super_admin") {
      const fallback = user.permissions?.scraping ? "/" : "/kanban";
      return <Navigate to={fallback} replace />;
    }

    if (requiredPermission) {
      const isSuper = user.role === "super_admin";
      const hasPerm = user.permissions?.[requiredPermission] === true;
      if (!isSuper && !hasPerm) {
        const fallback = user.permissions?.scraping ? "/" : "/kanban";
        return <Navigate to={fallback} replace />;
      }
    }
  } catch (e) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Redirect dashboard root based on role permissions
function HomeRedirect() {
  const token = localStorage.getItem("adminToken");
  const userStr = localStorage.getItem("adminUser");

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.role === "super_admin" || user.permissions?.scraping) {
      return <Dashboard />;
    } else if (user.permissions?.task_manager) {
      return <Navigate to="/kanban" replace />;
    }
  } catch (e) {}

  return <Navigate to="/login" replace />;
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem("adminToken"));
    };
    window.addEventListener("authChanged", handleAuthChange);
    return () => window.removeEventListener("authChanged", handleAuthChange);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {token && <Sidebar />}

      <div className={token ? "flex-1 flex flex-col ml-64 overflow-y-auto scrollbar-thin" : "flex-1 flex flex-col overflow-y-auto scrollbar-thin"}>
        <Routes>
          {/* Public Auth Endpoint */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => window.location.href = "/"} />}
          />

          {/* Root Redirect handler */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Scraper Routes */}
          <Route
            path="/websites"
            element={
              <ProtectedRoute requiredPermission="scraping">
                <Websites />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute requiredPermission="scraping">
                <Jobs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPermission="scraping">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Kanban Routes */}
          <Route
            path="/kanban"
            element={
              <ProtectedRoute requiredPermission="task_manager">
                <KanbanBoard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute requiredPermission="task_manager">
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/daily-reports"
            element={
              <ProtectedRoute requiredPermission="task_manager">
                <DailyReports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-performance"
            element={
              <ProtectedRoute requiredPermission="task_manager">
                <TeamPerformance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-analytics"
            element={
              <ProtectedRoute requiredPermission="task_manager">
                <TaskAnalytics />
              </ProtectedRoute>
            }
          />

          {/* Admin Management Panel */}
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredSuperAdmin>
                <AdminManagement />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
