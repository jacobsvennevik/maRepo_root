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
      href: "/projects",
      label: "Projects",
      active: pathname.startsWith("/projects"),
    },
  ];

  return (
    <nav className="flex items-center space-x-6 lg:space-x-6">
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href as any}
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
