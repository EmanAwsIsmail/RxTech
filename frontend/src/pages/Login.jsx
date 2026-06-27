// Login.jsx
// Handles Sign In, Sign Up, and Forgot Password via Supabase email/password auth.
// Style: classNames map 1:1 to styleFINAL.css (.login-page, .login-card, .login-left,
// .login-right, .password-row, .bottom-link, .error-banner, .success-text, .language-switch)
// No fallback to shared.css needed — every class here is defined in styleFINAL.css.
// Routing/logic preserved exactly from the original file.

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import loginWelcome from '../Images/Login_welcome.jpg'
import '../styles/shared.css'
import '../style.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [name, setName] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [lang, setLang] = useState('en')
  const isAr = lang === 'ar'

  const t = {
    en: {
      welcome: 'WELCOME', login: 'Login', signup: 'Sign Up', reset: 'Reset Password',
      email: 'Email', password: 'Password', name: 'Your name', forgot: 'Forgot password?',
      wait: 'Please wait...', sendReset: 'Send reset link',
      resetSent: 'Reset link sent — check your email.', backLogin: 'Back to login',
      noAccount: "Don't have an account?", signupLink: 'Sign up',
      already: 'Already have an account? Login', switch: 'العربية'
    },
    ar: {
      welcome: 'أهلاً وسهلاً', login: 'تسجيل الدخول', signup: 'إنشاء حساب',
      reset: 'إعادة تعيين كلمة المرور', email: 'البريد الإلكتروني', password: 'كلمة المرور',
      name: 'الاسم', forgot: 'نسيت كلمة المرور؟', wait: 'يرجى الانتظار...',
      sendReset: 'إرسال رابط التعيين', resetSent: 'تم إرسال الرابط — تحقق من بريدك.',
      backLogin: 'العودة لتسجيل الدخول', noAccount: 'ليس لديك حساب؟',
      signupLink: 'إنشاء حساب', already: 'لديك حساب بالفعل؟ تسجيل الدخول', switch: 'English'
    }
  }

  function friendlyError(msg) {
    if (msg.includes('Invalid login credentials')) return 'Wrong email or password.'
    if (msg.includes('User already registered')) return 'An account with this email already exists.'
    if (msg.includes('valid email')) return 'Please enter a valid email address.'
    if (msg.includes('at least 6')) return 'Password must be at least 6 characters.'
    return msg
  }

  async function handleForgotPassword() {
    if (!email) return setError('Enter your email above first.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    if (error) setError(friendlyError(error.message))
    else setResetSent(true)
  }

  async function handleSignIn() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setError(friendlyError(error.message))
    else navigate('/dashboard')
  }

  async function handleSignUp() {
    setError('')
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    })
    setLoading(false)
    if (error) setError(friendlyError(error.message))
    else navigate('/dashboard')
  }

  return (
    <div className="login-page" dir={isAr ? 'rtl' : 'ltr'}>
      <button className="language-switch" onClick={() => setLang(isAr ? 'en' : 'ar')}>
        {t[lang].switch}
      </button>

      <div className="login-card">
        <div className="login-left">
          <img src={loginWelcome} alt="Welcome" />
          <h1>{t[lang].welcome}</h1>
        </div>

        <div className="login-right">
          <h2>
            {mode === 'signin' && t[lang].login}
            {mode === 'signup' && t[lang].signup}
            {mode === 'forgot' && t[lang].reset}
          </h2>

          {error && <p className="error-banner">{error}</p>}

          {mode === 'forgot' && (
            <>
              {resetSent ? (
                <p className="success-text">{t[lang].resetSent}</p>
              ) : (
                <>
                  <input type="email" placeholder={t[lang].email} value={email}
                    onChange={e => setEmail(e.target.value)} />
                  <button onClick={handleForgotPassword} disabled={loading}>
                    {loading ? t[lang].wait : t[lang].sendReset}
                  </button>
                </>
              )}
              <p className="bottom-link" onClick={() => setMode('signin')}>
                {t[lang].backLogin}
              </p>
            </>
          )}

          {mode === 'signin' && (
            <>
              <input type="email" placeholder={t[lang].email} value={email}
                onChange={e => setEmail(e.target.value)} />
              <div className="password-row">
                <input type="password" placeholder={t[lang].password} value={password}
                  onChange={e => setPassword(e.target.value)} />
                <span onClick={() => setMode('forgot')}>{t[lang].forgot}</span>
              </div>
              <button onClick={handleSignIn} disabled={loading}>
                {loading ? t[lang].wait : t[lang].login}
              </button>
              <p className="bottom-link">
                {t[lang].noAccount}{' '}
                <span onClick={() => setMode('signup')}>{t[lang].signupLink}</span>
              </p>
            </>
          )}

          {mode === 'signup' && (
            <>
              <input type="text" placeholder={t[lang].name} value={name}
                onChange={e => setName(e.target.value)} />
              <input type="email" placeholder={t[lang].email} value={email}
                onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder={t[lang].password} value={password}
                onChange={e => setPassword(e.target.value)} />
              <button onClick={handleSignUp} disabled={loading}>
                {loading ? t[lang].wait : t[lang].signup}
              </button>
              <p className="bottom-link" onClick={() => setMode('signin')}>
                {t[lang].already}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}