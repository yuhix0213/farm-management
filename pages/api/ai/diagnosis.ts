// pages/api/ai/diagnosis.ts — AI健康診断（OpenRouter）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY が設定されていません。' })
  }

  const { cattleData, weatherData, messages } = req.body

  // ASCII文字のみのシステムプロンプト（日本語はユーザーメッセージに含める）
  const systemPrompt = 'You are a Japanese livestock veterinarian AI assistant. Analyze the cattle data and weather information provided, and return ONLY a JSON object in this exact format (no code blocks, no extra text): {"risk":"low|mid|high","riskLabel":"low risk|caution|action required","summary":"brief summary in Japanese","actions":["action1","action2","action3"],"detail":"detailed explanation in Japanese","weatherImpact":"weather impact comment in Japanese"}'

  const diagnosisRequest =
    `以下のデータを日本語で総合診断してください。\n` +
    `個体データ: ${JSON.stringify(cattleData)}\n` +
    `気象データ: ${JSON.stringify(weatherData)}\n` +
    `riskLabelは「低リスク」「要観察」「要対応」のいずれかで返してください。`

  const userContent = messages && messages.length > 0
    ? messages[messages.length - 1].content
    : diagnosisRequest

  const historyMessages = messages && messages.length > 1
    ? messages.slice(0, -1).map((m: any) => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      }))
    : []

  try {
    // APIキーをASCII文字のみに変換（安全のため）
    const safeApiKey = Buffer.from(apiKey.trim()).toString('ascii').replace(/[^\x20-\x7E]/g, '')

    const body = JSON.stringify({
      model:       'meta-llama/llama-3.3-70b-instruct:free',
      temperature: 0.3,
      max_tokens:  1024,
      messages: [
        { role: 'system',  content: systemPrompt },
        ...historyMessages,
        { role: 'user',    content: userContent },
      ],
    })

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: new Headers({
        'content-type':  'application/json',
        'authorization': `Bearer ${safeApiKey}`,
        'http-referer':  'https://farm-management-mauve.vercel.app',
        'x-title':       'Farm Management System',
      }),
      body,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('OpenRouter error:', JSON.stringify(err))
      return res.status(response.status).json({
        error: err.error?.message || `OpenRouter APIエラー: ${response.status}`,
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    res.status(200).json({ content: { type: 'text', text } })

  } catch (e: any) {
    console.error('diagnosis error:', e)
    res.status(500).json({ error: String(e.message) })
  }
})
