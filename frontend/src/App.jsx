import { Navigate, Route, Routes } from "react-router-dom";

import Login from "./pages/login";
import RequireRole from "./components/RequireRole";
import AdminDashboard from "./pages/admin/AdminDashboard";
import SalesUserDashboard from "./pages/sales/SalesUserDashboard";
import SalesDepartmentDashboard from "./pages/admin/SalesDepartmentDashboard";
import TechDepartmentDashboard from "./pages/admin/TechDepartmentDashboard";
import TechUserDashboard from "./pages/tech/TechUserDashboard";

function App() {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Company Admin Dashboard */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireRole roles={["ADMIN"]}>
            <AdminDashboard />
          </RequireRole>
        }
      />

      {/* Admin - Sales Department */}
      <Route
        path="/admin/sales-department"
        element={
          <RequireRole roles={["ADMIN"]}>
            <SalesDepartmentDashboard />
          </RequireRole>
        }
      />

      {/* Admin - Tech Department */}
      <Route
        path="/admin/tech-department"
        element={
          <RequireRole roles={["ADMIN"]}>
            <TechDepartmentDashboard />
          </RequireRole>
        }
      />

      {/* Individual Tech User Dashboard */}
      <Route
        path="/tech/dashboard"
        element={
          <RequireRole roles={["TECH", "ADMIN"]}>
            <TechUserDashboard />
          </RequireRole>
        }
      />

      {/* Individual Sales User Dashboard */}
      <Route
        path="/sales/dashboard"
        element={
          <RequireRole roles={["SALES", "ADMIN"]}>
            <SalesUserDashboard />
          </RequireRole>
        }
      />

      {/* Default Route */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
}

export default App;