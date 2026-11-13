import { useEffect, useState } from "react";
import { Download, RefreshCw, FileBarChart, AlertCircle } from "lucide-react";

import api from "../../services/api";

const STATUS_LABELS = {
  NEW: "New",
  FOLLOW_UP: "Follow-up",
  PROSPECTIVE: "Prospective",
  CONVERTED: "Converted",
  NOT_INTERESTED: "Not Interested",
};

const STATUS_STYLES = {
  NEW: "bg-blue-50 text-blue-700",
  FOLLOW_UP: "bg-amber-50 text-amber-700",
  PROSPECTIVE: "bg-purple-50 text-purple-700",
  CONVERTED: "bg-green-50 text-green-700",
  NOT_INTERESTED: "bg-red-50 text-red-700",
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN") : "—";

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "No activity";

// Ek batch (image / file) ka result ek standard format mein
function BatchReport({ refreshKey = 0 }) {
  const [batches, setBatches] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const loadBatches = async () => {
    try {
      const response = await api.get("/files");
      setBatches(response.data.data || []);
    } catch {
      setBatches([]);
    }
  };

  const loadReport = async (fileId) => {
    if (!fileId) {
      setReport(null);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await api.get("/leads/admin/batch-report", {
        params: { sourceFile: fileId },
      });

      setReport(response.data.data);
    } catch (err) {
      setReport(null);
      setError(err.response?.data?.message || "Report load nahi ho paayi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [refreshKey]);

  useEffect(() => {
    loadReport(selectedId);
  }, [selectedId, refreshKey]);

  const handleDownload = async () => {
    if (!selectedId) return;

    try {
      setDownloading(true);

      const response = await api.get("/leads/admin/batch-report", {
        params: { sourceFile: selectedId, format: "xlsx" },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-report-${selectedId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Excel download nahi ho paaya. Please dobara try karo.");
    } finally {
      setDownloading(false);
    }
  };

  const summary = report?.summary;

  const summaryCards = summary
    ? [
        { label: "Total Leads", value: summary.total },
        { label: "Converted", value: summary.converted },
        { label: "Follow-up", value: summary.followUp },
        { label: "Prospective", value: summary.prospective },
        { label: "Not Interested", value: summary.notInterested },
        { label: "Untouched", value: summary.untouched },
      ]
    : [];

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <FileBarChart size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#203F72]">
              Batch Result Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Ek image ya file se aaye leads par Sales member ka kaam, ek
              format mein.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadBatches}
            aria-label="Refresh batches"
            className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!selectedId || downloading || !report}
            className="inline-flex items-center gap-2 rounded-xl bg-[#203F72] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#19335e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? "Downloading..." : "Excel Download"}
          </button>
        </div>
      </div>

      <label className="block max-w-xl">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Batch chuno
        </span>

        <select
          value={selectedId}
          onChange={(event) => setSelectedId(event.target.value)}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">-- Batch select karo --</option>

          {batches.map((batch) => (
            <option key={batch._id} value={batch._id}>
              {batch.originalName} · {batch.salesUser?.name || "Sales"} ·{" "}
              {formatDate(batch.createdAt)}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <p className="text-sm text-slate-500">Report load ho rahi hai...</p>
      )}

      {report && !loading && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {summaryCards.map((card) => (
              <div
                key={card.label}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>

                <p className="mt-2 text-2xl font-bold text-[#203F72]">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {report.rows.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              Is batch mein koi lead nahi hai.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[1000px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Lead</th>
                    <th className="px-4 py-3 font-semibold">Contact</th>
                    <th className="px-4 py-3 font-semibold">Sales Member</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Follow-up</th>
                    <th className="px-4 py-3 font-semibold">Last Note</th>
                    <th className="px-4 py-3 font-semibold">Activities</th>
                    <th className="px-4 py-3 font-semibold">Last Activity</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {report.rows.map((row, index) => (
                    <tr key={index} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {row.name || "—"}
                        {row.company && (
                          <p className="text-xs font-normal text-slate-500">
                            {row.company}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {row.phone || "—"}
                        {row.email && (
                          <p className="text-xs text-slate-500">{row.email}</p>
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700">
                        {row.salesUser || "—"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[row.status] || "bg-slate-100 text-slate-700"}`}
                        >
                          {STATUS_LABELS[row.status] || row.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(row.followUpDate)}
                      </td>

                      <td className="max-w-xs whitespace-normal px-4 py-3 text-slate-600">
                        {row.lastNote || "—"}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {row.activities}
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(row.lastActivity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default BatchReport;
