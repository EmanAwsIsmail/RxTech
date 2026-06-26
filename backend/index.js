require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// POST /api/insight
// Receives survey data and returns an AI-generated insight paragraph
app.post('/api/insight', async (req, res) => {
  const { title, questions, responses } = req.body

  // Format the survey data into a readable summary for the AI
  const summary = questions.map(q => {
    const qAnswers = responses.map(r => r.answers[q.id]).filter(Boolean)
    return `Question: ${q.question_text}\nAnswers: ${qAnswers.join(', ')}`
  }).join('\n\n')

  const prompt = `You are a business insight assistant helping a small entrepreneur in Al Qua'a, a rural community in the UAE.
Here are the results of their demand survey titled "${title}":

${summary}

Write 2 to 3 plain sentences summarising what the data shows and what it means for their business decision.
Be specific about numbers. Avoid jargon. Write as if speaking to someone with no data background.`

  // TODO: Replace this section with your chosen LLM API call
  // Ask Claude in your build chat: "Write the API call for [Gemini / Groq / OpenAI] here"
  res.json({ insight: 'LLM API call not yet configured. Add your API call here.' })
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`))
