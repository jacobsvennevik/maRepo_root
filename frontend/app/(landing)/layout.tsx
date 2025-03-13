// app/(landing/layout.tsx
import React from 'react'
import '../globals.css'

export const metadata = {
  title: 'Study AI - Public',
  description: 'Public Layout for Study AI'
}

export default function PublicLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <header className="w-full py-4 px-6 bg-gray-100 shadow">
          <nav className="max-w-7xl mx-auto flex justify-between">
            <div className="font-bold text-xl">StudyAI</div>
            <div>
              <a href="/(auth)/login" className="mr-4">Login</a>
              <a href="/(auth)/register" className="mr-4">Register</a>
            </div>
          </nav>
        </header>
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}
