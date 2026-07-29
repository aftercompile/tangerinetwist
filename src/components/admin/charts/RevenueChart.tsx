"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINRCompact } from "@/lib/utils";
import type { RevenuePoint } from "@/lib/db/metrics-queries";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const showEveryNth = Math.max(1, Math.ceil(data.length / 8));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E86A2C" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#E86A2C" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD1" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d, i) => (i % showEveryNth === 0 ? new Date(d).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "")}
          tick={{ fontSize: 11, fill: "#8A6177" }}
          axisLine={{ stroke: "#E7DFD1" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => formatINRCompact(v)}
          tick={{ fontSize: 11, fill: "#8A6177" }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          formatter={(value, name) => [
            name === "revenue" ? formatINRCompact(Number(value)) : String(value),
            name === "revenue" ? "Revenue" : "Orders",
          ]}
          labelFormatter={(label) => new Date(String(label)).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          contentStyle={{ borderRadius: 12, border: "1px solid #E7DFD1", fontSize: 13 }}
        />
        <Area type="monotone" dataKey="revenue" stroke="#E86A2C" strokeWidth={2} fill="url(#revenueGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
