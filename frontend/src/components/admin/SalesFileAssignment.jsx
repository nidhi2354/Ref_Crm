import { useEffect, useState } from "react";
import axios from "axios";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  Image as ImageIcon,
  File as FileIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  UserRound,
  CalendarDays,
  HardDrive,
} from "lucide-react";

import { API_URL } from "../../config";

function SalesFileAssignment() {
  const [salesUsers, setSalesUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [salesUserId, setSalesUserId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = sessionStorage.getItem("token");

  const getHeaders = () => ({
    Authorization: `Bearer ${token}`,
  });

  // Fetch Sales Members
  const fetchSalesUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await axios.get(`${API_URL}/users`, {
        headers: getHeaders(),
      });

      const result = response.data;

      const users =
        result.members ||
        result.users ||
        result.data?.members ||
        result.data?.users ||
        (Array.isArray(result.data) ? result.data : []);

      setSalesUsers(
        users.filter((user) => user.role === "SALES" && user.isActive !== false)
      );
    } catch (error) {
      console.error("Sales users error:", error);
      setMessage(
        error.response?.data?.message ||
        "Unable to load Sales Members. Please check your login."
      );
      setMessageType("error");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch files already assigned
  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);

      const response = await axios.get(`${API_URL}/files`, {
        headers: getHeaders(),
      });

      const result = response.data;

      const assignedFiles =
        result.files ||
        result.data?.files ||
        (Array.isArray(result.data) ? result.data : []);

      setFiles(assignedFiles);
    } catch (error) {
      console.error("Assigned files error:", error);
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchSalesUsers();
    fetchFiles();
  }, []);

  // Upload and assign file
  const handleUpload = async (event) => {
    event.preventDefault();

    setMessage("");
    setMessageType("");

    if (!salesUserId) {
      setMessage("Please select a Sales Member.");
      setMessageType("error");
      return;
    }

    if (!selectedFile) {
      setMessage("Please choose a file to upload.");
      setMessageType("error");
      return;
    }

    const formData = new FormData();

    formData.append("salesUserId", salesUserId);
    formData.append("file", selectedFile);

    try {
      setUploading(true);

      const response = await axios.post(
        `${API_URL}/files/upload`,
        formData,
        {
          headers: getHeaders(),
        }
      );

      const result = response.data;
      const importedCount = result.data?.leadsImported || 0;

      setMessage(
        importedCount > 0
          ? `${result.message}. ${importedCount} leads imported successfully.`
          : result.message || "File uploaded and assigned successfully."
      );

      setMessageType("success");
      setSelectedFile(null);

      // Reset the file input
      event.target.reset();

      await fetchFiles();
    } catch (error) {
      console.error("File upload error:", error);

      setMessage(
        error.response?.data?.message ||
        "File upload failed. Please try again."
      );

      setMessageType("error");
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 KB";

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getFileIcon = (filename = "") => {
    const extension = filename.split(".").pop()?.toLowerCase();

    if (["xlsx", "xls", "csv"].includes(extension)) {
      return <FileSpreadsheet size={22} className="text-green-600" />;
    }

    if (["jpg", "jpeg", "png", "webp", "gif"].includes(extension)) {
      return <ImageIcon size={22} className="text-purple-600" />;
    }

    if (["pdf", "doc", "docx", "txt"].includes(extension)) {
      return <FileText size={22} className="text-blue-600" />;
    }

    return <FileIcon size={22} className="text-slate-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h1 className="text-2xl font-bold text-[#203F72]">
          File Assignment
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Upload files and assign them to Sales Department members.
        </p>
      </div>

      {/* Success / Error Message */}
      {message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${messageType === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : "border-red-200 bg-red-50 text-red-800"
            }`}
        >
          {messageType === "success" ? (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
          ) : (
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
          )}

          <p className="text-sm">{message}</p>
        </div>
      )}

      {/* Upload Form */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-[#203F72]">
            Upload & Assign File
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select a Sales Member and choose the file you want to assign.
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Sales Member Dropdown */}
          <div>
            <label
              htmlFor="salesUserId"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Select Sales Member <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                id="salesUserId"
                value={salesUserId}
                onChange={(event) => setSalesUserId(event.target.value)}
                disabled={loadingUsers || uploading}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#203F72] focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="">
                  {loadingUsers
                    ? "Loading Sales Members..."
                    : "Choose a Sales Member"}
                </option>

                {salesUsers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {!loadingUsers && salesUsers.length === 0 && (
              <p className="mt-2 text-sm text-amber-600">
                No active Sales Members found. Create a Sales Member first.
              </p>
            )}
          </div>

          {/* File Input */}
          <div>
            <label
              htmlFor="assignmentFile"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Choose File <span className="text-red-500">*</span>
            </label>

            <label
              htmlFor="assignmentFile"
              className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-9 text-center transition hover:border-[#203F72] hover:bg-blue-50/50"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Upload size={23} className="text-[#203F72]" />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Click to select a file
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Excel, CSV, PDF, Word documents, images and other file types
              </p>

              <input
                id="assignmentFile"
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
            </label>

            {selectedFile && (
              <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
                {getFileIcon(selectedFile.name)}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatSize(selectedFile.size)}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setSelectedFile(null);

                    const input = document.getElementById("assignmentFile");
                    if (input) input.value = "";
                  }}
                  className="text-sm font-medium text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Spreadsheet Information */}
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex gap-3">
              <FileSpreadsheet
                size={20}
                className="mt-0.5 shrink-0 text-[#203F72]"
              />

              <div>
                <p className="text-sm font-semibold text-[#203F72]">
                  Excel / CSV files
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Spreadsheet rows will automatically be imported as leads
                  for the selected Sales Member. Other supported file types
                  will be assigned as files without automatically importing
                  leads.
                </p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={uploading || loadingUsers || salesUsers.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#203F72] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#18325c] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {uploading ? (
              <>
                <RefreshCw size={18} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Upload & Assign
              </>
            )}
          </button>
        </form>
      </section>

      {/* Assigned Files */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#203F72]">
              Assigned Files
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Files uploaded for Sales Department members.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchFiles}
            disabled={loadingFiles}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loadingFiles ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loadingFiles ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading assigned files...
          </div>
        ) : files.length === 0 ? (
          <div className="p-10 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
              <HardDrive size={24} className="text-slate-400" />
            </div>

            <p className="font-semibold text-slate-700">
              No assigned files found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Upload a file to see it listed here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">File</th>
                  <th className="px-5 py-4 font-semibold">Sales Member</th>
                  <th className="px-5 py-4 font-semibold">Size</th>
                  <th className="px-5 py-4 font-semibold">Assigned Date</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {files.map((file) => {
                  const assignedUser =
                    typeof file.salesUser === "object"
                      ? file.salesUser?.name
                      : salesUsers.find(
                        (user) => user._id === file.salesUser
                      )?.name;

                  return (
                    <tr
                      key={file._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                            {getFileIcon(file.originalName)}
                          </div>

                          <div className="max-w-[260px]">
                            <p className="truncate font-semibold text-slate-700">
                              {file.originalName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {file.mimeType || "File"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-slate-600">
                          <UserRound size={15} />
                          {assignedUser || "Sales Member"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {formatSize(file.size)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-2 text-slate-500">
                          <CalendarDays size={15} />
                          {file.createdAt
                            ? new Date(file.createdAt).toLocaleDateString()
                            : "—"}
                        </span>
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

export default SalesFileAssignment;