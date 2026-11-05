
import { useEffect, useState } from "react";
import {
  X,
  UserRound,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileText,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";

function AssignLeadsModal({ isOpen, onClose, onUploadSuccess }) {
  const [salesMembers, setSalesMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchSalesMembers = async () => {
      setLoadingMembers(true);
      setError("");

      try {
        const response = await api.get("/users");
        const users = response.data.data;

        setSalesMembers(Array.isArray(users) ? users : []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load Sales members. Please try again."
        );
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchSalesMembers();
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedSalesMember = salesMembers.find(
    (member) => member._id === selectedMember
  );

  const handleClose = () => {
    if (uploading) return;

    setSelectedMember("");
    setSelectedFile(null);
    setError("");
    setSuccess("");
    onClose?.();
  };

  const handleUpload = async () => {
    setError("");
    setSuccess("");

    if (!selectedMember) {
      setError("Please select a Sales member.");
      return;
    }

    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("salesUserId", selectedMember);
    formData.append("file", selectedFile);

    setUploading(true);

    try {
      const response = await api.post("/files/upload", formData);

      const message =
        response.data.message || "File uploaded successfully.";

      setSuccess(message);
      onUploadSuccess?.(message);

      setSelectedMember("");
      setSelectedFile(null);

      // Reset the file input after a successful upload.
      const fileInput = document.getElementById("assignment-file");
      if (fileInput) fileInput.value = "";

      onClose?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "File upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="assign-file-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#203F72]">
              <UploadCloud size={22} />
            </div>

            <div>
              <h2
                id="assign-file-title"
                className="text-lg font-bold text-slate-800"
              >
                Assign File to Sales
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Select a Sales member and upload a file.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close file assignment dialog"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 p-5 sm:p-6">
          {/* Sales Member */}
          <div>
            <label
              htmlFor="sales-member"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Choose Sales Member
            </label>

            <select
              id="sales-member"
              value={selectedMember}
              disabled={loadingMembers || uploading}
              onChange={(event) => {
                setSelectedMember(event.target.value);
                setError("");
                setSuccess("");
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#203F72] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
            >
              <option value="">
                {loadingMembers
                  ? "Loading Sales members..."
                  : "Select a team member"}
              </option>

              {salesMembers.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name} — {member.email}
                </option>
              ))}
            </select>

            {!loadingMembers &&
              !error &&
              salesMembers.length === 0 && (
                <p className="mt-2 text-xs text-slate-500">
                  No Sales members found. Create a Sales user first.
                </p>
              )}
          </div>

          {selectedSalesMember && (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#203F72] shadow-sm">
                <UserRound size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {selectedSalesMember.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {selectedSalesMember.email}
                </p>
              </div>
            </div>
          )}

          {/* File Picker */}
          <div>
            <label
              htmlFor="assignment-file"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Select File
            </label>

            <label
              htmlFor="assignment-file"
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-4 py-7 text-center transition hover:border-[#203F72] hover:bg-blue-50/50"
            >
              {selectedFile ? (
                <>
                  <FileText size={30} className="text-[#203F72]" />
                  <p className="mt-3 max-w-full break-all text-sm font-semibold text-slate-800">
                    {selectedFile.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <span className="mt-2 text-xs font-semibold text-[#203F72]">
                    Choose a different file
                  </span>
                </>
              ) : (
                <>
                  <UploadCloud size={30} className="text-[#203F72]" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Click to browse files
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Select a document, spreadsheet, image or other file
                  </p>
                </>
              )}
            </label>

            <input
              id="assignment-file"
              type="file"
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] || null);
                setError("");
                setSuccess("");
              }}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-start gap-2 text-sm text-red-600"
            >
              <AlertCircle size={17} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          {success && (
            <p
              role="status"
              className="flex items-start gap-2 text-sm text-green-700"
            >
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || loadingMembers || salesMembers.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#203F72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#18315B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <CheckCircle2 size={17} />
                Upload & Assign
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

export default AssignLeadsModal;
