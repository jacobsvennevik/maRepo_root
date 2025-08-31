"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MainNav() {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard",
      label: "Overview",
      active: pathname === "/dashboard",
    },
    {
      href: "/dashboard/materials",
      label: "Study Materials",
      active: pathname === "/dashboard/materials",
    },
    {
      href: "/dashboard/ai-tools",
      label: "AI Tools",
      active: pathname === "/dashboard/ai-tools",
    },
    {
      href: "/dashboard/settings",
      label: "Settings",
      active: pathname === "/dashboard/settings",
    },
  ];

  return (
    <nav className="flex items-center space-x-6 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            route.active
              ? "text-black dark:text-white"
              : "text-muted-foreground",
          )}
        >
          {route.label}
        </Link>
      ))}
    </nav>
  );
}
