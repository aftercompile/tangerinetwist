"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatINRCompact } from "@/lib/utils";
import type { CategoryRevenue } from "@/lib/db/metrics-queries";

export function CategoryRevenueChart({ data }: { data: CategoryRevenue[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD1" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={(v) => formatINRCompact(v)}
          tick={{ fontSize: 11, fill: "#8A6177" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="categoryName"
          tick={{ fontSize: 12, fill: "#1B1815" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip
          formatter={(value) => formatINRCompact(Number(value))}
          contentStyle={{ borderRadius: 12, border: "1px solid #E7DFD1", fontSize: 13 }}
        />
        <Bar dataKey="revenue" fill="#E86A2C" radius={[0, 6, 6, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
