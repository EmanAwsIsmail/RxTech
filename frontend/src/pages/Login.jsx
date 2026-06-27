// Login.jsx
// Handles Sign In and Sign Up using Supabase email/password auth
// On success: redirects to /dashboard
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/shared.css'
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
    <div className="page-centered">
  <div className="auth-card">
    <h1 className="auth-title">DemandQ</h1>
    <p className="auth-subtitle">Sign in to manage your surveys</p>

        {error && (
          <p className="error-banner">
            {error}
          </p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-field-spaced"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="input-field-spaced-lg"
        />

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="btn-secondary"
        >
          {loading ? 'Please wait...' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}
// On success: redirects to /dashboard
// Ask Claude: "Write me the Login page in React using Supabase email and password authentication"