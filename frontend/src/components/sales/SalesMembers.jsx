
import { useEffect, useState } from "react";
import {
  Search,
  Users,
  UserCheck,
  ClipboardList,
  Eye,
  Power,
  UserPlus,
  Pencil,
  X,
} from "lucide-react";
import api from "../../services/api";

function SalesMembers({ role = "SALES" }) {
  const departmentName = role === "TECH" ? "Tech" : "Sales";
  const departmentLower = departmentName.toLowerCase();

  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Fetch Sales members from backend
  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("token");

      const response = await api.get("/users", {
        params: { role },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMembers(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        `Unable to load ${departmentLower} members. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Search members by name or email
  const filteredMembers = members.filter((member) =>
    `${member.name || ""} ${member.email || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Summary cards
  const stats = [
    {
      title: "Total Members",
      value: members.length,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Active Members",
      value: members.filter((member) => member.isActive).length,
      icon: UserCheck,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Assigned Leads",
      value: "—",
      icon: ClipboardList,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  // Open Add Member form
  const openCreateForm = () => {
    setEditingMember(null);
    setFormData({
      name: "",
      email: "",
      password: "",
    });
    setFormError("");
    setActionMessage("");
    setActionError("");
    setSelectedMember(null);
    setFormOpen(true);
  };

  // Open Edit Member form
  const openEditForm = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || "",
      email: member.email || "",
      password: "",
    });
    setFormError("");
    setActionMessage("");
    setActionError("");
    setSelectedMember(null);
    setFormOpen(true);
  };

  // Close Add/Edit form
  const closeForm = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingMember(null);
    setFormError("");
  };

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Create or update a Sales member
  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name || !email) {
      setFormError("Please enter the member's name and email.");
      return;
    }

    if (!editingMember && formData.password.length < 8) {
      setFormError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setActionMessage("");
      setActionError("");

      const token = sessionStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;

      if (editingMember) {
        response = await api.patch(
          `/users/${editingMember._id}`,
          { name, email },
          config
        );
      } else {
        response = await api.post(
          "/users",
          {
            name,
            email,
            password: formData.password,
            role,
          },
          config
        );
      }

      const message =
        response.data.message ||
        (editingMember
          ? `${departmentName} member updated successfully.`
          : `${departmentName} member created successfully.`);

      setFormOpen(false);
      setEditingMember(null);
      setFormData({ name: "", email: "", password: "" });
      setActionMessage(message);

      // Refresh the latest member list
      await fetchMembers();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        `Unable to save ${departmentLower} member. Please try again.`
      );
    } finally {
      setSaving(false);
    }
  };

  // Activate or deactivate a member
  const handleToggleStatus = async (member) => {
    try {
      setUpdatingId(member._id);
      setActionMessage("");
      setActionError("");

      const token = sessionStorage.getItem("token");

      const response = await api.patch(
        `/users/${member._id}/status`,
        { isActive: !member.isActive },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedMember = response.data.data;
      console.log("Status API response:", response.data);
      console.log("Updated member isActive:", response.data.data.isActive);


      setMembers((previousMembers) =>
        previousMembers.map((item) =>
          item._id === member._id
            ? { ...item, isActive: updatedMember.isActive }
            : item
        )
      );

      setSelectedMember((previousMember) =>
        previousMember?._id === member._id
          ? { ...previousMember, isActive: updatedMember.isActive }
          : previousMember
      );

      setActionMessage(response.data.message);


    } catch (err) {
      setActionError(
        err.response?.data?.message ||
        "Unable to update member status. Please try again."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Generate member initials safely
  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-800">
                    {stat.value}
                  </h3>
                </div>

                <div className={`rounded-xl p-3 ${stat.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Success and Error Messages */}
      {actionMessage && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          <span>{actionMessage}</span>
          <button
            type="button"
            onClick={() => setActionMessage("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={() => setActionError("")}
            aria-label="Dismiss error message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* Members Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {departmentName} Team Members
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage your {departmentName} team members.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search members..."
                aria-label={`Search ${departmentLower} members`}
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Add Member */}
            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203F72] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#19335e]"
            >
              <UserPlus size={17} />
              Add Member
            </button>
          </div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            Loading {departmentLower} members...
          </div>
        ) : error ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              type="button"
              onClick={fetchMembers}
              className="mt-4 rounded-lg bg-[#203F72] px-4 py-2 text-sm font-medium text-white hover:bg-[#19335e]"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Member</th>
                  <th className="px-5 py-4">Assigned Leads</th>
                  <th className="px-5 py-4">Converted</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                          {getInitials(member.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800">
                            {member.name}
                          </p>
                          <p className="break-all text-sm text-slate-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      —
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      —
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${member.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                          }`}
                      >
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <Eye size={16} />
                          View
                        </button>

                        <button
                          type="button"
                          disabled={updatingId === member._id}
                          onClick={() => handleToggleStatus(member)}
                          className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 ${member.isActive
                            ? "bg-red-50 text-red-700 hover:bg-red-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                        >
                          <Power size={15} />
                          {updatingId === member._id
                            ? "Updating..."
                            : member.isActive
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      {search
                        ? "No members match your search."
                        : `No ${departmentLower} members found. Click Add Member to create one.`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Member Details Popup */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMember(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-details-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700">
                  {getInitials(selectedMember.name)}
                </div>

                <div className="min-w-0">
                  <h3
                    id="member-details-title"
                    className="break-words text-xl font-bold text-slate-800"
                  >
                    {selectedMember.name}
                  </h3>
                  <p className="break-all text-sm text-slate-500">
                    {selectedMember.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                aria-label="Close member details"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>
                Role: <strong>{selectedMember.role || "SALES"}</strong>
              </p>
              <p>
                Status:{" "}
                <strong
                  className={
                    selectedMember.isActive
                      ? "text-green-700"
                      : "text-red-700"
                  }
                >
                  {selectedMember.isActive ? "Active" : "Inactive"}
                </strong>
              </p>
              <p>
                Assigned Leads: <strong>Not connected yet</strong>
              </p>
              <p>
                Converted Clients: <strong>Not connected yet</strong>
              </p>
            </div>

            <button
              type="button"
              onClick={() => openEditForm(selectedMember)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={16} />
              Edit Member
            </button>

            <button
              type="button"
              disabled={updatingId === selectedMember._id}
              onClick={() => handleToggleStatus(selectedMember)}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-medium disabled:opacity-50 ${selectedMember.isActive
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
                }`}
            >
              <Power size={16} />
              {updatingId === selectedMember._id
                ? "Updating..."
                : selectedMember.isActive
                  ? "Deactivate Member"
                  : "Activate Member"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              className="mt-3 w-full rounded-xl bg-[#203F72] px-4 py-3 font-medium text-white hover:bg-[#19335e]"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Member Form Popup */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              closeForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-form-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3
                  id="member-form-title"
                  className="text-xl font-bold text-slate-800"
                >
                  {editingMember
                    ? `Edit ${departmentName} Member`
                    : `Add ${departmentName} Member`}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingMember
                    ? "Update this member's account details."
                    : `Create a new account for your ${departmentName} team.`}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                aria-label="Close form"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-5">
              {/* Name */}
              <div>
                <label
                  htmlFor="member-name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="member-name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="member-email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  id="member-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="member@example.com"
                  autoComplete="email"
                  required
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                />
              </div>

              {/* Password: only required when creating */}
              {!editingMember && (
                <div>
                  <label
                    htmlFor="member-password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="member-password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
                    minLength={8}
                    autoComplete="new-password"
                    required
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Share the login credentials with the member securely.
                  </p>
                </div>
              )}

              {/* Form Error */}
              {formError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {formError}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203F72] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#19335e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingMember
                      ? "Save Changes"
                      : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalesMembers;
