
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  FolderOpen,
  Menu,
  X,
  ArrowLeft,
  LogOut,
  UserCheck,
  UserPlus,
  RefreshCw,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import SalesMembers from "../../components/sales/SalesMembers";
import SalesFileAssignment from "../../components/admin/SalesFileAssignment";
import AllSalesLeads from "../../components/admin/AllSalesLeads";
import { handleSessionExpired } from "../../services/session";

import { API_URL } from "../../config";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Sales Users", icon: Users },
  { label: "All Leads", icon: ClipboardList },
  { label: "Files", icon: FolderOpen },
];

function SalesDepartmentDashboard() {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [analyticsError, setAnalyticsError] = useState("");

  let user = {};

  try {
    user = JSON.parse(sessionStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  // Fetch live analytics from the backend
  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      setAnalyticsError("");

      const token = sessionStorage.getItem("token");

      if (!token) {
        throw new Error("Your session has expired. Please log in again.");
      }

      const response = await fetch(
        `${API_URL}/leads/admin/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        handleSessionExpired();
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load Sales analytics."
        );
      }

      setAnalytics(result.data || {});
    } catch (error) {
      setAnalyticsError(
        error.message || "Something went wrong while loading analytics."
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  // Format numbers according to Indian number format
  const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value) || 0);

  // Dynamic statistics from backend
  const statCards = [
    {
      title: "Total Leads",
      value: analytics?.totalLeads,
      subtitle: "All leads in the department",
      icon: ClipboardList,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-700",
    },
    {
      title: "New Leads",
      value: analytics?.newLeads,
      subtitle: "Waiting for follow-up",
      icon: UserPlus,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      title: "Follow-ups",
      value: analytics?.followUps,
      subtitle: "Leads in follow-up",
      icon: RefreshCw,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Converted Clients",
      value: analytics?.convertedClients,
      subtitle: "Successfully converted",
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Sales Users",
      value: analytics?.totalSalesUsers,
      subtitle: "Total department members",
      icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Active Sales Users",
      value: analytics?.activeSalesUsers,
      subtitle: "Currently active members",
      icon: UserCheck,
      iconBg: "bg-teal-50",
      iconColor: "text-teal-600",
    },
  ];

  // Main dashboard
  const renderDashboard = () => (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#203F72]">
            Sales Department Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Live overview of leads and Sales team performance.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalytics}
          disabled={loadingAnalytics}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#203F72] shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={16}
            className={loadingAnalytics ? "animate-spin" : ""}
          />

          Refresh Data
        </button>
      </div>

      {/* API Error */}
      {analyticsError && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="font-semibold text-red-700">
                Unable to load analytics
              </p>

              <p className="mt-1 text-sm text-red-600">
                {analyticsError}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Department Statistics */}
      <section className="mt-7">
        <h2 className="mb-4 text-base font-bold text-[#203F72]">
          Department Statistics
        </h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {loadingAnalytics && !analytics ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-5 h-9 w-20 rounded bg-slate-200" />
                <div className="mt-4 h-3 w-40 rounded bg-slate-100" />
              </div>
            ))
          ) : analyticsError && !analytics ? (
            null
          ) : (
            statCards.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {item.title}
                      </p>

                      <h3 className="mt-3 text-3xl font-extrabold text-[#203F72]">
                        {formatNumber(item.value)}
                      </h3>
                    </div>

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}
                    >
                      <Icon size={23} className={item.iconColor} />
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-slate-500">
                    {item.subtitle}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>

    </>
  );












  // Sales team performance table
  const renderSalesPerformance = () => {
    const salesPerformance = analytics?.salesPerformance || [];

    return (
      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#203F72]">
              Sales Member Performance
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Lead performance for each Sales team member.
            </p>
          </div>

          <span className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-[#203F72]">
            {salesPerformance.length} Members
          </span>
        </div>

        {loadingAnalytics && !analytics ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Loading Sales performance...
          </div>
        ) : analyticsError && !analytics ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Performance data is unavailable.
          </div>
        ) : salesPerformance.length === 0 ? (
          <div className="p-10 text-center">
            <Users size={36} className="mx-auto text-slate-300" />

            <h3 className="mt-3 font-semibold text-slate-700">
              No Sales performance data
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Performance details will appear when Sales members have leads.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Sales Member
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total Leads
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Converted
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Follow-ups
                  </th>

                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Conversion Rate
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {salesPerformance.map((member, index) => {
                  const totalLeads = Number(member.totalLeads) || 0;
                  const converted = Number(member.converted) || 0;
                  const followUps = Number(member.followUps) || 0;

                  const conversionRate =
                    totalLeads > 0
                      ? ((converted / totalLeads) * 100).toFixed(1)
                      : "0.0";

                  return (
                    <tr
                      key={member.salesUserId || member.email || index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-[#203F72]">
                            {(member.name || "S")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {member.name || "Sales Member"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {member.email || "No email available"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-700">
                        {formatNumber(totalLeads)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700">
                          {formatNumber(converted)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-700">
                        {formatNumber(followUps)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-green-500"
                              style={{
                                width: `${Math.min(
                                  Number(conversionRate),
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-sm font-semibold text-slate-700">
                            {conversionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  // Page content based on selected navigation
  const renderPageContent = () => {
    switch (activeNav) {
      case "Sales Users":
        return <SalesMembers />;

      case "All Leads":
        return <AllSalesLeads />;

      case "Files":
        return <SalesFileAssignment />;

      case "Dashboard":
      default:
        return (
          <>
            {renderDashboard()}
            {renderSalesPerformance()}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[255px] flex-col bg-[#203F72] text-white transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <div className="text-2xl font-extrabold tracking-tight">
            Reef<span className="text-[#F7941D]">CRM</span>
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

        {/* Department label */}
        <div className="px-5 pb-3 pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">
            Department
          </p>

          <p className="mt-2 text-sm font-semibold">
            Sales Department
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.label;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setActiveNav(item.label);
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${isActive
                  ? "bg-white text-[#203F72] shadow-sm"
                  : "text-blue-100 hover:bg-white/10 hover:text-white"
                  }`}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar bottom actions */}
        <div className="space-y-2 border-t border-white/10 p-4">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Admin
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-blue-100 transition hover:bg-red-500/20 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:ml-[255px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <p className="text-xs text-slate-500">
                Workspace / Admin / Sales
              </p>

              <h2 className="mt-1 truncate text-lg font-bold text-[#203F72]">
                {activeNav === "Dashboard"
                  ? "Sales Department"
                  : activeNav}
              </h2>
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user.name || "Admin"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
              {(user.name || "A").charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page body */}
        <main className="p-4 sm:p-6 lg:p-8">
          {renderPageContent()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ReefCRM. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
export default SalesDepartmentDashboard;

