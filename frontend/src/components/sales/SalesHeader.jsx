import { Search, Bell, Menu, ChevronRight } from "lucide-react";

function SalesHeader({ setSidebarOpen, activeNav = "Dashboard" }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Section */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <div className="mb-1 hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <span>ReefCRM</span>
              <ChevronRight size={13} />
              <span>Sales Department</span>
            </div>

            <h1 className="truncate text-lg font-bold text-[#203F72] sm:text-xl">
              {activeNav}
            </h1>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          {/* Search */}
          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:flex">
            <Search size={17} className="text-slate-400" />

            <input
              type="search"
              placeholder="Search leads..."
              aria-label="Search leads"
              className="w-36 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 lg:w-48"
            />
          </div>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:bg-slate-50"
          >
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#F04424] ring-2 ring-white" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:gap-3 sm:pl-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#203F72] text-sm font-bold text-white">
              A
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Admin
              </p>
              <p className="text-xs text-slate-500">
                Sales Management
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default SalesHeader;