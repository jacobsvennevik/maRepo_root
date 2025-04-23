"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

const data = [
  { day: "S", minutes: 45, retention: 65 },
  { day: "M", minutes: 90, retention: 72 },
  { day: "T", minutes: 120, retention: 85 },
  { day: "W", minutes: 75, retention: 78 },
  { day: "T", minutes: 105, retention: 82 },
  { day: "F", minutes: 60, retention: 75 },
  { day: "S", minutes: 30, retention: 68 },
]

export function StudyPerformanceChart() {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 9 }} />
          <YAxis hide={true} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              borderRadius: "6px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              border: "none",
              fontSize: "10px",
              padding: "4px 8px",
            }}
            formatter={(value, name) => {
              return [`${value} ${name === "minutes" ? "min" : "%"}`, name === "minutes" ? "Study Time" : "Retention"]
            }}
          />
          <Bar dataKey="minutes" fill="rgba(14, 165, 233, 0.8)" radius={[2, 2, 0, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
