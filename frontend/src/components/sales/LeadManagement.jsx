import { useRef, useState } from "react";
import {
  Upload,
  FileSpreadsheet,
  UserRoundPlus,
  ArrowRight,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

function LeadManagement({ onAssignLeads }) {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setMessage("");
    setError("");

    if (!file) return;

    const allowedExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = file.name
      .slice(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(fileExtension)) {
      setError("Please select a CSV or Excel file.");
      event.target.value = "";
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      setError("Please select a file before uploading.");
      return;
    }

    // Frontend demo only. Backend upload API will be connected later.
    setMessage(
      `${selectedFile.name} is selected and ready for upload. Backend integration is pending.`
    );
    setError("");
  };

  const removeFile = () => {
    setSelectedFile(null);
    setMessage("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-800">
          Lead Management
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Import leads and distribute them among your sales team.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Upload Leads */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#203F72]">
              <Upload size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">Upload Leads</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Import your lead list using a CSV or Excel file.
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-5 flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center transition hover:border-[#203F72] hover:bg-blue-50/50"
          >
            <FileSpreadsheet size={30} className="text-[#203F72]" />

            <span className="mt-3 text-sm font-semibold text-slate-700">
              Choose an Excel or CSV file
            </span>

            <span className="mt-1 text-xs text-slate-400">
              .xlsx, .xls or .csv
            </span>
          </button>

          {selectedFile && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-slate-200 p-3">
              <FileSpreadsheet
                size={22}
                className="shrink-0 text-emerald-600"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-700">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <button
                type="button"
                onClick={removeFile}
                aria-label="Remove selected file"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="mt-3 flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              {message}
            </p>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={!selectedFile}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#203F72] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#18315B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Upload size={17} />
            Upload Leads
          </button>
        </div>

        {/* Assign Leads */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F7941D]">
              <UserRoundPlus size={23} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">Assign Leads</h3>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Distribute uploaded leads to individual sales members.
              </p>
            </div>
          </div>

          <div className="mt-5 flex-1 rounded-xl bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500">
                Unassigned leads
              </span>
              <span className="rounded-lg bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700">
                Demo
              </span>
            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Open the assignment workflow to select leads and choose which
              sales member should receive them.
            </p>
          </div>

          <button
            type="button"
            onClick={onAssignLeads}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#203F72] px-4 py-3 text-sm font-semibold text-[#203F72] transition hover:bg-blue-50"
          >
            Assign Leads
            <ArrowRight size={17} />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Frontend demo: file selection and validation work locally. Actual file
        upload and lead assignment will work after backend integration.
      </p>
    </section>
  );
}

export default LeadManagement;