import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  X,
  FolderOpen,
} from "lucide-react";

function SalesSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeNav,
  setActiveNav,
  onLogout,
}) {
  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "All Leads", icon: Users },
    { label: "Follow-ups", icon: ClipboardList },
    { label: "My Assigned Files", icon: FolderOpen },
  ];

  const handleNavigation = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
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
        {/* Brand */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">
              Reef<span className="text-[#F7941D]">CRM</span>
            </h1>

            <p className="mt-1 text-[10px] tracking-[3px] text-blue-200">
              SALES MANAGEMENT
            </p>
          </div>

          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-blue-200/70">
            Sales Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleNavigation(label)}
                className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-[13px] font-medium transition ${activeNav === label
                    ? "bg-white text-[#203F72] shadow-lg shadow-blue-950/10"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto p-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-4">
            <p className="text-sm font-semibold">Sales Workspace</p>

            <p className="mt-1 text-xs leading-5 text-blue-100/70">
              Track your leads, manage follow-ups and access your assigned files.
            </p>
          </div>

          <button
            type="button"
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

export default SalesSidebar;