
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { TrendingUp } from "lucide-react";

const leadsData = [
  { month: "Jan", leads: 180 },
  { month: "Feb", leads: 240 },
  { month: "Mar", leads: 200 },
  { month: "Apr", leads: 310 },
  { month: "May", leads: 270 },
  { month: "Jun", leads: 380 },
  { month: "Jul", leads: 320 },
  { month: "Aug", leads: 420 },
  { month: "Sep", leads: 350 },
  { month: "Oct", leads: 460 },
  { month: "Nov", leads: 390 },
  { month: "Dec", leads: 500 },
];

function LeadsOverview() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#203F72]">
            Leads Overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Monthly lead generation performance
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
          <TrendingUp size={16} className="text-green-600" />

          <span className="text-xs font-semibold text-green-700">
            Monthly Overview
          </span>
        </div>
      </div>

      <div className="h-[280px] w-full sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={leadsData}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E9EEF5"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />

            <Tooltip
              cursor={{ fill: "#F1F5F9" }}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              }}
              formatter={(value) => [value, "Leads"]}
            />

            <Bar
              dataKey="leads"
              name="Leads"
              fill="#203F72"
              radius={[5, 5, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default LeadsOverview;
