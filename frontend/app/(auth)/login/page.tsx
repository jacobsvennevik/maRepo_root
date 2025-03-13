// app/(auth)/login/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/services/authService'

/**
 * Renders a login page for the application with form fields for username/email and password.
 * Handles user login by calling the loginUser service and redirects to the dashboard upon success.
 * Displays an error message if login fails.
 */

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')


/**
 * Handles the form submission for user login.
 * Prevents the default form submission behavior, attempts to authenticate 
 * the user using the loginUser service with the provided username and password.
 * On successful login, redirects the user to the dashboard.
 * Sets an error message if the login attempt fails.
 *
 * @param e - The form submission event.
 */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await loginUser(username, password)
      router.push('/(dashboard)')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username or Email"
          className="border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  )
}
