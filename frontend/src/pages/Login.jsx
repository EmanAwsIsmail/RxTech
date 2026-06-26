// frontend/src/pages/Login.jsx
// Handles Sign In and Sign Up using Supabase email/password auth
// On success: redirects to /dashboard

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../style.css'
import loginBg from '../../src/Images/login_image.png'

// ─── IMPORTANT ───────────────────────────────────────────────────────────────
// OPTION A (recommended): drop your own image into src/assets/login-bg.jpg
//   then replace the IMAGE_URL line below with:
//   import loginBg from '../assets/login-bg.jpg'
//   and set IMAGE_URL = loginBg
//
// OPTION B (used now): a royalty-free landscape photo from Unsplash CDN.
//   Works offline-free, no API key needed. Swap it any time.
// ─────────────────────────────────────────────────────────────────────────────
// Anonymous sign-ins are disabled

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [isSignup, setIsSignup] = useState(false)

  async function handleSignIn() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  async function handleSignUp() {
  setError('')
  setLoading(true)

  const { error } = await supabase.auth.signUp({ email, password })

  setLoading(false)

  if (error) {
    // 👇 custom friendly message override
    if (error.message.includes('Anonymous sign-ins are disabled')) {
      setError('Enter new email and password to sign up')
    } 
  } else {
    navigate('/dashboard')
  }
}
  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSignIn()
  }

  async function handleSubmit() {
  setError('')
  setLoading(true)

  if (isSignup) {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
  } else {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  setLoading(false)
}

return (
  <div className="login-page">
    <div className="login-card">

      {/* LEFT IMAGE */}
      <div className="login-left">
        <img
          src={loginBg}
          alt="Scenic mountain landscape"
          loading="eager"
        />
      </div>

      {/* RIGHT FORM */}
      <div className="login-right">
        <div className="login-form-inner">

        <h1 className="login-title">
          {isSignup ? 'Sign Up' : 'Login'}
        </h1>

          {error && (
            <p className="login-error" role="alert">{error}</p>
          )}

          {/* Email */}
          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="email"
            autoFocus
          />

          {/* Password */}
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="current-password"
          />

          {/* Login */}
          <button
          type="button"
          className="login-btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Please wait…' : isSignup ? 'Sign Up' : 'Login'}
        </button>

          {/* Forgot password */}
          <button
            type="button"
            className="login-btn-primary login-btn-small"
            onClick={() => alert('Password reset coming soon.')}
          >
            Forgot password?
          </button>


          {/* Sign up */}
          <p className="login-signup-row">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          &nbsp;

          <button
            type="button"
            className="login-signup-link"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Login' : 'Sign up'}
          </button>
        </p>

        </div>
      </div>

    </div>
  </div>
)
}