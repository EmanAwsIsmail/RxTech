import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Login.jsx
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

// Handles Sign In and Sign Up using Supabase email/password auth
async function handleSignIn() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  async function handleSignUp() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-2">DemandQ</h1>
        <p className="text-center text-gray-500 text-sm mb-6">Sign in to manage your surveys</p>

        {error && (
          <p className="text-red-600 text-sm text-center mb-4 bg-red-50 p-2 rounded">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 mb-2"
        >
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full bg-gray-100 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50"
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}
// On success: redirects to /dashboard
// Ask Claude: "Write me the Login page in React using Supabase email and password authentication"