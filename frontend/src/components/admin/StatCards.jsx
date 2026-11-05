
import { useEffect, useState } from "react";
import {
  Users,
  UserRoundPlus,
  UserCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import { API_URL } from "../../config";

function SalesStatCards() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Session expired. Please log in again.");
      }

      // Sales user's own statistics
      const response = await fetch(`${API_URL}/leads/my/analytics`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load your lead statistics."
        );
      }

      const data = result.data || {};

      setStats([
        {
          title: "Total Leads",
          value: data.totalLeads ?? 0,
          icon: Users,
          iconBg: "bg-blue-50",
          iconColor: "text-[#203F72]",
        },
        {
          title: "New Leads",
          value: data.newLeads ?? 0,
          icon: UserRoundPlus,
          iconBg: "bg-orange-50",
          iconColor: "text-[#F04424]",
        },
        {
          title: "Follow-ups",
          value: data.followUps ?? 0,
          icon: RefreshCw,
          iconBg: "bg-amber-50",
          iconColor: "text-[#F7941D]",
        },
        {
          title: "Converted Clients",
          value: data.convertedClients ?? 0,
          icon: UserCheck,
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
        },
      ]);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="mt-4 h-8 w-20 rounded bg-slate-200" />
            <div className="mt-4 h-3 w-32 rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 text-red-600" size={20} />

          <div className="flex-1">
            <p className="font-semibold text-red-700">
              Unable to load statistics
            </p>

            <p className="mt-1 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchStats}
              className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.title}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#203F72]">
                  {formatNumber(stat.value)}
                </h2>
              </div>

              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <Icon size={21} className={stat.iconColor} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SalesStatCards;
