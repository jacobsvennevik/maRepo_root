"use client"

import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export function AddStudyMaterialCard() {
  return (
    <Card className="bg-[#57c1ff] shadow-sm border-0 hover:bg-[#4db5f5] cursor-pointer transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-slate-800">Add new study material</h3>
          <button className="flex-shrink-0 rounded-full p-2 bg-white/70 hover:bg-white">
            <Plus className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
} 