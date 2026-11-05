
import {
  Users,
  UserRound,
  BriefcaseBusiness,
  Code2,
  ArrowUpRight,
  Building2,
} from "lucide-react";

const departments = [
  {
    name: "Sales Department",
    description: "Lead assignment & client follow-ups",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-[#203F72]",
    status: "Active",
    statusColor: "bg-green-50 text-green-700",
  },
  {
    name: "HR Department",
    description: "Employees & HR activities",
    icon: UserRound,
    iconBg: "bg-orange-50",
    iconColor: "text-[#F04424]",
    status: "Coming Soon",
    statusColor: "bg-orange-50 text-orange-700",
  },
  {
    name: "Manager Department",
    description: "Team progress & work monitoring",
    icon: BriefcaseBusiness,
    iconBg: "bg-amber-50",
    iconColor: "text-[#F7941D]",
    status: "Coming Soon",
    statusColor: "bg-orange-50 text-orange-700",
  },
  {
    name: "Tech Department",
    description: "Client projects & development",
    icon: Code2,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    status: "Active",
    statusColor: "bg-green-50 text-green-700",
  },
];

function DepartmentOverview() {
  return (
    <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-[#203F72]" />
            <h2 className="text-lg font-bold text-[#203F72]">
              Departments Overview
            </h2>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor your company departments.
          </p>
        </div>

        <span className="hidden rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#203F72] sm:inline-flex">
          {departments.length} Departments
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {departments.map((department) => {
          const Icon = department.icon;

          return (
            <div
              key={department.name}
              className="rounded-xl border border-slate-100 p-4 transition duration-200 hover:border-blue-100 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${department.iconBg}`}
                >
                  <Icon size={21} className={department.iconColor} />
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${department.statusColor}`}
                >
                  {department.status}
                </span>
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {department.name}
              </h3>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {department.description}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-xs font-medium text-slate-400">
                  Department overview
                </span>

                <ArrowUpRight
                  size={16}
                  className="text-slate-400"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default DepartmentOverview;
