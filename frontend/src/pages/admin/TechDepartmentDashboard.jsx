import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Users } from "lucide-react";

import TechShell from "../../components/tech/TechShell";
import TechProjects from "../../components/tech/TechProjects";
import SalesMembers from "../../components/sales/SalesMembers";

const NAV_ITEMS = [
  { label: "Projects", icon: FolderKanban },
  { label: "Tech Users", icon: Users },
];

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function TechDepartmentDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Projects");
  const user = readUser();

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <TechShell
      navItems={NAV_ITEMS}
      activeNav={activeNav}
      setActiveNav={setActiveNav}
      userLabel={{ name: user.name || "Admin", role: "Administrator" }}
      onLogout={handleLogout}
      onBack={() => navigate("/admin/dashboard")}
    >
      {activeNav === "Tech Users" ? (
        <SalesMembers role="TECH" />
      ) : (
        <TechProjects />
      )}
    </TechShell>
  );
}

export default TechDepartmentDashboard;
