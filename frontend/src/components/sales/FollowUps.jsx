import { useEffect, useState } from "react";
import {
  RefreshCw,
  AlertCircle,
  CalendarCheck,
  Search,
  X,
  Save,
  CheckCircle2,
  History,
} from "lucide-react";

import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "FOLLOW_UP", label: "Follow-up" },
  { value: "PROSPECTIVE", label: "Prospective" },
  { value: "CONVERTED", label: "Converted" },
  { value: "NOT_INTERESTED", label: "Not Interested" },
];

const statusLabel = (value) =>
  STATUS_OPTIONS.find((status) => status.value === value)?.label || value;

const statusColors = {
  NEW: "bg-blue-50 text-blue-700 border-blue-200",
  FOLLOW_UP: "bg-amber-50 text-amber-700 border-amber-200",
  PROSPECTIVE: "bg-purple-50 text-purple-700 border-purple-200",
  CONVERTED: "bg-green-50 text-green-700 border-green-200",
  NOT_INTERESTED: "bg-red-50 text-red-700 border-red-200",
};

const toDateString = (date) => String(date || "").slice(0, 10);

// Local YYYY-MM-DD for "today"
const localToday = () => new Date().toLocaleDateString("en-CA");

// Days from today to the due date (negative = overdue)
const daysUntil = (due, today) =>
  Math.round((Date.parse(toDateString(due)) - Date.parse(today)) / 86400000);

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function DueBadge({ days }) {
  if (days < 0) {
    return (
      <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
        Overdue by {Math.abs(days)} {Math.abs(days) === 1 ? "day" : "days"}
      </span>
    );
  }

  if (days === 0) {
    return (
      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
        Due today
      </span>
    );
  }

  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      In {days} {days === 1 ? "day" : "days"}
    </span>
  );
}

function HistoryEntry({ entry }) {
  return (
    <li className="relative border-l-2 border-slate-200 pb-4 pl-4 last:pb-0">
      <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#203F72]" />

      <p className="text-xs text-slate-400">{formatDateTime(entry.at)}</p>

      <div className="mt-1 space-y-1 text-sm text-slate-700">
        {entry.toStatus && (
          <p>
            Status:{" "}
            <span className="font-semibold">{statusLabel(entry.fromStatus)}</span>
            {" → "}
            <span className="font-semibold">{statusLabel(entry.toStatus)}</span>
          </p>
        )}

        {entry.followUpChanged && (
          <p>
            Next follow-up:{" "}
            <span className="font-semibold">
              {entry.followUpDate ? formatDate(entry.followUpDate) : "Cleared"}
            </span>
          </p>
        )}

        {entry.note && (
          <p className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
            {entry.note}
          </p>
        )}
      </div>
    </li>
  );
}

