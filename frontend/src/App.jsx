// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateSurvey from './pages/CreateSurvey'
import SurveyResults from './pages/SurveyResults'
import PublicSurvey from './pages/PublicSurvey'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/survey/:id" element={<PublicSurvey />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute><CreateSurvey /></ProtectedRoute>
        } />
        <Route path="/results/:id" element={
          <ProtectedRoute><SurveyResults /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}