import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export function Breadcrumbs() {
  return (
    <div className="flex items-center text-sm text-gray-600">
      <Link href="/projects" className="hover:text-blue-600">Projects</Link>
      <ChevronRight size={16} className="mx-2" />
      <span className="font-medium text-gray-900">Quiz Center</span>
    </div>
  );
} 