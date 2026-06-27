// CreateSurvey.jsx  (protected — requires login)
// Screen 1: Entrepreneur creates a survey
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/shared.css'
const emptyQuestion = () => ({
  question_text: '',
  question_type: 'yes_no',
  options: ['', ''],
})

export default function CreateSurvey() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function updateQuestion(index, field, value) {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  function updateOption(qIndex, oIndex, value) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex) return q
      const newOptions = [...q.options]
      newOptions[oIndex] = value
      return { ...q, options: newOptions }
    }))
  }

  function addOption(qIndex) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || q.options.length >= 4) return q
      return { ...q, options: [...q.options, ''] }
    }))
  }

  function removeOption(qIndex, oIndex) {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIndex || q.options.length <= 2) return q
      return { ...q, options: q.options.filter((_, oi) => oi !== oIndex) }
    }))
  }

  function addQuestion() {
    if (questions.length >= 5) return
    setQuestions(prev => [...prev, emptyQuestion()])
  }

  function removeQuestion(index) {
    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  async function handleCreate() {
    setError('')
    if (!title.trim()) return setError('Please enter a survey title.')
    if (questions.some(q => !q.question_text.trim())) return setError('Please fill in all question fields.')

    setSaving(true)

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return navigate('/login')

    // Save survey
    const { data: survey, error: surveyError } = await supabase
      .from('surveys')
      .insert({ title: title.trim(), description: description.trim(), user_id: session.user.id })
      .select()
      .single()

    if (surveyError) {
      setError(surveyError.message)
      setSaving(false)
      return
    }

    // Save questions
    const questionRows = questions.map((q, i) => ({
      survey_id: survey.id,
      question_text: q.question_text.trim(),
      question_type: q.question_type,
      options: q.question_type === 'multiple_choice' ? q.options.filter(o => o.trim()) : null,
      position: i,
    }))

    const { error: questionsError } = await supabase.from('questions').insert(questionRows)

    if (questionsError) {
      setError('Survey saved but questions failed. Try again.')
      setSaving(false)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="page-shell">
      <header className="app-header">
        <h1 className="app-logo">DemandQ</h1>
        <button onClick={() => navigate('/dashboard')} className="link-muted">
          ← Back
        </button>
      </header>

      <main className="container-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a survey</h2>

        {error && (
          <p className="error-box">{error}</p>
        )}

        {/* Title */}
        <div className="field-mb">
          <label className="field-label">Survey title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Would you use a pharmacy in Al Qua'a?"
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="field-mb-lg">
          <label className="field-label">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Briefly explain what this survey is about"
            rows={2}
            className="textarea-field"
          />
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="question-card">
              <div className="question-card-header">
                <span className="question-label">Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="btn-text-danger"
                  >
                    Remove
                  </button>
                )}
              </div>

              <input
                type="text"
                value={q.question_text}
                onChange={e => updateQuestion(qIndex, 'question_text', e.target.value)}
                placeholder="Enter your question"
                className="input-field-tight"
              />

              <select
                value={q.question_type}
                onChange={e => updateQuestion(qIndex, 'question_type', e.target.value)}
                className="input-field-tight"
              >
                <option value="yes_no">Yes / No</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_text">Short Text</option>
              </select>

              {q.question_type === 'multiple_choice' && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Options</p>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="option-row">
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="option-input"
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIndex, oIndex)}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                  {q.options.length < 4 && (
                    <button
                      onClick={() => addOption(qIndex)}
                      className="text-xs text-blue-600 hover:underline mt-1"
                    >
                      + Add option
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Question */}
        {questions.length < 5 && (
          <button
            onClick={addQuestion}
            className="tbtn-dashed"
          >
            + Add question ({questions.length}/5)
          </button>
        )}

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="btn-primary-block"
        >
          {saving ? 'Saving...' : 'Create Survey'}
        </button>
      </main>
    </div>
  )
}