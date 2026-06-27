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
      <div className="page-loading-center">
        <p className="text-muted-sm">Loading results…</p>
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="page-loading-center">
        <div className="text-center">
          <p className="text-ink font-medium mb-2">Survey not found</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-clay hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ──────────────────────────────────────────────────────────────

  return (
    <div className="page-shell">

      {/* Header */}
      <header className="app-header">
        <button
          onClick={() => navigate('/dashboard')}
          className="app-logo"
        >
          NumuX
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="link-muted"
        >
          ← Back to dashboard
        </button>
      </header>

      <main className="container-md">

        {/* Survey title + meta */}
        <div className="results-meta">
          <h1 className="results-title">{survey.title}</h1>
          {survey.description && (
            <p className="results-desc">{survey.description}</p>
          )}
        </div>

        {/* Response count + share link */}
        <div className="results-toprow">
           <div className="badge-count">
            <span className="text-base font-bold">{responses.length}</span>
            {responses.length === 1 ? ' response' : ' responses'}
          </div>

        </div>

        {/* No responses yet */}
        {responses.length === 0 && (
          <div className="warning-box">
            <p className="warning-text">
              No responses yet. Share the link above and check back once people have responded.
            </p>
          </div>
        )}

        {/* Charts — one per question */}
        <div className="stack-lg">
          {questions.map((q) => (
            <QuestionChart key={q.id} question={q} responses={responses} />
          ))}
        </div>

        {/* AI Insight section */}
        {responses.length > 0 && (
          <div className="insight-section">
            <div className="insight-divider">
              <div className="insight-header-row">
                <div>
                  <h2 className="insight-heading">
                    AI insight
                  </h2>
                  <p className="insight-subtext">
                    A plain-English summary of what your results mean.
                  </p>
                </div>

                <button
                  onClick={handleGenerateInsight}
                  disabled={insightLoading}
                  className="btn-insight"
                >
                  {insightLoading ? 'Analysing…' : 'Generate insight'}
                </button>
              </div>

              {/* Loading state */}
              {insightLoading && (
                <div className="insight-loading">
                  Analysing responses…
                </div>
              )}

              {/* Error */}
              {insightError && !insightLoading && (
                <div className="insight-error">
                  {insightError}
                </div>
              )}

              {/* Insight result */}
              {insight && !insightLoading && (
                <div className="insight-result">
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