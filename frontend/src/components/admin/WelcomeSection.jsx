
import { Clock3, ChevronDown, FileText } from "lucide-react";

function WelcomeSection({ user }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      {/* Welcome Message */}
      <div>
        <p className="text-sm text-slate-500">
          Welcome back 👋
        </p>

        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#203F72] sm:text-[30px]">
          Hello, {user?.name || "Admin"}!
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Clock3 size={15} />
          Last 30 days
          <ChevronDown size={14} />
        </button>

        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-[#203F72] px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-blue-900/15 transition hover:bg-[#172f57]"
        >
          <FileText size={15} />
          Export Report
        </button>
      </div>
    </div>
  );
}

export default WelcomeSection;
