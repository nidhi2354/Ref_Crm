import { useEffect, useState } from "react";
import {
  Users,
  FolderOpen,
  CalendarClock,
  Trophy,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const STATUS_ROWS = [
  { key: "NEW", label: "New", bar: "bg-blue-500" },
  { key: "FOLLOW_UP", label: "Follow-up", bar: "bg-amber-500" },
  { key: "PROSPECTIVE", label: "Prospective", bar: "bg-purple-500" },
  { key: "CONVERTED", label: "Converted", bar: "bg-green-500" },
  { key: "NOT_INTERESTED", label: "Not Interested", bar: "bg-red-500" },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

function SalesStatCards({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      // Local date, so overdue / today follow-ups match the user's day
      const today = new Date().toLocaleDateString("en-CA");
      const response = await api.get("/leads/my-stats", { params: { today } });

      setStats(response.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Dashboard numbers load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const followUps = stats?.followUps;
  const followUpsDue = followUps ? followUps.overdue + followUps.dueToday : 0;

  const cards = [
    {
      title: "My Assigned Leads",
      value: stats?.totalLeads,
      subtitle: "Leads assigned to you",
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      goTo: "All Leads",
    },
    {
      title: "My Assigned Files",
      value: stats?.assignedFiles,
      subtitle: "Files shared by Admin",
      icon: FolderOpen,
      color: "bg-orange-50 text-orange-600",
      goTo: "My Assigned Files",
    },
    {
      title: "Follow-ups Due",
      value: followUpsDue,
      subtitle: followUps
        ? `${followUps.overdue} overdue · ${followUps.dueToday} today`
        : "",
      icon: CalendarClock,
      color: "bg-purple-50 text-purple-600",
      goTo: "Follow-ups",
    },
    {
      title: "Converted Clients",
      value: stats?.convertedClients,
      subtitle: "Successfully converted",
      icon: Trophy,
      color: "bg-green-50 text-green-600",
      goTo: "All Leads",
    },
  ];

  if (error) {
    return (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="flex items-start gap-2">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          {error}
        </p>

        <button
          type="button"
          onClick={fetchStats}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 font-semibold text-red-700 hover:bg-red-50"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  const totalLeads = stats?.totalLeads || 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <button
              key={card.title}
              type="button"
              onClick={() => onNavigate?.(card.goTo)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">{card.title}</p>
                  <h3 className="mt-3 text-2xl font-bold text-slate-800">
                    {loading ? "—" : formatNumber(card.value)}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={22} />
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                {loading ? "Loading..." : card.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800">Lead Status Summary</h3>
            <p className="mt-1 text-xs text-slate-500">
              Your leads by current status.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchStats}
            disabled={loading}
            aria-label="Refresh dashboard"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {!loading && totalLeads === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Abhi koi lead assign nahi hui. Admin ke assign karne par yahan
            summary dikhegi.
          </p>
        ) : (
          <div className="space-y-4">
            {STATUS_ROWS.map((row) => {
              const count = stats?.statusCounts?.[row.key] || 0;
              const percent = totalLeads
                ? Math.round((count / totalLeads) * 100)
                : 0;

              return (
                <div key={row.key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {row.label}
                    </span>
                    <span className="text-slate-500">
                      {formatNumber(count)} · {percent}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SalesStatCards;
