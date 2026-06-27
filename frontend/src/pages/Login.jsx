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
  const texts = {
  en: {
    titleLogin: 'Login',
    titleSignup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    signup: 'Sign up',
    forgot: 'Forgot password?',
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    switchTo: 'العربية',
    loginMessage:'Enter your email and password',
    signupMessage: 'Enter new email and password'
  },
  ar: {
    titleLogin: 'تسجيل الدخول',
    titleSignup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    forgot: 'هل نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟',
    haveAccount: 'لديك حساب بالفعل؟',
    switchTo: 'English',
    loginMessage: 'أدخل البريد الإلكتروني وكلمة المرور',
    signupMessage: 'أدخل بريداً إلكترونياً وكلمة مرور جديدة'
  },
} 

  const [lang, setLang] = useState('en')
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [isSignup, setIsSignup] = useState(false)
function handleKeyDown(e) {
  if (e.key === 'Enter') handleSubmit()
}

async function handleSubmit() {
  setError('')
  setLoading(true)

  const result = isSignup
    ? await supabase.auth.signUp({ email, password })
    : await supabase.auth.signInWithPassword({ email, password })

  if (result.error) {
    setError(
      isSignup
        ? texts[lang].signupMessage
        : texts[lang].loginMessage
    )
  } else {
    navigate('/dashboard')
  }

  setLoading(false)
}

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
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
  <div className="login-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
    <div className="login-card">
    <button
      type="button"
      className="lang-switch"
      onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
    >
      {texts[lang].switchTo}
    </button>
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
          {isSignup ? texts[lang].titleSignup : texts[lang].titleLogin}
        </h1>

          {error && (
            <p className="login-error" role="alert">{error}</p>
          )}
          <button
            type="button"
            className="lang-switch"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          >
            {texts[lang].switchTo}
          </button>
          {/* Email */}
                      <input
            type="email"
            className="login-input"
            placeholder={texts[lang].email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          <input
            type="password"
            className="login-input"
            placeholder={texts[lang].password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />

          {/* Login */}
        <button
          className="login-btn-primary"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading
            ? lang === 'ar'
              ? 'جاري التحميل...'
              : 'Loading...'
            : isSignup
              ? texts[lang].signup
              : texts[lang].login}
        </button>

          {/* Forgot password */}
          <button className="login-btn-primary login-btn-small">
            {texts[lang].forgot}
          </button>


          {/* Sign up */}
          <p className="login-signup-row">
            {isSignup ? texts[lang].haveAccount : texts[lang].noAccount}
            &nbsp;

            <button
              type="button"
              className="login-signup-link"
              onClick={() => {
                setIsSignup(!isSignup)
                setError('')
              }}
            >
              {isSignup ? texts[lang].login : texts[lang].signup}
            </button>
          </p>

        </div>
      </div>

    </div>
  </div>
)
}