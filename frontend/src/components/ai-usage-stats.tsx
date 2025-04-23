"use client"

const data = [
  { name: "Flashcards", value: 28, color: "#0ea5e9" }, // ocean DEFAULT
  { name: "Tests", value: 6, color: "#38bdf8" }, // ocean-400
  { name: "Summaries", value: 14, color: "#7dd3fc" }, // ocean-300
  { name: "Mind Maps", value: 8, color: "#bae6fd" }, // ocean-200
]

export function AiUsageStats() {
  return (
    <div className="space-y-1.5">
      {data.map((item) => (
        <div key={item.name} className="space-y-0.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-medium">{item.name}</div>
            <div className="text-[10px] font-medium">{item.value}</div>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-ocean-100">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.value / Math.max(...data.map((d) => d.value))) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
