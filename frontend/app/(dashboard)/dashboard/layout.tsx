// app/(dashboard)/layout.tsx
import React from 'react'
import '../globals.css'

export const metadata = {
  title: 'Study AI - Dashboard',
  description: 'Dashboard Layout for Study AI'
}

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  // TODO: Add auth check (e.g., if not logged in, redirect to login)
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 p-4">
            <h2 className="text-xl font-bold mb-4">StudyAI Dashboard</h2>
            <nav className="space-y-2">
              <a href="/(dashboard)" className="block hover:text-blue-600">Home</a>
              <a href="/(dashboard)/chat" className="block hover:text-blue-600">Chat</a>
              <a href="/(dashboard)/flashcards" className="block hover:text-blue-600">Flashcards</a>
              <a href="/(dashboard)/documents" className="block hover:text-blue-600">Documents</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  )
}
