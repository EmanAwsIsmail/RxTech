const express = require('express')
const cors = require('cors')
require('dotenv').config()
const Groq = require('groq-sdk')

const app = express()
const PORT = process.env.PORT || 4000
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

app.use(cors({
  origin: ['https://deluxe-tartufo-6439fb.netlify.app', 'http://localhost:5173']
}))
app.use(express.json())

app.get('/', (req, res) => res.send('DemandQ backend running.'))

app.post('/api/insight', async (req, res) => {
  const { surveyTitle, surveyDescription, questions, responses } = req.body
  if (!questions || !responses) return res.status(400).send('Missing data.')

  const summaryLines = []
  for (const q of questions) {
    const { id, question_text, question_type, options } = q
    summaryLines.push(`Question: "${question_text}" (${question_type})`)
    if (question_type === 'yes_no') {
      let yes = 0, no = 0
      for (const r of responses) {
        if (r.answers?.[id] === 'Yes') yes++
        else if (r.answers?.[id] === 'No') no++
      }
      summaryLines.push(`  Yes: ${yes}, No: ${no}`)
    } else if (question_type === 'multiple_choice') {
      const opts = Array.isArray(options) ? options : []
      const counts = {}
      for (const o of opts) counts[o] = 0
      for (const r of responses) {
        const a = r.answers?.[id]
        if (a && counts[a] !== undefined) counts[a]++
      }
      for (const [o, c] of Object.entries(counts)) summaryLines.push(`  "${o}": ${c}`)
    } else if (question_type === 'short_text') {
      const answers = responses.map(r => r.answers?.[id]).filter(a => a?.trim())
      summaryLines.push(answers.length ? `  Answers: ${answers.map(a => `"${a}"`).join(', ')}` : '  No text answers.')
    }
    summaryLines.push('')
  }

  const prompt = `You are a business advisor helping a first-time entrepreneur in Al Qua'a, a small rural village in the UAE desert. People there have no nearby shops and must travel far for basic goods. The entrepreneur ran a quick community survey to find out what people need most before deciding what business to start.

  Survey title: "${surveyTitle}"
  ${surveyDescription ? `About this survey: "${surveyDescription}"` : ''}
  Number of people who responded: ${responses.length}

  Survey results:
  ${summaryLines.join('\n')}

  Based only on these results, write exactly 2 short plain lines.
  No bullet symbols. No bold. No asterisks. No markdown. No numbers. Plain text only.
  Each line starts with its label.

  What to do: one sentence on what product or service to offer and to who, based on what the data shows.
  Why it will work: one sentence explaining why using specific numbers from the results.

  Simple words. Short sentences. Write like you are talking to someone with no business background.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
    })
    res.send(completion.choices[0].message.content.trim())
  } catch (err) {
    console.error('Insight error:', err.message)
    res.status(502).send('AI error: ' + err.message)
  }
})

app.post('/api/summarize-text', async (req, res) => {
  const { question, answers } = req.body
  if (!answers || answers.length === 0) return res.send('')

  const prompt = `Survey question: "${question}"

  Answers:
  ${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

  Write one or two short simple sentences describing what people said. Group similar answers together naturally, like "4 people said water" or "2 said mornings, 1 said evenings". No lists, no bullet points, no numbering. Plain conversational English only.`

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.3,
    })
    res.send(completion.choices[0].message.content.trim())
  } catch (err) {
    console.error('Summarize error:', err.message)
    res.status(500).send('')
  }
})

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))