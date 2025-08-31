import { Card, CardContent } from "@/components/ui/card";

const testTypes = [
  {
    name: "Multiple Choice",
    icon: "✅",
    description: "Single or multi-select questions",
  },
  {
    name: "Matching Pairs",
    icon: "🧩",
    description: "Match terms with definitions",
  },
  {
    name: "Short Answer",
    icon: "✏️",
    description: "Fill in the blank questions",
  },
  {
    name: "Interactive Diagram",
    icon: "🕹️",
    description: "Drag labels onto images",
  },
  { name: "Ranking", icon: "🔢", description: "Order steps in a process" },
];

export function TestTypesSection() {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-pink-50/80 backdrop-blur-sm border-purple-200/50">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Quiz Types Available
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testTypes.map((type, index) => (
            <div
              key={index}
              className="p-4 bg-white/60 rounded-lg border border-purple-200/50 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{type.icon}</span>
                <div>
                  <h4 className="font-medium text-slate-900">{type.name}</h4>
                  <p className="text-sm text-slate-600">{type.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
