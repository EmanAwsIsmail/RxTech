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
  const [mode, setMode] = useState('signin') // 'signin' or 'signup'
  const [name, setName] = useState('')
  const [resetSent, setResetSent] = useState(false)

async function handleForgotPassword() {
  if (!email) return setError('Enter your email above first.')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) setError(friendlyError(error.message))
  else setResetSent(true)
}

// Handles Sign In and Sign Up using Supabase email/password auth
function friendlyError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Wrong email or password.'
  if (msg.includes('User already registered')) return 'An account with this email already exists.'
  if (msg.includes('valid email')) return 'Please enter a valid email address.'
  if (msg.includes('at least 6')) return 'Password must be at least 6 characters.'
  return msg
}
async function handleSignIn() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(friendlyError(error.message))
    } else {
      navigate('/dashboard')
    }
  }

  async function handleSignUp() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    })
    setLoading(false)
    if (error) {
      setError(friendlyError(error.message))
    } else {
      navigate('/dashboard')
    }
  }
  

  return (
  <div className="page-centered">
    <div className="auth-card">
      <h1 className="auth-title">DemandQ</h1>

      {/* Subtitle changes per mode */}
      <p className="auth-subtitle">
        {mode === 'signin' && 'Sign in to manage your surveys'}
        {mode === 'signup' && 'Create your account to get started'}
        {mode === 'forgot' && "Enter your email and we'll send a reset link"}
      </p>

      {error && <p className="error-banner">{error}</p>}

      {/* FORGOT MODE */}
      {mode === 'forgot' && (
        <>
          {resetSent ? (
            <p className="auth-subtitle" style={{ color: 'var(--color-oasis)', marginBottom: '1rem' }}>
              Reset link sent — check your email.
            </p>
          ) : (
            <>
              <input type="email" placeholder="Email" value={email}
                onChange={e => setEmail(e.target.value)} className="input-field-spaced-lg" />
              <button onClick={handleForgotPassword} disabled={loading} className="btn-primary">
                {loading ? 'Please wait...' : 'Send reset link'}
              </button>
            </>
          )}
          <button onClick={() => { setMode('signin'); setError(''); setResetSent(false) }} className="link-muted" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
            ← Back to sign in
          </button>
        </>
      )}

      {/* SIGNIN MODE */}
      {mode === 'signin' && (
        <>
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} className="input-field-spaced" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} className="input-field-spaced-lg" />
          <button onClick={handleSignIn} disabled={loading} className="btn-primary">
            {loading ? 'Please wait...' : 'Sign In'}
          </button>
          <button onClick={() => { setMode('signup'); setError('') }} disabled={loading} className="btn-secondary">
            Create an account
          </button>
          <button onClick={() => { setMode('forgot'); setError('') }} className="link-muted" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
            Forgot password
          </button>
        </>
      )}

      {/* SIGNUP MODE */}
      {mode === 'signup' && (
        <>
          <input type="text" placeholder="Your name" value={name}
            onChange={e => setName(e.target.value)} className="input-field-spaced" />
          <input type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} className="input-field-spaced" />
          <input type="password" placeholder="Password" value={password}
            onChange={e => setPassword(e.target.value)} className="input-field-spaced-lg" />
          <button onClick={handleSignUp} disabled={loading} className="btn-primary">
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
          <button onClick={() => { setMode('signin'); setError('') }} className="link-muted" style={{ width: '100%', textAlign: 'center', marginTop: '0.5rem' }}>
            ← Already have an account
          </button>
        </>
      )}

    </div>
  </div>
)
}
// On success: redirects to /dashboard
// Ask Claude: "Write me the Login page in React using Supabase email and password authentication"