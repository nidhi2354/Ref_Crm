
import { useEffect, useState } from "react";
import {
  FileText,
  Download,
  RefreshCw,
  AlertCircle,
  FolderOpen,
} from "lucide-react";

import api from "../../services/api";

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MyAssignedFiles() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState("");

  const fetchFiles = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/files/my-files");
      setFiles(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your assigned files."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = async (file) => {
    setError("");
    setDownloadingId(file._id);

    try {
      const response = await api.get(
        `/files/my-files/${file._id}/download`,
        { responseType: "blob" }
      );

      const blobUrl = window.URL.createObjectURL(
        new Blob([response.data], {
          type: file.mimeType || "application/octet-stream",
        })
      );

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.originalName || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError("Download failed. Please try again.");
    } finally {
      setDownloadingId("");
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            My Assigned Files
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Files shared with you by your Admin.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchFiles}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="p-5">
        {error && (
          <div
            role="alert"
            className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading your files...
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#203F72]">
              <FolderOpen size={27} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-800">
              No files assigned yet
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Files assigned to your account by Admin will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#203F72]">
                    <FileText size={22} />
                  </div>

                  <div className="min-w-0">
                    <p className="break-all text-sm font-semibold text-slate-800">
                      {file.originalName || "Unnamed file"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatFileSize(file.size)} ·{" "}
                      {formatDate(file.createdAt)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload(file)}
                  disabled={downloadingId === file._id}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#203F72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#18315B] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  {downloadingId === file._id
                    ? "Downloading..."
                    : "Download"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MyAssignedFiles;
