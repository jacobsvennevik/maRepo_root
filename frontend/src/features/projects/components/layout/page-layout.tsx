"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  className?: string;
}

export function PageLayout({
  children,
  title,
  subtitle,
  backHref = "/projects",
  backLabel = "Back to Projects",
  className = "",
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-200/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200/20 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <div
        className={`relative max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 ${className}`}
      >
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-600 mb-4 sm:mb-6 lg:mb-8">
          <Link
            href={backHref as any}
            className="hover:text-blue-600 flex items-center"
          >
            <ChevronLeft size={16} className="mr-1" />
            {backLabel}
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-10 lg:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content */}
        {children}

        {/* Additional Info */}
        <div className="mt-8 sm:mt-10 lg:mt-12 text-center">
          <p className="text-xs sm:text-sm text-slate-500">
            You can always modify your project settings later in the project
            dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
