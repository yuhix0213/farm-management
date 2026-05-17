// pages/api/ai/diagnosis.ts — AI健康診断（OpenRouter/free ルーター使用）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY が設定されていません。' })
  }

  const { cattleData, weatherData, messages } = req.body

  const systemPrompt = 'You are a Japanese livestock veterinarian AI assistant. Analyze the cattle data and weather information, and return ONLY a JSON object (no code blocks, no extra text) in this format: {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"日本語で2文の総評","actions":["対応1","対応2","対応3"],"detail":"日本語で詳細説明2〜3文","weatherImpact":"気象が健康に与える影響の一言コメント"}'

  const diagnosisRequest =
    `以下のデータを日本語で総合診断してください。\n` +
    `個体: ${JSON.stringify(cattleData)}\n` +
    `気象: ${JSON.stringify(weatherData)}`

  const userContent = messages?.length > 0
    ? String(messages[messages.length - 1].content)
    : diagnosisRequest

  const historyMessages = messages?.length > 1
    ? messages.slice(0, -1).map((m: any) => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content),
      }))
    : []

  const safeApiKey = apiKey.trim().replace(/[^\x20-\x7E]/g, '')

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: new Headers({
        'content-type':  'application/json',
        'authorization': `Bearer ${safeApiKey}`,
        'http-referer':  'https://farm-management-mauve.vercel.app',
        'x-title':       'Farm Management System',
      }),
      body: JSON.stringify({
        model:       'openrouter/free',  // 利用可能な無料モデルを自動選択
        temperature: 0.3,
        max_tokens:  1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...historyMessages,
          { role: 'user',   content: userContent },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('OpenRouter error:', JSON.stringify(err))
      return res.status(response.status).json({
        error: err.error?.message || `APIエラー: ${response.status}`,
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
