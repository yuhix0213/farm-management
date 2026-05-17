// pages/api/ai/diagnosis.ts — AI健康診断（OpenRouter / 無料モデル使用）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY が設定されていません。' })
  }

  const { cattleData, weatherData, messages } = req.body

  const systemPrompt =
    `あなたは日本の畜産専門の獣医師AIアシスタントです。` +
    `個体データと気象情報を総合的に分析し、JSONのみで返してください（コードブロック・前後文章不要）。` +
    `気象条件が牛の健康に与えるリスクを必ず診断に反映してください。` +
    `必ず以下のフォーマットのJSONのみを返してください：` +
    `{"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"2文以内の総評","actions":["アクション1","アクション2","アクション3"],"detail":"詳細説明2〜3文","weatherImpact":"気象が健康に与える影響の一言コメント"}`

  const userContent = messages && messages.length > 0
    ? messages[messages.length - 1].content
    : `以下のデータを総合診断してください。\n個体: ${JSON.stringify(cattleData)}\n気象: ${JSON.stringify(weatherData)}`

  const historyMessages = messages && messages.length > 1
    ? messages.slice(0, -1).map((m: any) => ({
        role:    m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))
    : []

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer':  'https://farm-management-mauve.vercel.app',
        'X-Title':       '牧場管理システム',
      },
      body: JSON.stringify({
        model:       'meta-llama/llama-3.3-70b-instruct:free',  // 無料モデル
        temperature: 0.3,
        max_tokens:  1024,
        messages: [
          { role: 'system',  content: systemPrompt },
          ...historyMessages,
          { role: 'user',    content: userContent },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      console.error('OpenRouter error:', err)
      return res.status(response.status).json({
        error: err.error?.message || 'OpenRouter APIエラーが発生しました',
      })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content || ''

    res.status(200).json({ content: { type: 'text', text } })

  } catch (e: any) {
    console.error('diagnosis error:', e)
    res.status(500).json({ error: e.message })
  }
})
