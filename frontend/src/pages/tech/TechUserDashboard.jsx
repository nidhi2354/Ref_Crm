import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban } from "lucide-react";

import TechShell from "../../components/tech/TechShell";
import TechProjects from "../../components/tech/TechProjects";

const NAV_ITEMS = [{ label: "Projects", icon: FolderKanban }];

function readUser() {
  try {
    return JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function TechUserDashboard() {
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
      userLabel={{ name: user.name, role: "Tech Department" }}
      onLogout={handleLogout}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Tech Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Client projects shared by the Sales Department.
        </p>
      </div>

      <TechProjects />
    </TechShell>
  );
}

export default TechUserDashboard;
