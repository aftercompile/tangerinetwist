"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusBreakdown } from "@/lib/db/metrics-queries";

const STATUS_COLORS: Record<string, string> = {
  pending: "#8A6177",
  confirmed: "#F0A164",
  in_production: "#EC833F",
  shipped: "#E86A2C",
  delivered: "#1B1815",
  cancelled: "#E4D8C3",
};

export function StatusBreakdownChart({ data }: { data: StatusBreakdown[] }) {
  const chartData = data.map((d) => ({ name: d.status.replace("_", " "), value: d.count, key: d.status }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={STATUS_COLORS[entry.key] ?? "#8A6177"} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7DFD1", fontSize: 13 }} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => <span className="text-xs capitalize text-charcoal">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
