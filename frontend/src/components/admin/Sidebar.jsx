import {
  LayoutDashboard,
  UserRound,
  Users,
  Settings,
  LogOut,
  Headset,
  ChevronDown,
  X,
} from "lucide-react";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeNav,
  setActiveNav,
  departmentsOpen,
  setDepartmentsOpen,
  onLogout,
}) {
  const navItemClass = (isActive) =>
    `flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition ${isActive
      ? "bg-white text-[#203F72] shadow-lg shadow-blue-950/10"
      : "text-blue-100 hover:bg-white/10 hover:text-white"
    }`;

  const handleNavigation = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <button
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
              onClick={() => handleNavigation("Dashboard")}
              className={navItemClass(activeNav === "Dashboard")}
            >
              <LayoutDashboard size={18} />
              <span className="flex-1">Dashboard</span>
            </button>

            {/* Departments */}
            <button
              onClick={() => setDepartmentsOpen((prev) => !prev)}
              aria-expanded={departmentsOpen}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition ${activeNav === "Sales Department"
                ? "bg-white/10 text-white"
                : "text-blue-100 hover:bg-white/10 hover:text-white"
                }`}
            >
              <UserRound size={18} />

              <span className="flex-1">Departments</span>

              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${departmentsOpen ? "rotate-180" : ""
                  }`}
              />
            </button>

            {/* Departments Submenu */}
            {departmentsOpen && (
              <div className="ml-5 space-y-1 border-l border-white/20 pl-4">
                <button
                  onClick={() => handleNavigation("Sales Department")}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition ${activeNav === "Sales Department"
                    ? "bg-[#F7941D] text-white shadow-md"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <Users size={16} />
                  <span>Sales Department</span>
                </button>
              </div>
            )}
          </nav>

          {/* Preferences */}
          <p className="mb-3 mt-9 px-3 text-[10px] font-bold uppercase tracking-[2px] text-blue-200/70">
            Preferences
          </p>

          <button
            onClick={() => handleNavigation("Settings")}
            className={navItemClass(activeNav === "Settings")}
          >
            <Settings size={18} />
            <span className="flex-1">Settings</span>
          </button>
        </div>

        {/* Support and Logout */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#F7941D]">
              <Headset size={19} />
            </div>

            <p className="text-sm font-semibold">Need assistance?</p>

            <p className="mt-1 text-xs leading-5 text-blue-100/70">
              Get help with your CRM workspace.
            </p>

            <button
              type="button"
              className="mt-3 w-full rounded-lg bg-white/10 py-2 text-xs font-semibold hover:bg-white/20"
            >
              Contact Support
            </button>
          </div>

          <button
            onClick={onLogout}
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
