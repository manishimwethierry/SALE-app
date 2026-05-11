import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CustomersPage from "./pages/CustomersPage";
import DailyReportPage from "./pages/DailyReportPage";

// Pages that should NOT show the NavBar
const NO_NAV_PATHS = ["/login", "/register"];

function Layout() {
  const location = useLocation();
  const showNav = !NO_NAV_PATHS.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/daily-report"
          element={
            <ProtectedRoute>
              <DailyReportPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return <Layout />;
}

export default App;
