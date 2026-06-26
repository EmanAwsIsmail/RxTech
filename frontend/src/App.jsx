import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateSurvey from './pages/CreateSurvey'
import SurveyResults from './pages/SurveyResults'
import PublicSurvey from './pages/PublicSurvey'

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" />
  return children
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  if (loading) return <p>Loading...</p>

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/survey/:id" element={<PublicSurvey />} />
        <Route path="/dashboard" element={
          <ProtectedRoute session={session}><Dashboard /></ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute session={session}><CreateSurvey /></ProtectedRoute>
        } />
        <Route path="/results/:id" element={
          <ProtectedRoute session={session}><SurveyResults /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
