
import {
  Bell,
  Search,
  Menu,
  ChevronDown,
} from "lucide-react";

function TopNavbar({ setSidebarOpen, user }) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-md sm:px-7 lg:px-9">
      {/* Left Section */}
      <div className="flex min-w-0 items-center gap-3">
        <button
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

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <label className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#203F72] md:flex">
          <Search size={17} className="text-slate-400" />

          <input
            placeholder="Search anything..."
            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
          />

          <span className="text-[10px] text-slate-400">
            ⌘K
          </span>
        </label>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
        >
          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#F04424]" />
        </button>

        <div className="hidden h-8 w-px bg-slate-200 sm:block" />

        {/* Admin Profile */}
        <button
          type="button"
          className="flex items-center gap-2.5 rounded-xl p-1.5 transition hover:bg-slate-50"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#203F72] text-sm font-bold text-white">
            {(user?.name || "Admin")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="hidden text-left sm:block">
            <p className="max-w-[120px] truncate text-xs font-bold text-slate-800">
              {user?.name || "Administrator"}
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Administrator
            </p>
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;
