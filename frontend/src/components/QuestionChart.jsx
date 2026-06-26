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

const BAR_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626']

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
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
      <p className="font-semibold text-gray-900 mb-3">{question}</p>

      {answers.length === 0 ? (
        <p className="text-sm text-gray-400">No answers yet.</p>
      ) : !shown ? (
        // Raw list + button
        <>
          <ul className="space-y-2 mb-3">
            {answers.map((a, i) => (
              <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100">
                {a}
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShown(true)}
            disabled={loading}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg px-3 py-1.5 disabled:opacity-50"
          >
            {loading ? 'Preparing summary…' : 'Summarise with AI'}
          </button>
        </>
      ) : (
        // AI summary
        <>
          {summary ? (
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          ) : (
            <p className="text-sm text-gray-400">Could not summarise. Check backend.</p>
          )}
          <button
            onClick={() => setShown(false)}
            className="text-xs text-gray-400 hover:text-gray-600 mt-3"
          >
            Show raw answers
          </button>
        </>
      )}

      <p className="text-xs text-gray-400 mt-3 text-right">
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
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
        <p className="font-semibold text-gray-900 mb-4">{question_text}</p>
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
                <Cell key={i} fill={i === 0 ? '#2563eb' : '#e5e7eb'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2 text-right">
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
      <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
        <p className="font-semibold text-gray-900 mb-4">{question_text}</p>
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
        <p className="text-xs text-gray-400 mt-2 text-right">
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
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-5">
      <p className="text-sm text-gray-500">Unknown question type: {question_type}</p>
    </div>
  )
}