// app/(auth)/register/page.tsx
'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/services/authService'

/**
 * RegisterPage component renders a user registration form.
 * It includes input fields for username, email, and two password fields.
 * The form validates that the passwords match before submitting.
 * On successful registration, it redirects to the login page.
 * Displays error messages if registration fails or passwords do not match.
 */

export default function RegisterPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password1, setPassword1] = useState('')
  const [password2, setPassword2] = useState('')
  const [error, setError] = useState('')

  /**
   * Handles the form submission for user registration.
   * Prevents the default form submission behavior, checks if the two passwords match,
   * and attempts to register the user using the registerUser service with the provided
   * username, email, and password.
   * On successful registration, redirects the user to the login page.
   * Sets an error message if the passwords do not match or if registration fails.
   *
   * @param e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password1 !== password2) {
      setError('Passwords do not match')
      return
    }
    try {
      await registerUser({ username, email, password1, password2 })
      router.push('/(auth)/login')
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          className="border p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="border p-2"
          value={password1}
          onChange={(e) => setPassword1(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  )
}
