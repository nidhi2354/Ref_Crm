
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";

import SalesSidebar from "../../components/sales/SalesSidebar";
import SalesHeader from "../../components/sales/SalesHeader";
import { SalesScopeProvider } from "../../context/SalesScopeContext";

import LeadsTable from "../../components/sales/LeadsTable";
import MyAssignedFiles from "../../components/sales/MyAssignedFiles";
import FollowUps from "../../components/sales/FollowUps";
import SalesStatCards from "../../components/sales/SalesStatCards";

function SalesPageContent({ activeNav, setActiveNav }) {
  switch (activeNav) {
    case "Dashboard":
      return (
        <div className="space-y-6">
          <SalesStatCards onNavigate={setActiveNav} />
        </div>
      );

    case "All Leads":
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-800">
              All Leads
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View and manage your assigned leads and their statuses.
            </p>
          </div>

          <LeadsTable />
        </section>
      );

    case "Follow-ups":
      return <FollowUps />;

    case "My Assigned Files":
      return <MyAssignedFiles />;

    default:
      return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-bold text-slate-800">
            Page Not Available
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This section has not been implemented yet.
          </p>
        </section>
      );
  }
}

// viewUserId: Admin kisi Sales user ka dashboard read-only dekh raha hai
function SalesUserDashboard({ viewUserId = null, viewUserName = "", onBack }) {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");

  const isViewing = Boolean(viewUserId);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <SalesScopeProvider
      value={{ salesUserId: viewUserId, readOnly: isViewing }}
    >
      <div className="min-h-screen bg-slate-50">
        <SalesSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeNav={activeNav}
          setActiveNav={setActiveNav}
          onLogout={handleLogout}
          showLogout={!isViewing}
        />

        <div className="min-h-screen md:ml-[255px]">
          <SalesHeader
            setSidebarOpen={setSidebarOpen}
            activeNav={activeNav}
          />

          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            {isViewing && (
              <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-amber-800">
                  <Eye size={18} className="shrink-0" />
                  <span>
                    Admin view: <strong>{viewUserName || "Sales user"}</strong> ka
                    dashboard (read-only)
                  </span>
                </p>

                <button
                  type="button"
                  onClick={onBack}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
                >
                  <ArrowLeft size={16} />
                  Back to Sales Department
                </button>
              </div>
            )}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {activeNav === "Dashboard"
                  ? "Sales Dashboard"
                  : activeNav}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {activeNav === "Dashboard"
                  ? "Track your leads, follow-ups, and conversions."
                  : activeNav === "All Leads"
                    ? "Manage your assigned leads and update their status."
                    : activeNav === "Follow-ups"
                      ? "Track overdue and upcoming follow-ups with full history."
                    : activeNav === "My Assigned Files"
                      ? "View files assigned to you by the Admin."
                      : "Manage your Sales activities."}
              </p>
            </div>

            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-700">
                Sales Department
              </span>

              {" / "}

              {activeNav}
            </div>
          </div>

          <SalesPageContent
            activeNav={activeNav}
            setActiveNav={setActiveNav}
          />
          </main>
        </div>
      </div>
    </SalesScopeProvider>
  );
}

export default SalesUserDashboard;
