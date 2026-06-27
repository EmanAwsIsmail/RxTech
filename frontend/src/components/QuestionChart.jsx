// QuestionChart.jsx
// Props:
//   question  — { id, question_text, question_type, options, position }
//   responses — array of response objects: { id, survey_id, answers, submitted_at }
//               each response.answers is a JSON object keyed by question id

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const BAR_COLORS = ['#B5651D', '#5C7A5E', '#9C5318', '#1F2A24']

import { useEffect, useState } from 'react'

function TextSummary({ question, responses, questionId }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [shown, setShown] = useState(false)

  const answers = responses
    .map(r => r.answers?.[questionId])
    .filter(a => a && a.trim() !== '')

  useEffect(() => {
    if (answers.length === 0) { setLoading(false); return }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000'
    fetch(`${apiUrl}/api/summarize-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answers }),
    })
      .then(r => r.text())
      .then(text => { setSummary(text); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="chart-card">
      <p className="chart-title-tight">{question}</p>

      {answers.length === 0 ? (
        <p className="text-empty">No answers yet.</p>
      ) : !shown ? (
        // Raw list + button
        <>
          <ul className="answer-list">
            {answers.map((a, i) => (
              <li key={i} className="answer-list-item">
                {a}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShown(true)}
            disabled={loading}
            className="btn-ai-toggle"
          >
            {loading ? 'Preparing summary…' : 'Summarise with AI'}
          </button>
        </>
      ) : (
        // AI summary
        <>
          {summary ? (
            <p className="summary-text">{summary}</p>
          ) : (
            <p className="text-empty">Could not summarise. Check backend.</p>
          )}
          <button
            onClick={() => setShown(false)}
            className="btn-show-toggle"
          >
            Show all recorded answers
          </button>
        </>
      )}

      <p className="chart-footer-tight">
        {answers.length} answer{answers.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function QuestionChart({ question, responses }) {
  const { id, question_text, question_type, options } = question

  // ── yes_no ──────────────────────────────────────────────────────────────────
  if (question_type === 'yes_no') {
    let yes = 0
    let no = 0

    for (const r of responses) {
      const answer = r.answers?.[id]
      if (answer === 'Yes') yes++
      else if (answer === 'No') no++
    }

    const data = [
      { label: 'Yes', count: yes },
      { label: 'No', count: no },
    ]

    return (
      <div className="chart-card">
        <p className="chart-title">{question_text}</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} barCategoryGap="40%">
            <XAxis
              dataKey="label"
              tick={{ fontSize: 13, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              formatter={(value) => [value, 'Responses']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={i === 0 ? '#B5651D' : '#E8E1D6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-footer">
          {yes + no} answer{yes + no !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  // ── multiple_choice ──────────────────────────────────────────────────────────
  if (question_type === 'multiple_choice') {
    // options is stored as a JSON array of strings in Supabase
    const optionList = Array.isArray(options) ? options : []
    const counts = {}
    for (const opt of optionList) counts[opt] = 0

    for (const r of responses) {
      const answer = r.answers?.[id]
      if (answer !== undefined && answer !== null && answer !== '') {
        // answer is the selected option string
        if (counts[answer] !== undefined) counts[answer]++
        else counts[answer] = 1
      }
    }

    const data = optionList.map((opt) => ({ label: opt, count: counts[opt] ?? 0 }))
    const total = data.reduce((s, d) => s + d.count, 0)

    return (
      <div className="chart-card">
        <p className="chart-title">{question_text}</p>
        <ResponsiveContainer width="100%" height={Math.max(180, data.length * 52)}>
          <BarChart data={data} layout="vertical" barCategoryGap="30%">
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={120}
              tick={{ fontSize: 13, fill: '#374151' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
              formatter={(value) => [value, 'Responses']}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="chart-footer">
          {total} answer{total !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }

  // ── short_text ───────────────────────────────────────────────────────────────
if (question_type === 'short_text') {
  return <TextSummary question={question_text} responses={responses} questionId={id} />
}

  // Fallback for unknown types
  return (
    <div className="chart-card">
      <p className="text-sm text-gray-500">Unknown question type: {question_type}</p>
    </div>
  )
}