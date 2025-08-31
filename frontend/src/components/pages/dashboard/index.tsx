"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { DashboardOverview } from "@/components/sections/dashboard/dashboard-overview";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-[#f8fafc]">
        {/* Main content area */}
        <DashboardHeader />
        <main className="flex-1">
          <DashboardOverview />
        </main>
      </div>
    </DashboardLayout>
  );
}
