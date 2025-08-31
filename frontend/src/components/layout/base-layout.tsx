"use client";

import { ReactNode } from "react";

interface BaseLayoutProps {
  children: ReactNode;
}

/**
 * Base layout component that provides the common structure used across
 * dashboard and project layouts. Consolidates the duplicated layout code.
 */
export function BaseLayout({ children }: BaseLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">{children}</div>
  );
}