function FollowUpModal({ lead, onClose, onSaved }) {
  const [status, setStatus] = useState(lead.status);
  const [followUpDate, setFollowUpDate] = useState(
    toDateString(lead.followUpDate)
  );
  const [note, setNote] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      const response = await api.get(`/leads/${lead._id}/history`);
      setHistory(response.data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
    // Load once when the modal opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    const unchanged =
      status === lead.status &&
      followUpDate === toDateString(lead.followUpDate) &&
      !note.trim();

    if (unchanged) {
      setError("Kuch change nahi hua. Status, date ya note update karo.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      await api.patch(`/leads/${lead._id}`, {
        status,
        followUpDate: followUpDate || null,
        note,
      });

      await onSaved();
    } catch (err) {
      setError(err.response?.data?.message || "Update save nahi hui.");
      setSaving(false);
      return;
    }

    // The lead may have left the follow-up list (converted / not interested)
    setNote("");
    setMessage("Follow-up updated.");
    setSaving(false);
    setLoadingHistory(true);
    loadHistory();
  };

  const inputClass =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="follow-up-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h3
              id="follow-up-title"
              className="truncate text-lg font-bold text-slate-800"
            >
              {lead.Name || "Customer"}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {[lead.Company, lead.Phone, lead.Email]
                .filter(Boolean)
                .join(" · ") || "No contact details"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setError("");
                  }}
                  className={inputClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Next Follow-up Date
                </span>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => {
                    setFollowUpDate(e.target.value);
                    setError("");
                  }}
                  className={inputClass}
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Follow-up Note
              </span>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => {
                  setNote(e.target.value);
                  setError("");
                }}
                placeholder="Customer se kya baat hui..."
                className={`${inputClass} resize-y`}
              />
            </label>

            {error && (
              <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={16} />
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 size={16} />
                {message}
              </p>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#203F72] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17325d] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save Update"}
            </button>
          </div>

          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <History size={16} />
              History
            </h4>

            {loadingHistory ? (
              <p className="text-sm text-slate-500">Loading history...</p>
            ) : history.length === 0 ? (
              <p className="text-sm text-slate-500">
                Abhi koi activity nahi hui.
              </p>
            ) : (
              <ul>
                {history.map((entry, index) => (
                  <HistoryEntry key={`${entry.at}-${index}`} entry={entry} />
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { value: "ALL", label: "All" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TODAY", label: "Today" },
  { value: "UPCOMING", label: "Upcoming" },
];

function FollowUps() {
  // "Today" is fixed when the page opens
  const [today] = useState(localToday);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const fetchFollowUps = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads/follow-ups");
      setLeads(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Follow-ups load nahi ho paaye. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  // Refresh the list without the full-page loading state
  const refreshQuietly = async () => {
    const response = await api.get("/leads/follow-ups");
    setLeads(response.data.data || []);
  };

  const dayCount = (lead) => daysUntil(lead.followUpDate, today);

  const overdue = leads.filter((lead) => dayCount(lead) < 0);
  const dueToday = leads.filter((lead) => dayCount(lead) === 0);
  const upcoming = leads.filter((lead) => dayCount(lead) > 0);

  const byFilter = {
    ALL: leads,
    OVERDUE: overdue,
    TODAY: dueToday,
    UPCOMING: upcoming,
  };

  const visible = byFilter[filter].filter((lead) => {
    const text = search.toLowerCase();

    return [lead.Name, lead.Phone, lead.Email, lead.Company].some((value) =>
      String(value || "").toLowerCase().includes(text)
    );
  });

  const selected = leads.find((lead) => lead._id === selectedId);

  const summary = [
    { label: "Overdue", count: overdue.length, color: "text-red-600" },
    { label: "Due Today", count: dueToday.length, color: "text-amber-600" },
    { label: "Upcoming", count: upcoming.length, color: "text-blue-600" },
    { label: "Total Follow-ups", count: leads.length, color: "text-slate-700" },
  ];

  return (
    <section className="space-y-5">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {summary.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-3 text-2xl font-bold ${item.color}`}>
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${filter === item.value
                  ? "bg-[#203F72] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
              >
                {item.label} ({byFilter[item.value].length})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search follow-ups..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <button
              type="button"
              onClick={fetchFollowUps}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm text-slate-500">
            Loading follow-ups...
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#203F72]">
              <CalendarCheck size={27} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              {leads.length === 0 ? "No follow-ups scheduled" : "Nothing here"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {leads.length === 0
                ? "Leads mein follow-up date set karoge to yahan dikhengi."
                : "Is filter ya search mein koi follow-up nahi hai."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Customer</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Follow-up</th>
                  <th className="px-5 py-4 font-semibold">Last Note</th>
                  <th className="px-5 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {visible.map((lead) => (
                  <tr key={lead._id} className="align-top transition hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">
                        {lead.Name || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.Company || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap text-slate-700">
                        {lead.Phone || "—"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.Email || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColors[lead.status]}`}
                      >
                        {statusLabel(lead.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <p className="whitespace-nowrap font-medium text-slate-700">
                        {formatDate(lead.followUpDate)}
                      </p>
                      <div className="mt-1">
                        <DueBadge days={dayCount(lead)} />
                      </div>
                    </td>

                    <td className="max-w-56 px-5 py-4 text-slate-600">
                      <p className="line-clamp-2 whitespace-normal break-words">
                        {lead.notes || "—"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedId(lead._id)}
                        className="rounded-lg border border-[#203F72] px-3 py-2 text-xs font-semibold text-[#203F72] transition hover:bg-blue-50"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <FollowUpModal
          key={selected._id}
          lead={selected}
          onClose={() => setSelectedId(null)}
          onSaved={refreshQuietly}
        />
      )}
    </section>
  );
}

export default FollowUps;
