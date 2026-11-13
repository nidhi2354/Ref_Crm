import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";

import api from "../../services/api";
import SalesUserDashboard from "../sales/SalesUserDashboard";

// Admin route: /admin/sales-department/users/:userId
function SalesUserView() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backToDepartment = () => navigate("/admin/sales-department");

  useEffect(() => {
    const loadMember = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/users/${userId}`);
        setMember(response.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Sales user ka dashboard load nahi ho paaya."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMember();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Loading Sales user dashboard...
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
          <AlertCircle size={36} className="mx-auto text-red-500" />

          <h2 className="mt-3 text-lg font-bold text-slate-800">
            Dashboard nahi khul paaya
          </h2>

          <p className="mt-2 text-sm text-red-600">{error || "Sales user not found"}</p>

          <button
            type="button"
            onClick={backToDepartment}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#203F72] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#19335e]"
          >
            <ArrowLeft size={16} />
            Back to Sales Department
          </button>
        </div>
      </div>
    );
  }

  return (
    <SalesUserDashboard
      viewUserId={member._id}
      viewUserName={member.name}
      onBack={backToDepartment}
    />
  );
}

export default SalesUserView;
