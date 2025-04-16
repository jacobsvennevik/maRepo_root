import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar Placeholder */}
      <header className="bg-white shadow">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              {/* Logo placeholder */}
              <div className="flex flex-shrink-0 items-center">
                <span className="text-xl font-bold">Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar Placeholder */}
        <div className="w-64 bg-white shadow">
          <nav className="flex flex-col p-4">
            <p className="text-sm text-gray-600">Navigation placeholder</p>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 