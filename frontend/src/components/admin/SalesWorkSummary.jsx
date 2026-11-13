import { useEffect, useState } from "react";
import {
  Activity,
  CalendarClock,
  NotebookPen,
  TrendingUp,
  FileText,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react";

import api from "../../services/api";

const PERIODS = [
  { key: "today", label: "Today", days: 1 },
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "all", label: "All time", days: null },
];

// Browser ki local date se period ka start (taaki "today" aapke time zone ke hisaab se ho)
const getSince = (days) => {
  if (!days) return undefined;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start.toISOString();
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return "No activity";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function SalesWorkSummary() {
  const [period, setPeriod] = useState("7d");
  const [members, setMembers] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSummary = async (periodKey) => {
    const option = PERIODS.find((item) => item.key === periodKey) || PERIODS[1];

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads/admin/work-summary", {
        params: { since: getSince(option.days) },
      });

      setMembers(response.data.data?.members || []);
      setTotals(response.data.data?.totals || null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load Sales work summary."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary(period);
  }, [period]);

  const maxActivity = Math.max(1, ...members.map((m) => m.activities));

  const statCards = [
    {
      title: "Total Activity",
      value: totals?.activities,
      subtitle: "Status, follow-up and note updates",
      icon: Activity,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      title: "Follow-ups Scheduled",
      value: totals?.followUpsSet,
      subtitle: "Follow-up dates set by Sales",
      icon: CalendarClock,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Notes Added",
      value: totals?.notesAdded,
      subtitle: "Follow-up notes written",
      icon: NotebookPen,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Converted",
      value: totals?.converted,
      subtitle: "Leads marked as converted",
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Client Forms",
      value: totals?.clientFormsSaved,
      subtitle: `${formatNumber(totals?.sharedToTech)} shared with Tech`,
      icon: FileText,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#203F72]">
            Sales Team Work Summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Kitna kaam har Sales member ne kiya hai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1">
            {PERIODS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setPeriod(item.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${period === item.key
                  ? "bg-[#203F72] text-white shadow-sm"
                  : "text-slate-600 hover:bg-white"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => loadSummary(period)}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#203F72] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle size={20} className="mt-0.5 shrink-0 text-red-600" />

          <div>
            <p className="font-semibold text-red-700">
              Unable to load work summary
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Totals */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="rounded-xl border border-slate-100 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {item.title}
                </p>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}
                >
                  <Icon size={18} className={item.iconColor} />
                </div>
              </div>

              <h3 className="mt-3 text-2xl font-extrabold text-[#203F72]">
                {loading && !totals ? "..." : formatNumber(item.value)}
              </h3>

              <p className="mt-1 text-xs text-slate-500">{item.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Per member table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        {loading && members.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading work summary...
          </div>
        ) : members.length === 0 && !error ? (
          <div className="p-10 text-center">
            <Users size={36} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              Koi Sales member nahi mila
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Sales users add karne ke baad yahan unka kaam dikhega.
            </p>
          </div>
        ) : members.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Sales Member",
                    "Assigned Leads",
                    "Activity",
                    "Status Updates",
                    "Follow-ups",
                    "Notes",
                    "Converted",
                    "Client Forms",
                    "Last Activity",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {members.map((member) => (
                  <tr
                    key={member.salesUserId}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#203F72]">
                          {(member.name || "S").charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="flex items-center gap-2 font-semibold text-slate-800">
                            {member.name}
                            {!member.isActive && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                Inactive
                              </span>
                            )}
                          </p>

                          <p className="text-xs text-slate-500">{member.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {formatNumber(member.assignedLeads)}
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#203F72]"
                            style={{
                              width: `${(member.activities / maxActivity) * 100}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-bold text-[#203F72]">
                          {formatNumber(member.activities)}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {formatNumber(member.statusUpdates)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {formatNumber(member.followUpsSet)}
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {formatNumber(member.notesAdded)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span className="rounded-lg bg-green-50 px-2.5 py-1 text-sm font-semibold text-green-700">
                        {formatNumber(member.converted)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-slate-700">
                      {formatNumber(member.clientFormsSaved)}
                      {member.sharedToTech > 0 && (
                        <span className="ml-2 text-xs text-teal-600">
                          ({formatNumber(member.sharedToTech)} shared)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {formatDateTime(member.lastActivity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default SalesWorkSummary;
