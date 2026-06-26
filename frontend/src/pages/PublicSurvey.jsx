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

  if (loading) return <div className="p-6 text-center">Loading survey...</div>
  if (error && !survey) return <div className="p-6 text-center text-red-600">{error}</div>

  if (submitted) {
    return (
      <div className="max-w-md mx-auto p-6 text-center mt-10">
        <h1 className="text-xl font-bold mb-2">Thank you!</h1>
        <p>Your response has been recorded.</p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-1">{survey.title}</h1>
      {survey.description && (
        <p className="text-gray-600 mb-4">{survey.description}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map(q => (
          <div key={q.id}>
            <p className="font-medium mb-2">{q.question_text}</p>

            {q.question_type === 'yes_no' && (
              <div className="flex gap-4">
                {['Yes', 'No'].map(opt => (
                  <label key={opt} className="flex items-center gap-1">
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

            {q.question_type === 'multiple_choice' && (
              <div className="flex flex-col gap-1">
                {(q.options || []).map(opt => (
                  <label key={opt} className="flex items-center gap-1">
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
                className="w-full border rounded p-2"
                rows={2}
                value={answers[q.id] || ''}
                onChange={e => handleChange(q.id, e.target.value)}
              />
            )}
          </div>
        ))}

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded"
        >
          Submit
        </button>
      </form>
    </div>
  )
}