// CreateSurvey.jsx  (protected — requires login)
// Screen 1: Entrepreneur creates a survey

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MAX_QUESTIONS = 5
const MAX_OPTIONS = 4

function emptyQuestion() {
  return { question_text: '', question_type: 'yes_no', options: ['', '', '', ''] }
}

export default function CreateSurvey() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(index, field, value) {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  function updateOption(qIndex, oIndex, value) {
    const updated = [...questions]
    const opts = [...updated[qIndex].options]
    opts[oIndex] = value
    updated[qIndex] = { ...updated[qIndex], options: opts }
    setQuestions(updated)
  }

  function addQuestion() {
    if (questions.length >= MAX_QUESTIONS) return
    setQuestions([...questions, emptyQuestion()])
  }

  function removeQuestion(index) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Please enter a title.')
      return
    }
    if (questions.length === 0) {
      setError('Add at least one question.')
      return
    }
    for (const q of questions) {
      if (!q.question_text.trim()) {
        setError('Every question needs text.')
        return
      }
      if (q.question_type === 'multiple_choice') {
        const filled = q.options.filter((o) => o.trim() !== '')
        if (filled.length < 2) {
          setError('Multiple choice questions need at least 2 options.')
          return
        }
      }
    }

    setSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user

      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({ user_id: user.id, title: title.trim(), description: description.trim() || null })
        .select()
        .single()

      if (surveyError) throw surveyError

      const rows = questions.map((q, i) => ({
        survey_id: survey.id,
        question_text: q.question_text.trim(),
        question_type: q.question_type,
        options: q.question_type === 'multiple_choice'
          ? q.options.filter((o) => o.trim() !== '')
          : null,
        position: i,
      }))

      const { error: questionsError } = await supabase.from('questions').insert(rows)
      if (questionsError) throw questionsError

      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h1>Create a Survey</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: '100%', padding: 8 }}
          />
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} style={{ border: '1px solid #ccc', padding: 12, marginBottom: 12 }}>
            <label>Question {qIndex + 1}</label>
            <input
              type="text"
              value={q.question_text}
              onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            />

            <select
              value={q.question_type}
              onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
              style={{ width: '100%', padding: 8, marginBottom: 8 }}
            >
              <option value="yes_no">Yes / No</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="short_text">Short Text</option>
            </select>

            {q.question_type === 'multiple_choice' && (
              <div>
                {Array.from({ length: MAX_OPTIONS }).map((_, oIndex) => (
                  <input
                    key={oIndex}
                    type="text"
                    placeholder={`Option ${oIndex + 1}`}
                    value={q.options[oIndex]}
                    onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                    style={{ width: '100%', padding: 8, marginBottom: 4 }}
                  />
                ))}
              </div>
            )}

            {questions.length > 1 && (
              <button type="button" onClick={() => removeQuestion(qIndex)}>
                Remove
              </button>
            )}
          </div>
        ))}

        {questions.length < MAX_QUESTIONS && (
          <button type="button" onClick={addQuestion} style={{ marginBottom: 16 }}>
            Add Question
          </button>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Create Survey'}
        </button>
      </form>
    </div>
  )
}
