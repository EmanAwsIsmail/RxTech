
// SurveyResults.jsx  (protected — requires login)
// Screen 3 + Screen 4: Shows charts for each question and the AI insight button
// frontend/src/pages/SurveyResults.jsx
// Protected — requires login
// Fetches survey + questions + responses from Supabase by :id in the URL
// Renders a QuestionChart for each question
// "Generate Insight" button calls POST /api/insight on the Express backend

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import QuestionChart from '../components/QuestionChart'

export default function SurveyResults() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [survey, setSurvey] = useState(null)
  const [questions, setQuestions] = useState([])
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  // AI insight state
  const [insight, setInsight] = useState('')
  const [insightLoading, setInsightLoading] = useState(false)
  const [insightError, setInsightError] = useState('')

  useEffect(() => {
    loadAll()
  }, [id])

  async function loadAll() {
    setLoading(true)

    // Fetch survey
    const { data: surveyData, error: surveyError } = await supabase
      .from('surveys')
      .select('*')
      .eq('id', id)
      .single()

    if (surveyError || !surveyData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setSurvey(surveyData)

    // Fetch questions ordered by position
    const { data: questionData, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('survey_id', id)
      .order('position', { ascending: true })

    if (!questionError) setQuestions(questionData)

    // Fetch responses
    const { data: responseData, error: responseError } = await supabase
      .from('responses')
      .select('*')
      .eq('survey_id', id)
      .order('submitted_at', { ascending: true })

    if (!responseError) setResponses(responseData)

    setLoading(false)
  }

  async function handleGenerateInsight() {
    setInsight('')
    setInsightError('')
    setInsightLoading(true)

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'

    try {
      const res = await fetch(`${apiUrl}/api/insight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyTitle: survey.title,
          surveyDescription: survey.description || '',
          questions: questions,
          responses: responses,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server error ${res.status}`)
      }

      const text = await res.text()
      setInsight(text)
    } catch (err) {
      setInsightError(
        err.message || 'Could not connect to the backend. Make sure it is running.'
      )
    } finally {
      setInsightLoading(false)
    }
  }

  // ── Loading / error states ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading results…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 font-medium mb-2">Survey not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-600 hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 font-bold text-xl"
        >
          DemandQ
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          ← Back to dashboard
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">

        {/* Survey title + meta */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-500 mt-1 text-sm">{survey.description}</p>
          )}
        </div>

        {/* Response count + share link */}
        <div className="flex items-center justify-between mt-4 mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
              <span className="text-base font-bold">{responses.length}</span>
              {responses.length === 1 ? ' response' : ' responses'}
            </span>
          </div>

        </div>

        {/* No responses yet */}
        {responses.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8">
            <p className="text-sm text-amber-800">
              No responses yet. Share the link above and check back once people have responded.
            </p>
          </div>
        )}

        {/* Charts — one per question */}
        <div className="space-y-5">
          {questions.map((q) => (
            <QuestionChart key={q.id} question={q} responses={responses} />
          ))}
        </div>

        {/* AI Insight section */}
        {responses.length > 0 && (
          <div className="mt-10">
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    AI insight
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    A plain-English summary of what your results mean.
                  </p>
                </div>

                <button
                  onClick={handleGenerateInsight}
                  disabled={insightLoading}
                  className="shrink-0 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {insightLoading ? 'Analysing…' : 'Generate insight'}
                </button>
              </div>

              {/* Loading state */}
              {insightLoading && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-sm text-gray-500 animate-pulse">
                  Analysing responses…
                </div>
              )}

              {/* Error */}
              {insightError && !insightLoading && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-700">
                  {insightError}
                </div>
              )}

              {/* Insight result */}
              {insight && !insightLoading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 text-sm text-blue-900 leading-relaxed">
                  {insight}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}