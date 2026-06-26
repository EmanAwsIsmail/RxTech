// frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()

  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadSurveys()
  }, [])

  async function loadSurveys() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      setUserEmail(session.user.email)
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setSurveys(data)
    } else {
      console.error(error)
    }

    setLoading(false)
  }

  async function handleDelete(id, title) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"?\n\nThis will permanently delete the survey, all of its questions, and all responses. This action cannot be undone.`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    setSurveys(prev => prev.filter(s => s.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const publicBaseUrl = window.location.origin

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">DemandQ</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            {userEmail}
          </span>

          <button
            onClick={handleSignOut}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Your surveys
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {surveys.length === 0
                ? 'No surveys yet'
                : `${surveys.length} survey${surveys.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <button
            onClick={() => navigate('/create')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + New Survey
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : surveys.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-gray-500 mb-4">
              You haven't created any surveys yet.
            </p>

            <button
              onClick={() => navigate('/create')}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Create your first survey
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {surveys.map((survey) => (
              <li
                key={survey.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {survey.title}
                    </p>

                    {survey.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {survey.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      Created{' '}
                      {new Date(survey.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 text-right">
                    <button
                      onClick={() => navigate(`/results/${survey.id}`)}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Results
                    </button>

                    <button
                      onClick={() => {
                        const link = `${publicBaseUrl}/survey/${survey.id}`
                        navigator.clipboard.writeText(link)
                        alert('Link copied!')
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Copy Share Link
                    </button>

                    <button
                      onClick={() => handleDelete(survey.id, survey.title)}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete Survey
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}