import { useState } from "react";
import { LogOut, Menu, X, ArrowLeft, ChevronRight } from "lucide-react";

// Common layout (sidebar + header) for the Tech Department pages
function TechShell({
  navItems,
  activeNav,
  setActiveNav,
  userLabel,
  onLogout,
  onBack,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col bg-[#203F72] text-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide">
              Reef<span className="text-[#F7941D]">CRM</span>
            </h1>
            <p className="mt-1 text-[10px] tracking-[3px] text-blue-200">
              TECH DEPARTMENT
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

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[2px] text-blue-200/70">
            Tech Workspace
          </p>

          <nav className="space-y-1.5">
            {navItems.map(({ label, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setActiveNav(label);
                  setSidebarOpen(false);
                }}
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

        <div className="mt-auto space-y-1 p-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to Admin
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="min-h-screen lg:ml-[255px]">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open sidebar"
                className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <div className="mb-1 hidden items-center gap-2 text-xs text-slate-400 sm:flex">
                  <span>ReefCRM</span>
                  <ChevronRight size={13} />
                  <span>Tech Department</span>
                </div>

                <h1 className="truncate text-lg font-bold text-[#203F72] sm:text-xl">
                  {activeNav}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#203F72] text-sm font-bold text-white">
                {(userLabel?.name || "T").charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {userLabel?.name || "Tech"}
                </p>
                <p className="text-xs text-slate-500">{userLabel?.role}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="space-y-6 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default TechShell;
