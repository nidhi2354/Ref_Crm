
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { readAuthMessage, clearAuthMessage } from "../services/session";

import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Users,
  FolderLock,
  TrendingUp,
  LoaderCircle,
} from "lucide-react";

const BRAND = {
  navy: "#203F72",
  orange: "#F04424",
  gold: "#F7941D",
};

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(readAuthMessage);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    clearAuthMessage();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        email: email.trim(),
        password,
      });

      const { token, data } = result;

      if (!token || !data?.role) {
        throw new Error("Invalid login response from server.");
      }

      if (!["ADMIN", "SALES", "TECH"].includes(data.role)) {
        throw new Error("Your account role is not authorized.");
      }

      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(data));

      if (data.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
      } else if (data.role === "TECH") {
        navigate("/tech/dashboard", { replace: true });
      } else {
        navigate("/sales/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* LEFT SECTION */}
      <section className="relative hidden min-h-screen overflow-hidden bg-white p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          className="absolute -right-28 -top-28 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND.gold}18` }}
        />

        <div
          className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl"
          style={{ backgroundColor: `${BRAND.navy}12` }}
        />

        <div className="relative z-10">
          <img
            src="/images/reefLogo.jpg"
            alt="ReefTech Logo"
            className="h-16 w-auto max-w-[240px] object-contain object-left"
          />

          <p
            className="mt-2 text-sm font-medium tracking-wide"
            style={{ color: BRAND.navy }}
          >
            REEFCRM · BUSINESS MANAGEMENT
          </p>
        </div>

        <div className="relative z-10 my-12 max-w-xl">
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold"
            style={{
              color: BRAND.orange,
              borderColor: `${BRAND.orange}35`,
              backgroundColor: `${BRAND.orange}08`,
            }}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: BRAND.orange }}
            />
            YOUR WORKSPACE, SIMPLIFIED
          </div>

          <h1
            className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl"
            style={{ color: BRAND.navy }}
          >
            Manage your team.
            <span
              className="mt-2 block"
              style={{ color: BRAND.orange }}
            >
              Grow your business.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-slate-500 xl:text-lg">
            One secure workspace to manage your sales team, organize client
            information, share important files, and keep your business moving
            forward.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FeatureCard
              icon={<Users size={21} />}
              title="Team Access"
              description="Role-based workspace"
              color={BRAND.navy}
            />

            <FeatureCard
              icon={<FolderLock size={21} />}
              title="Secure Files"
              description="Easy file sharing"
              color={BRAND.orange}
            />

            <FeatureCard
              icon={<TrendingUp size={21} />}
              title="Lead Tracking"
              description="Organized workflow"
              color={BRAND.gold}
            />
          </div>

          <div className="mt-10 flex items-center gap-2">
            <div
              className="h-1.5 w-14 rounded-full"
              style={{ backgroundColor: BRAND.orange }}
            />
            <div
              className="h-1.5 w-7 rounded-full"
              style={{ backgroundColor: BRAND.gold }}
            />
            <div className="h-1.5 w-7 rounded-full bg-slate-200" />
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-400">
          © 2026 ReefCRM. All rights reserved.
        </p>
      </section>

      {/* RIGHT SECTION — LOGIN FORM */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10 sm:px-10 lg:px-12">
        <div
          className="absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl lg:hidden"
          style={{ backgroundColor: `${BRAND.gold}15` }}
        />

        <div
          className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full blur-3xl lg:hidden"
          style={{ backgroundColor: `${BRAND.navy}10` }}
        />

        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <img
              src="/images/reefLogo.jpg"
              alt="ReefTech Logo"
              className="h-14 w-auto max-w-[220px] object-contain object-left"
            />

            <p
              className="mt-2 text-xs font-semibold tracking-widest"
              style={{ color: BRAND.navy }}
            >
              REEFCRM · BUSINESS MANAGEMENT
            </p>
          </div>

          <div className="mb-8">
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: BRAND.navy,
                boxShadow: `0 10px 25px ${BRAND.navy}25`,
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <p
              className="mb-3 text-sm font-bold tracking-[0.18em]"
              style={{ color: BRAND.orange }}
            >
              WELCOME BACK
            </p>

            <h2
              className="text-3xl font-extrabold tracking-tight sm:text-4xl"
              style={{ color: BRAND.navy }}
            >
              Sign in to your account
            </h2>

            <p className="mt-3 leading-7 text-slate-500">
              Enter your work credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#203F72] focus:ring-4 focus:ring-[#203F72]/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-12 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#203F72] focus:ring-4 focus:ring-[#203F72]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  disabled={loading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-[#203F72] disabled:cursor-not-allowed"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 font-bold text-white shadow-lg transition duration-200 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
              style={{
                backgroundColor: BRAND.orange,
                boxShadow: `0 8px 20px ${BRAND.orange}25`,
              }}
            >
              {loading ? (
                <>
                  <LoaderCircle size={19} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    size={19}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <ShieldCheck
              size={22}
              className="mt-0.5 shrink-0"
              color="#16845B"
            />

            <div>
              <p className="text-sm font-bold text-slate-700">
                Secure workspace
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Authorized access for Admin and Sales team members only.
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Protected workspace · ReefCRM
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          color,
          backgroundColor: `${color}12`,
        }}
      >
        {icon}
      </div>

      <h3 className="text-sm font-bold text-slate-800">{title}</h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}
