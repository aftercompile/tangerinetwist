"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

// Generalizes StatusBreakdownChart's exact donut (same radii/tooltip/legend styling) to any
// label/value breakdown, so the Reports page's checkout-source and payment-method charts
// reuse one component instead of two near-duplicates of that status-specific one.
const DEFAULT_COLORS = ["#E86A2C", "#8A6177", "#F0A164", "#1B1815", "#EC833F", "#E4D8C3"];

export function BreakdownDonutChart({
  data,
  colors,
}: {
  data: { label: string; value: number }[];
  colors?: Record<string, string>;
}) {
  const chartData = data.map((d) => ({ name: d.label, value: d.value }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {chartData.map((entry, i) => (
            <Cell key={entry.name} fill={colors?.[entry.name] ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]} />
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
