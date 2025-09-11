import Link from "next/link";
import { Plus } from "lucide-react";

export function CreateProjectCard() {
  return (
    <Link href="/projects/create" className="block h-full w-full">
      <button className="h-full w-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-6 transition-all duration-200 hover:border-blue-400 hover:bg-blue-50/50 group hover:scale-[1.02]">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors mb-4">
          <Plus className="h-7 w-7 text-blue-600" />
        </div>
        <p className="text-lg font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
          Create New Project
        </p>
      </button>
    </Link>
  );
}

export function ProjectPlaceholderCard() {
  return (
    <div className="h-full w-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 bg-gray-50/50">
      <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
        <span className="text-gray-300 text-xl">+</span>
      </div>
    </div>
  );
}
