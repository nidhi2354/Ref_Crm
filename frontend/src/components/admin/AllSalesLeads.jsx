import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Users,
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertCircle,
  FileText,
} from "lucide-react";

import { API_URL } from "../../config";

const statusOptions = [
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "PROSPECTIVE", label: "Prospective" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
];

const statusStyles = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  FOLLOW_UP: "bg-amber-50 text-amber-700 ring-amber-200",
  PROSPECTIVE: "bg-purple-50 text-purple-700 ring-purple-200",
  CONVERTED: "bg-green-50 text-green-700 ring-green-200",
  NOT_INTERESTED: "bg-red-50 text-red-700 ring-red-200",
};

function AllSalesLeads() {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [memberFilter, setMemberFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/leads/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLeads(response.data.data || []);
    } catch (err) {
      console.error("Admin leads fetch error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load leads. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const members = useMemo(() => {
    const memberMap = new Map();

    leads.forEach((lead) => {
      const member = lead.salesUser;

      if (member?._id) {
        memberMap.set(member._id, {
          id: member._id,
          name: member.name || member.email || "Sales Member",
        });
      }
    });

    return Array.from(memberMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [leads]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leads.filter((lead) => {
      const searchableText = [
        lead.Name,
        lead.name,
        lead.Phone,
        lead.phone,
        lead.Email,
        lead.email,
        lead.Company,
        lead.company,
        lead.City,
        lead.city,
        lead.Requirement,
        lead.requirement,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || lead.status === statusFilter;

      const matchesMember =
        memberFilter === "ALL" ||
        lead.salesUser?._id === memberFilter;

      return matchesSearch && matchesStatus && matchesMember;
    });
  }, [leads, search, statusFilter, memberFilter]);

  const stats = useMemo(
    () => [
      {
        title: "Total Leads",
        value: leads.length,
        icon: ClipboardList,
        color: "bg-blue-50 text-blue-700",
      },
      {
        title: "Follow-ups",
        value: leads.filter((lead) => lead.status === "FOLLOW_UP").length,
        icon: Clock3,
        color: "bg-amber-50 text-amber-700",
      },
      {
        title: "Converted Clients",
        value: leads.filter((lead) => lead.status === "CONVERTED").length,
        icon: CheckCircle2,
        color: "bg-green-50 text-green-700",
      },
      {
        title: "Sales Members",
        value: members.length,
        icon: Users,
        color: "bg-purple-50 text-purple-700",
      },
    ],
    [leads, members]
  );

  const formatDate = (date) => {
    if (!date) return "Not scheduled";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "Not scheduled";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#203F72]">
            All Sales Leads
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor leads assigned across the Sales Department.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeads}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={fetchLeads}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>

              <p className="mt-4 text-3xl font-extrabold text-[#203F72]">
                {loading ? "—" : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Leads Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#203F72]">
                Lead Management
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter leads without changing their status.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, phone, email..."
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#203F72] focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#203F72]"
              >
                <option value="ALL">All Statuses</option>

                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              <select
                value={memberFilter}
                onChange={(event) => setMemberFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-[#203F72]"
              >
                <option value="ALL">All Sales Members</option>

                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <p>
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {loading ? "—" : filteredLeads.length}
                </span>{" "}
                of {loading ? "—" : leads.length} leads
              </p>

              {(search || statusFilter !== "ALL" || memberFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setMemberFilter("ALL");
                  }}
                  className="font-semibold text-[#203F72] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading Sales Department leads...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Leads could not be loaded. Use Retry to try again.
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <FileText size={23} className="text-slate-400" />
            </div>

            <p className="font-semibold text-slate-700">
              No leads found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filter options.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Company</th>
                  <th className="px-5 py-4 font-semibold">Requirement</th>
                  <th className="px-5 py-4 font-semibold">Sales Member</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Follow-up</th>
                  <th className="px-5 py-4 font-semibold">Source File</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => {
                  const status = statusOptions.find(
                    (option) => option.value === lead.status
                  );

                  return (
                    <tr
                      key={lead._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {lead.Name || lead.name || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {lead.City || lead.city || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-slate-700">
                          {lead.Phone || lead.phone || "—"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.Email || lead.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {lead.Company || lead.company || "—"}
                      </td>

                      <td className="max-w-[200px] px-5 py-4 text-slate-600">
                        <p className="line-clamp-2">
                          {lead.Requirement || lead.requirement || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {lead.salesUser?.name || "Unassigned"}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {lead.salesUser?.email || ""}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[lead.status] ||
                            "bg-slate-100 text-slate-600 ring-slate-200"
                            }`}
                        >
                          {status?.label || lead.status || "Unknown"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(lead.followUpDate)}
                      </td>

                      <td className="max-w-[180px] px-5 py-4">
                        <p className="truncate text-slate-600">
                          {lead.sourceFile?.originalName || "—"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AllSalesLeads;