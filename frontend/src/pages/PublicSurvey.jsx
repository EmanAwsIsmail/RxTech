// PublicSurvey.jsx  (public — no login needed)
// Screen 2: Community member fills in and submits a survey
// frontend/src/pages/PublicSurvey.jsx
// Screen 2 — public, no login needed
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function PublicSurvey() {
  const { id } = useParams()
  const [survey, setSurvey] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSurvey() {
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('id, title, description')
        .eq('id', id)
        .single()

      if (surveyError || !surveyData) {
        setError('Survey not found.')
        setLoading(false)
        return
      }

      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('survey_id', id)
        .order('position', { ascending: true })

      if (questionError) {
        setError('Could not load questions.')
        setLoading(false)
        return
      }

      setSurvey(surveyData)
      setQuestions(questionData)
      setLoading(false)
    }
    fetchSurvey()
  }, [id])

  function handleChange(questionId, value) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    // require every question to be answered
    const unanswered = questions.find(q => !answers[q.id] || answers[q.id].trim() === '')
    if (unanswered) {
      setError('Please answer all questions before submitting.')
      return
    }
    setError('')

    const { error: insertError } = await supabase
      .from('responses')
      .insert({ survey_id: id, answers })

    if (insertError) {
      console.log('INSERT ERROR:', insertError)
      setError(`Error: ${insertError.message}`)
      return
    }

    setSubmitted(true)
  }

  if (loading) return <div className="page-loading">Loading survey...</div>
  if (error && !survey) return <div className="page-loading-error">{error}</div>

  if (submitted) {
    return (
      <div className="public-thankyou">
        <h1 className="thankyou-title">Thank you!</h1>
        <p>Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <div className="public-shell">
      <h1 className="public-title">{survey.title}</h1>
      {survey.description && (
        <p className="public-desc">{survey.description}</p>
      )}

      <form onSubmit={handleSubmit} className="public-form">
        {questions.map(q => (
          <div key={q.id}>
            <p className="question-prompt">{q.question_text}</p>

            {q.question_type === 'yes_no' && (
              <div className="option-group-row">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className="radio-label">
                    <input
                      type="radio"
                      className="radio-input"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleChange(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'multiple_choice' && (
              <div className="option-group-col">
                {(q.options || []).map(opt => (
                  <label key={opt} className="radio-label">
                    <input
                      type="radio"
                      name={q.id}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleChange(q.id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'short_text' && (
              <textarea
                className="textarea-field"
                rows={2}
                value={answers[q.id] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {error && <p className="error-text">{error}</p>}

        <button
          type="submit"
          className="btn-primary"
        >
          Submit
        </button>
      </form>
    </div>
  )
}