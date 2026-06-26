import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
  <div className="min-h-screen bg-gray-300 flex items-center justify-center p-6">
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex">

      {/* Left Side */}
      <div className="w-1/2 relative">
        <img
          src="/login_image.png"
          alt="Welcome"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex items-start justify-center pt-20">
          <h1 className="text-white text-5xl font-light tracking-[8px]">
            WELCOME
          </h1>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-1/2 flex items-center justify-center bg-white">
        <div className="w-80">

          <h1 className="text-5xl font-bold text-center mb-16">
            Login
          </h1>

          {error && (
            <p className="text-red-500 mb-6 text-center">
              {error}
            </p>
          )}

          {/* Email */}
          <div className="mb-8">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-gray-400 focus:outline-none py-2"
            />
          </div>

          {/* Password */}
          <div className="mb-10 relative">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-400 focus:outline-none py-2"
            />

            <button className="absolute right-0 top-2 text-xs text-blue-900">
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full bg-blue-900 text-white py-4 rounded-xl text-lg font-semibold hover:bg-blue-800 transition"
          >
            {loading ? "Loading..." : "Login"}
          </button>

          {/* Sign Up */}
          <p className="text-center mt-28 text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={handleSignUp}
              className="text-blue-900 font-semibold"
            >
              Sign up
            </button>
          </p>

        </div>
      </div>

    </div>
  </div>
);}
