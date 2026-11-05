import { useRef, useState } from "react";
import { X, Share2, Paperclip, CheckCircle2, Info } from "lucide-react";

const WORK_TYPES = [
  { value: "SEO", label: "SEO" },
  { value: "SMO", label: "SMO" },
  { value: "GMB", label: "GMB" },
  { value: "WEBSITE", label: "Website" },
  { value: "OTHER", label: "Other" },
];

const emptyWorkDetails = (lead = {}) => ({
  clientName: lead.Name || "",
  companyName: lead.Company || "",
  phoneNo: lead.Phone || "",
  email: lead.Email || "",
  workType: "",
  projectTitle: "",
  projectDescription: "",
  budget: "",
  paymentDetails: "",
  deadline: "",
  additionalNotes: "",
  referenceFiles: [],
});

const inputClass =
  "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function Field({ label, required, className = "", children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function ClientWorkDetailsModal({ lead, initialValues, onClose, onSave }) {
  const [form, setForm] = useState(initialValues || emptyWorkDetails(lead));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const update = (field) => (e) => {
    setForm((current) => ({ ...current, [field]: e.target.value }));
    setError("");
    setNotice("");
  };

  const handleFiles = (e) => {
    const picked = Array.from(e.target.files || []);

    setForm((current) => ({
      ...current,
      referenceFiles: [...current.referenceFiles, ...picked],
    }));

    e.target.value = "";
  };

  const removeFile = (index) => {
    setForm((current) => ({
      ...current,
      referenceFiles: current.referenceFiles.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    if (!form.clientName.trim()) return "Client Name required hai.";
    if (!form.workType) return "Please Work Type select karo.";
    if (!form.projectTitle.trim()) return "Project Title required hai.";
    return "";
  };

  const handleShare = async () => {
    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    try {
      setSaving(true);
      setError("");
      setNotice("");

      await onSave(form);

      setForm((current) => ({ ...current, sharedToTech: true }));
      setNotice("Details Tech Department ke saath share ho gayi.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Details save nahi hui. Please dobara try karo."
      );
    } finally {
      setSaving(false);
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
        aria-labelledby="client-work-details-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
          <div>
            <h3
              id="client-work-details-title"
              className="text-lg font-bold text-slate-800"
            >
              Client Work Details
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Client ka kaam aur project ki details yahan fill karo.
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

        {/* Form */}
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex-1 space-y-4 overflow-y-auto px-6 py-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Client Name" required>
              <input
                type="text"
                value={form.clientName}
                onChange={update("clientName")}
                className={inputClass}
              />
            </Field>

            <Field label="Company Name">
              <input
                type="text"
                value={form.companyName}
                onChange={update("companyName")}
                className={inputClass}
              />
            </Field>

            <Field label="Phone No">
              <input
                type="tel"
                value={form.phoneNo}
                onChange={update("phoneNo")}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={update("email")}
                className={inputClass}
              />
            </Field>

            <Field label="Work Type" required>
              <select
                value={form.workType}
                onChange={update("workType")}
                className={inputClass}
              >
                <option value="">Select category</option>
                {WORK_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Project Title" required>
              <input
                type="text"
                value={form.projectTitle}
                onChange={update("projectTitle")}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Project Description">
            <textarea
              rows={3}
              value={form.projectDescription}
              onChange={update("projectDescription")}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Budget">
              <input
                type="number"
                min="0"
                value={form.budget}
                onChange={update("budget")}
                placeholder="₹"
                className={inputClass}
              />
            </Field>

            <Field label="Deadline">
              <input
                type="date"
                value={form.deadline}
                onChange={update("deadline")}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Payment Details">
            <textarea
              rows={2}
              value={form.paymentDetails}
              onChange={update("paymentDetails")}
              placeholder="Advance, milestones, payment mode..."
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field label="Additional Notes">
            <textarea
              rows={2}
              value={form.additionalNotes}
              onChange={update("additionalNotes")}
              className={`${inputClass} resize-y`}
            />
          </Field>

          {/* Reference files */}
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">
              Reference Files
            </span>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFiles}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[#203F72] hover:text-[#203F72]"
            >
              <Paperclip size={16} />
              Attach files
            </button>

            {form.referenceFiles.length > 0 && (
              <ul className="mt-3 space-y-2">
                {form.referenceFiles.map((file, index) => (
                  <li
                    key={`${file.name || file.originalName}-${index}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                  >
                    <Paperclip size={15} className="shrink-0 text-slate-400" />

                    <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                      {file.name || file.originalName}
                    </span>

                    <span className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Remove ${file.name || file.originalName}`}
                      className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500"
                    >
                      <X size={15} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="space-y-3 border-t border-slate-100 px-6 py-4">
          {error && (
            <p role="alert" className="flex items-center gap-2 text-sm text-red-600">
              <Info size={16} />
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
              {notice}
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
              onClick={handleShare}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203F72] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#17325d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Share2 size={16} />
              {saving
                ? "Sharing..."
                : form.sharedToTech
                  ? "Update & Share"
                  : "Share"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientWorkDetailsModal;
