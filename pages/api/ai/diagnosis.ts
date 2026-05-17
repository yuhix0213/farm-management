// pages/api/ai/diagnosis.ts — AI健康診断（OpenRouter・複数モデルフォールバック）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

// 無料モデルを優先順で試す（レート制限時に次のモデルへ）
const FREE_MODELS = [
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-3-12b-it:free',
  'meta-llama/llama-3.2-3b-instruct:free',
  'qwen/qwen-2.5-7b-instruct:free',
]

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY が設定されていません。' })
  }

  const { cattleData, weatherData, messages } = req.body

  const systemPrompt = 'You are a Japanese livestock veterinarian AI assistant. Analyze the cattle data and weather information, and return ONLY a JSON object (no code blocks, no extra text): {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"日本語で2文","actions":["対応1","対応2","対応3"],"detail":"日本語で詳細","weatherImpact":"気象影響コメント"}'

  const diagnosisRequest =
    `以下のデータを日本語で総合診断してください。\n` +
    `個体: ${JSON.stringify(cattleData)}\n` +
    `気象: ${JSON.stringify(weatherData)}`

  const userContent = messages?.length > 0
    ? String(messages[messages.length - 1].content)
    : diagnosisRequest

  const historyMessages = messages?.length > 1
    ? messages.slice(0, -1).map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) }))
    : []

  const safeApiKey = apiKey.trim().replace(/[^\x20-\x7E]/g, '')

  const body = JSON.stringify({
    temperature: 0.3,
    max_tokens:  1024,
    messages: [
      { role: 'system', content: systemPrompt },
      ...historyMessages,
      { role: 'user',   content: userContent },
    ],
  })

  // モデルを順番に試してレート制限を回避
  let lastError = ''
  for (const model of FREE_MODELS) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: new Headers({
          'content-type':  'application/json',
          'authorization': `Bearer ${safeApiKey}`,
          'http-referer':  'https://farm-management-mauve.vercel.app',
          'x-title':       'Farm Management System',
        }),
        body: JSON.stringify({ ...JSON.parse(body), model }),
      })

      if (response.status === 429) {
        const err = await response.json().catch(() => ({}))
        lastError = err.error?.message || '429'
        console.log(`Model ${model} rate limited, trying next...`)
        continue  // 次のモデルへ
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        lastError = err.error?.message || `${response.status}`
        console.error(`Model ${model} error:`, lastError)
        continue
      }

      const data = await response.json()
      const text = data.choices?.[0]?.message?.content || ''
      console.log(`Success with model: ${model}`)
      return res.status(200).json({ content: { type: 'text', text } })

    } catch (e: any) {
      lastError = e.message
      console.error(`Model ${model} exception:`, e.message)
      continue
    }
  }

  // 全モデル失敗時
  res.status(429).json({ error: `全モデルが一時的に混雑しています。しばらく待ってから再試行してください。(${lastError})` })
})
