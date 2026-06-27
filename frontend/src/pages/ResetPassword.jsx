import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/shared.css'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleReset() {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setDone(true)
  }

  if (done) return (
    <div className="page-centered">
      <div className="auth-card">
        <h1 className="auth-title">NumuX</h1>
        <p className="auth-subtitle" style={{ color: 'var(--color-oasis)' }}>Password updated! You can now sign in.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">Go to Sign In</button>
      </div>
    </div>
  )

  return (
    <div className="page-centered">
      <div className="auth-card">
        <h1 className="auth-title">NumuX</h1>
        <p className="auth-subtitle">Enter your new password</p>
        {error && <p className="error-banner">{error}</p>}
        <input type="password" placeholder="New password" value={password}
          onChange={e => setPassword(e.target.value)} className="input-field-spaced-lg" />
        <button onClick={handleReset} className="btn-primary">Set new password</button>
      </div>
    </div>
  )
}