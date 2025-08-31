"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Image from "next/image";

export function AddStudyMaterialCard() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden relative h-[150px] group">
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/images/beach-add-material.jpg"
          alt="Beautiful beach cove with turquoise water"
          fill
          priority
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <CardContent className="p-6 relative z-10 h-full">
        <div className="flex justify-between items-center h-full">
          <h3 className="text-lg font-medium text-white drop-shadow-md">
            Add new study material
          </h3>
          <button className="flex-shrink-0 rounded-full p-2 bg-white/70 hover:bg-white">
            <Plus className="h-5 w-5 text-slate-500" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
