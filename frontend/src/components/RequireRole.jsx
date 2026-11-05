import { Navigate } from "react-router-dom";
import { isTokenExpired, expireSession } from "../services/session";

// Each role's own home page
const ROLE_HOME = {
  ADMIN: "/admin/dashboard",
  SALES: "/sales/dashboard",
  TECH: "/tech/dashboard",
};

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

// Allows only the given roles. Anyone else goes to the login page
// (not logged in) or back to their own department (wrong role).
function RequireRole({ roles, children }) {
  const token = sessionStorage.getItem("token");
  const role = readUser().role;

  if (!token || !ROLE_HOME[role]) {
    return <Navigate to="/login" replace />;
  }

  if (isTokenExpired(token)) {
    expireSession();
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes(role)) {
    return <Navigate to={ROLE_HOME[role]} replace />;
  }

  return children;
}

export default RequireRole;
