import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  RefreshCw,
  Save,
  CalendarDays,
  Users,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import ClientWorkDetailsModal from "./ClientWorkDetailsModal";
import api from "../../services/api";

import { API_URL } from "../../config";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "PROSPECTIVE", label: "Prospective" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
];

const statusColors = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  FOLLOW_UP: "bg-amber-50 text-amber-700 border-amber-200",
  PROSPECTIVE: "bg-purple-50 text-purple-700 border-purple-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  NOT_INTERESTED: "bg-red-50 text-red-700 border-red-200",
};

function LeadsTable() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [workDetailsLead, setWorkDetailsLead] = useState(null);
  // Saved Client Work Details, keyed by lead id
  const [workDetails, setWorkDetails] = useState({});

  const token = sessionStorage.getItem("token");

  // Fetch leads assigned to the logged-in Sales User
  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!token) {
        setError("Login session nahi mili. Please dobara login karo.");
        return;
      }

      const response = await axios.get(`${API_URL}/leads`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setLeads(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Leads load nahi ho paayi. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert a saved WorkDetails document into form values
  const toFormValues = (doc) => ({
    clientName: doc.clientName || "",
    companyName: doc.companyName || "",
    phoneNo: doc.phoneNo || "",
    email: doc.email || "",
    workType: doc.workType || "",
    projectTitle: doc.projectTitle || "",
    projectDescription: doc.projectDescription || "",
    budget: doc.budget ?? "",
    paymentDetails: doc.paymentDetails || "",
    deadline: doc.deadline ? String(doc.deadline).slice(0, 10) : "",
    additionalNotes: doc.additionalNotes || "",
    referenceFiles: doc.referenceFiles || [],
    sharedToTech: Boolean(doc.sharedToTech),
  });

  const fetchWorkDetails = async () => {
    try {
      const response = await api.get("/leads/work-details");
      const byLead = {};

      (response.data.data || []).forEach((doc) => {
        byLead[doc.lead] = toFormValues(doc);
      });

      setWorkDetails(byLead);
    } catch {
      // Table still works without saved work details
    }
  };

  // Save Client Work Details (new files go as multipart, kept files by name)
  const saveWorkDetails = async (leadId, values) => {
    const formData = new FormData();
    // eslint-disable-next-line no-unused-vars
    const { referenceFiles, sharedToTech, ...fields } = values;

    Object.entries(fields).forEach(([key, value]) =>
      formData.append(key, value ?? "")
    );

    const keptFiles = referenceFiles.filter((file) => !(file instanceof File));

    formData.append(
      "keepFiles",
      JSON.stringify(keptFiles.map((file) => file.filename))
    );

    referenceFiles
      .filter((file) => file instanceof File)
      .forEach((file) => formData.append("referenceFiles", file));

    await api.put(`/leads/${leadId}/work-details`, formData);

    // Saved details are then shared with the Tech Department
    const response = await api.post(`/leads/${leadId}/work-details/share`);

    setWorkDetails((current) => ({
      ...current,
      [leadId]: toFormValues(response.data.data),
    }));
  };

  useEffect(() => {
    fetchLeads();
    fetchWorkDetails();
    // Fetch when this component mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update a field locally while the user edits the row
  const handleChange = (leadId, field, value) => {
    setLeads((currentLeads) =>
      currentLeads.map((lead) =>
        lead._id === leadId ? { ...lead, [field]: value } : lead
      )
    );

    setSuccess("");
  };

  // Save status, follow-up date and notes to MongoDB
  const handleSave = async (lead) => {
    try {
      setSavingId(lead._id);
      setError("");
      setSuccess("");

      const response = await axios.patch(
        `${API_URL}/leads/${lead._id}`,
        {
          status: lead.status,
          followUpDate: lead.followUpDate || null,
          notes: lead.notes || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        setSuccess(`Lead "${lead.Name || "Customer"}" updated successfully.`);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Lead update nahi hui. Please dobara try karo."
      );
    } finally {
      setSavingId(null);
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const searchText = search.toLowerCase();

    return [
      lead.Name,
      lead.Phone,
      lead.Email,
      lead.Company,
      lead.City,
      lead.Requirement,
    ].some((value) => String(value || "").toLowerCase().includes(searchText));
  });

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <RefreshCw size={20} className="animate-spin" />
          Loading your leads...
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      {/* Header and statistics */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">
              Lead Management
            </h2>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {leads.length} Leads
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage assigned customers, follow-ups and lead status.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLeads}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          {
            label: "Total Leads",
            count: leads.length,
            color: "text-blue-600",
          },
          {
            label: "New Leads",
            count: leads.filter((lead) => lead.status === "NEW").length,
            color: "text-indigo-600",
          },
          {
            label: "Follow-ups",
            count: leads.filter((lead) => lead.status === "FOLLOW_UP").length,
            color: "text-amber-600",
          },
          {
            label: "Converted",
            count: leads.filter((lead) => lead.status === "CONVERTED").length,
            color: "text-green-600",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-slate-500">{item.label}</p>
              <Users size={18} className={item.color} />
            </div>

            <p className={`mt-3 text-2xl font-bold ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Search */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <h3 className="font-bold text-slate-800">All Assigned Leads</h3>
            <p className="mt-1 text-xs text-slate-500">
              Search and update your customer records.
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* Responsive table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Company</th>
                <th className="px-5 py-4 font-semibold">Requirement</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Follow-up Date</th>
                <th className="px-5 py-4 font-semibold">Client Work Details</th>
                <th className="px-5 py-4 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead._id}
                  className="align-top transition hover:bg-slate-50/70"
                >
                  {/* Customer */}
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">
                      {lead.Name || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lead.City || "City not available"}
                    </p>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-4">
                    <p className="whitespace-nowrap text-slate-700">
                      {lead.Phone || "—"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {lead.Email || "—"}
                    </p>
                  </td>

                  {/* Company */}
                  <td className="px-5 py-4 font-medium text-slate-700">
                    {lead.Company || "—"}
                  </td>

                  {/* Requirement */}
                  <td className="max-w-48 whitespace-normal px-5 py-4 text-slate-600">
                    {lead.Requirement || "—"}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        handleChange(lead._id, "status", e.target.value)
                      }
                      className={`min-w-36 rounded-lg border px-2.5 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 ${statusColors[lead.status] ||
                        "border-slate-200 bg-white text-slate-700"
                        }`}
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Follow-up Date */}
                  <td className="px-5 py-4">
                    <div className="relative min-w-40">
                      <CalendarDays
                        size={15}
                        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="date"
                        value={
                          lead.followUpDate
                            ? String(lead.followUpDate).slice(0, 10)
                            : ""
                        }
                        onChange={(e) =>
                          handleChange(
                            lead._id,
                            "followUpDate",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-2 text-xs text-slate-700 outline-none focus:border-blue-500"
                      />
                    </div>
                  </td>

                  {/* Client Work Details */}
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => setWorkDetailsLead(lead)}
                      className="inline-flex min-w-44 items-center justify-center gap-2 rounded-lg border border-[#203F72] px-3 py-2 text-xs font-semibold text-[#203F72] transition hover:bg-blue-50"
                    >
                      <ClipboardList size={14} />
                      {workDetails[lead._id]
                        ? "Edit Work Details"
                        : "Add Work Details"}
                    </button>
                  </td>

                  {/* Save */}
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleSave(lead)}
                      disabled={savingId === lead._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#203F72] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#17325d] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingId === lead._id ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <Save size={14} />
                      )}

                      {savingId === lead._id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Users
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="font-semibold text-slate-700">
                      {search ? "No matching leads found" : "No leads assigned yet"}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {search
                        ? "Try another customer name, email or company."
                        : "Leads assigned by your Admin will appear here."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {filteredLeads.length} of {leads.length} leads
          </span>

          <span>Changes are saved when you click Save.</span>
        </div>
      </div>

      {workDetailsLead && (
        <ClientWorkDetailsModal
          lead={workDetailsLead}
          initialValues={workDetails[workDetailsLead._id]}
          onClose={() => setWorkDetailsLead(null)}
          onSave={(values) => saveWorkDetails(workDetailsLead._id, values)}
        />
      )}
    </section>
  );
}

export default LeadsTable;