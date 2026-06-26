// CreateSurvey.jsx  (protected — requires login)
// Screen 1: Entrepreneur creates a survey
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import "../style.css";

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-blue-600">DemandQ</h1>
        <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-500 hover:text-gray-800">
          ← Back
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a survey</h2>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-5">{error}</p>
        )}

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Survey title *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Would you use a pharmacy in Al Qua'a?"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Briefly explain what this survey is about"
            rows={2}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Questions */}
        <div className="space-y-5">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Question {qIndex + 1}</span>
                {questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-xs text-red-500 hover:text-red-700"
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
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={q.question_type}
                onChange={e => updateQuestion(qIndex, 'question_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="yes_no">Yes / No</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_text">Short Text</option>
              </select>

              {q.question_type === 'multiple_choice' && (
                <div className="space-y-2 mt-2">
                  <p className="text-xs text-gray-500 mb-1">Options</p>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt}
                        onChange={e => updateOption(qIndex, oIndex, e.target.value)}
                        placeholder={`Option ${oIndex + 1}`}
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="mt-4 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500"
          >
            + Add question ({questions.length}/5)
          </button>
        )}

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={saving}
          className="mt-8 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Create Survey'}
        </button>
      </main>
    </div>
  )
}