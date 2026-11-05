import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  AlertCircle,
  FolderKanban,
  Paperclip,
  Download,
  X,
  Save,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "COMPLETED", label: "Completed" },
];

const statusColors = {
  PENDING: "bg-slate-50 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border-blue-200",
  REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
};

const WORK_TYPE_LABELS = {
  SEO: "SEO",
  SMO: "SMO",
  GMB: "GMB",
  WEBSITE: "Website",
  OTHER: "Other",
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatBudget(budget) {
  if (budget === null || budget === undefined || budget === "") return "—";

  return `₹${Number(budget).toLocaleString("en-IN")}`;
}

function Detail({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
        {children || "—"}
      </div>
    </div>
  );
}

function ProjectModal({ project, onClose, onUpdated }) {
  const [techStatus, setTechStatus] = useState(project.techStatus);
  const [techNotes, setTechNotes] = useState(project.techNotes || "");
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.patch(`/tech/projects/${project._id}`, {
        techStatus,
        techNotes,
      });

      onUpdated(response.data.data);
      setMessage("Project updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      setDownloading(file.filename);
      setError("");

      const response = await api.get(
        `/tech/projects/${project._id}/files/${file.filename}`,
        { responseType: "blob" }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], { type: file.mimeType })
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.originalName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tech-project-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div className="min-w-0">
            <h3
              id="tech-project-title"
              className="truncate text-lg font-bold text-slate-800"
            >
              {project.projectTitle}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {project.clientName}
              {project.companyName ? ` · ${project.companyName}` : ""}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Detail label="Client Name">{project.clientName}</Detail>
            <Detail label="Company">{project.companyName}</Detail>
            <Detail label="Phone">{project.phoneNo}</Detail>
            <Detail label="Email">{project.email}</Detail>
            <Detail label="Work Type">
              {WORK_TYPE_LABELS[project.workType] || project.workType}
            </Detail>
            <Detail label="Deadline">{formatDate(project.deadline)}</Detail>
            <Detail label="Budget">{formatBudget(project.budget)}</Detail>
            <Detail label="Shared By">
              {project.salesUser?.name}
              {project.sharedAt ? ` · ${formatDate(project.sharedAt)}` : ""}
            </Detail>
          </div>

          <Detail label="Project Description">
            {project.projectDescription}
          </Detail>
          <Detail label="Payment Details">{project.paymentDetails}</Detail>
          <Detail label="Additional Notes">{project.additionalNotes}</Detail>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Reference Files
            </p>

            {project.referenceFiles?.length ? (
              <ul className="mt-2 space-y-2">
                {project.referenceFiles.map((file) => (
                  <li
                    key={file.filename}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <Paperclip size={15} className="shrink-0 text-slate-400" />

                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {file.originalName}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDownload(file)}
                      disabled={downloading === file.filename}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#203F72] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#17325d] disabled:opacity-60"
                    >
                      <Download size={13} />
                      {downloading === file.filename
                        ? "Downloading..."
                        : "Download"}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-sm text-slate-500">No files attached.</p>
            )}
          </div>

          {/* Tech work */}
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-800">Tech Work</p>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Status
              </span>
              <select
                value={techStatus}
                onChange={(e) => {
                  setTechStatus(e.target.value);
                  setMessage("");
                }}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 ${statusColors[techStatus]}`}
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-600">
                Tech Notes
              </span>
              <textarea
                rows={3}
                value={techNotes}
                onChange={(e) => {
                  setTechNotes(e.target.value);
                  setMessage("");
                }}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 px-6 py-4">
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

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203F72] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17325d] disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tech/projects");
      setProjects(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load projects. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleUpdated = (updated) => {
    setProjects((current) =>
      current.map((project) =>
        project._id === updated._id ? updated : project
      )
    );
  };

  const filtered = projects.filter((project) => {
    const text = search.toLowerCase();

    const matchesSearch = [
      project.projectTitle,
      project.clientName,
      project.companyName,
      project.workType,
    ].some((value) => String(value || "").toLowerCase().includes(text));

    return (
      matchesSearch &&
      (statusFilter === "ALL" || project.techStatus === statusFilter)
    );
  });

  const selected = projects.find((project) => project._id === selectedId);

  const countOf = (status) =>
    projects.filter((project) => project.techStatus === status).length;

  const summary = [
    { label: "Total Projects", count: projects.length, color: "text-blue-600" },
    { label: "Pending", count: countOf("PENDING"), color: "text-slate-600" },
    { label: "In Progress", count: countOf("IN_PROGRESS"), color: "text-indigo-600" },
    { label: "Completed", count: countOf("COMPLETED"), color: "text-green-600" },
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
          <div>
            <h2 className="font-bold text-slate-800">Client Projects</h2>
            <p className="mt-1 text-xs text-slate-500">
              Projects shared by the Sales Department.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="ALL">All statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchProjects}
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
            Loading projects...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#203F72]">
              <FolderKanban size={27} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              {projects.length === 0
                ? "No projects shared yet"
                : "No matching projects"}
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {projects.length === 0
                ? "Projects shared by Sales users will appear here."
                : "Try another search or status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Project</th>
                  <th className="px-5 py-4 font-semibold">Client</th>
                  <th className="px-5 py-4 font-semibold">Work Type</th>
                  <th className="px-5 py-4 font-semibold">Deadline</th>
                  <th className="px-5 py-4 font-semibold">Shared By</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-center font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filtered.map((project) => (
                  <tr key={project._id} className="transition hover:bg-slate-50/70">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {project.projectTitle}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-700">
                        {project.clientName}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {project.companyName || "—"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {WORK_TYPE_LABELS[project.workType] || project.workType}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(project.deadline)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {project.salesUser?.name || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColors[project.techStatus]}`}
                      >
                        {STATUS_OPTIONS.find(
                          (status) => status.value === project.techStatus
                        )?.label || project.techStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedId(project._id)}
                        className="rounded-lg border border-[#203F72] px-3 py-2 text-xs font-semibold text-[#203F72] transition hover:bg-blue-50"
                      >
                        View Details
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
        <ProjectModal
          key={selected._id}
          project={selected}
          onClose={() => setSelectedId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </section>
  );
}

export default TechProjects;
