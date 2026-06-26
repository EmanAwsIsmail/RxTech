// frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()

  // Stores the user's surveys
  const [surveys, setSurveys] = useState([])

  // Controls loading state while data is being fetched
  const [loading, setLoading] = useState(true)

  // Stores the logged-in user's email address
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    async function load() {
      // Get current authenticated user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        setUserEmail(session.user.email)
      }

      // Fetch surveys from Supabase database
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) {
        setSurveys(data)
      }

      setLoading(false)
    }

    load()
  }, [])

  // Signs the user out and redirects to login page
  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  // Used to generate public share links
  const publicBaseUrl = window.location.origin

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
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
        {/* Dashboard Title and Create Survey Button */}
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

        {/* Loading State */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : surveys.length === 0 ? (
          /* Empty State */
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
          /* Survey List */
          <ul className="space-y-3">
            {surveys.map((survey) => (
              <li
                key={survey.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Survey Information */}
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

                  {/* Survey Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
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