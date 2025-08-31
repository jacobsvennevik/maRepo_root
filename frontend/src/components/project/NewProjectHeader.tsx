import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export function NewProjectHeader() {
  return (
    <Card className="border-0 shadow-xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-gradient-to-br from-emerald-600 to-blue-600 p-6 md:p-8">
          <div className="flex flex-col justify-center">
            <CardTitle className="text-2xl font-bold text-white mb-2">
              Create New Project
            </CardTitle>
            <CardDescription className="text-base text-emerald-50">
              Let's set up your project for success. We'll guide you through the
              process step by step.
            </CardDescription>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 flex items-center justify-center">
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute -inset-3 bg-emerald-100 rounded-full opacity-50 animate-pulse"></div>
            <div className="absolute -inset-6 bg-blue-100 rounded-full opacity-30 animate-pulse delay-300"></div>

            {/* Icon container */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
              <BookOpen className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
