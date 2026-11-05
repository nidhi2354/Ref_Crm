import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UserRound,
  Code2,
  ChevronDown,
  Menu,
  X,
  LogOut,
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [departmentsOpen, setDepartmentsOpen] = useState(false);

  let user = {};

  try {
    user = JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const openSalesDepartment = () => {
    setSidebarOpen(false);
    navigate("/admin/sales-department");
  };

  const openTechDepartment = () => {
    setSidebarOpen(false);
    navigate("/admin/tech-department");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-slate-800">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col bg-[#203F72] text-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">
              Reef<span className="text-[#F7941D]">CRM</span>
            </h1>

            <p className="mt-0.5 text-[10px] tracking-[3px] text-blue-200">
              BUSINESS MANAGEMENT
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-blue-200/70">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            {/* Dashboard */}
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="flex w-full items-center gap-3 rounded-xl bg-white px-3.5 py-3 text-left text-[13px] font-medium text-[#203F72] shadow-sm"
            >
              <LayoutDashboard size={18} />

              <span className="flex-1">Dashboard</span>
            </button>

            {/* Departments */}
            <button
              type="button"
              onClick={() => setDepartmentsOpen((previous) => !previous)}
              aria-expanded={departmentsOpen}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <UserRound size={18} />

              <span className="flex-1">Departments</span>

              <ChevronDown
                size={16}
                className={`transition-transform ${departmentsOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Department List */}
            {departmentsOpen && (
              <div className="ml-5 border-l border-white/20 pl-3">
                <button
                  type="button"
                  onClick={openSalesDepartment}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Users size={15} />

                  <span>Sales Department</span>
                </button>

                <button
                  type="button"
                  onClick={openTechDepartment}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
                >
                  <Code2 size={15} />

                  <span>Tech Department</span>
                </button>

                {/* HR and Manager can be added here later */}
              </div>
            )}
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />

            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-h-screen lg:ml-[255px]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <p className="text-xs text-slate-400">
                Workspace / Admin
              </p>

              <h2 className="mt-0.5 truncate text-sm font-bold text-[#203F72] sm:text-base">
                Admin Dashboard
              </h2>
            </div>
          </div>

          {/* Admin Profile */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#203F72] text-sm font-bold text-white">
              {(user.name || "Admin").charAt(0).toUpperCase()}
            </div>

            <div className="hidden sm:block">
              <p className="max-w-[160px] truncate text-xs font-bold text-slate-800">
                {user.name || "Administrator"}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Administrator
              </p>
            </div>
          </div>
        </header>

        {/* Empty Dashboard Content */}
        <main className="min-h-[calc(100vh-76px)] p-5 sm:p-7 lg:p-9">
          <div>
            <p className="text-sm text-slate-500">
              Welcome back!
            </p>

            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#203F72] sm:text-[30px]">
              Hello, {user.name || "Admin"}!
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Welcome to your company workspace.
            </p>
          </div>

          {/* No dummy data or unnecessary sections */}
          <div className="mt-8 min-h-[300px] rounded-2xl border border-dashed border-slate-200 bg-white/60" />
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;