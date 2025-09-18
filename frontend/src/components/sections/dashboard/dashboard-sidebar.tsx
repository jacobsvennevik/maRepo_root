"use client";

import Link from "next/link";
import {
  Home,
  Book,
  Activity,
  Users,
  Settings,
  LayoutDashboard,
  FileText,
  Bookmark,
} from "lucide-react";

export function DashboardSidebar() {
  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: true,
    },
    {
      name: "Projects",
      href: "/projects",
      icon: Book,
      current: false,
    },
  ];

  return (
    <nav className="flex flex-col">
      <div className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href as any}
            className={`
              flex items-center px-2 py-2 text-sm font-medium rounded-md
              ${
                item.current
                  ? "bg-[#1a2d4d] text-white"
                  : "text-slate-300 hover:bg-[#1a2d4d] hover:text-white"
              }
            `}
          >
            <item.icon
              className="mr-3 h-5 w-5 flex-shrink-0"
              aria-hidden="true"
            />
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}
