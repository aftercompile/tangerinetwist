"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function RatingDistributionChart({ data }: { data: { rating: number; count: number }[] }) {
  const chartData = [1, 2, 3, 4, 5].map((rating) => ({
    rating: `${rating} star`,
    count: data.find((d) => d.rating === rating)?.count ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E7DFD1" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: "#8A6177" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="rating"
          tick={{ fontSize: 12, fill: "#1B1815" }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #E7DFD1", fontSize: 13 }} />
        <Bar dataKey="count" fill="#E86A2C" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
