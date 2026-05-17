// pages/api/ai/diagnosis.ts — AI健康診断（Google Gemini API使用・無料枠）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY が設定されていません。Vercelの環境変数を確認してください。' })
  }

  const { cattleData, weatherData, messages } = req.body

  const systemPrompt =
    `あなたは日本の畜産専門の獣医師AIアシスタントです。` +
    `個体データと気象情報を総合的に分析し、JSONのみで返してください（コードブロック・前後文章不要）。` +
    `気象条件が牛の健康に与えるリスクを必ず診断に反映してください。` +
    `必ず以下のフォーマットのJSONのみを返してください：` +
    `{"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"2文以内の総評","actions":["アクション1","アクション2","アクション3"],"detail":"詳細説明2〜3文","weatherImpact":"気象が健康に与える影響の一言コメント"}`

  // メッセージ履歴をGemini形式に変換
  const userContent = messages && messages.length > 0
    ? messages[messages.length - 1].content
    : `以下のデータを総合診断してください。\n個体: ${JSON.stringify(cattleData)}\n気象: ${JSON.stringify(weatherData)}`

  // 過去の会話履歴をGemini形式に変換（チャット継続の場合）
  const history = messages && messages.length > 1
    ? messages.slice(0, -1).map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))
    : []

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            ...history,
            {
              role: 'user',
              parts: [{ text: userContent }],
            },
          ],
          generationConfig: {
            temperature:     0.3,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.json()
      console.error('Gemini API error:', err)
      return res.status(response.status).json({
        error: err.error?.message || 'Gemini APIエラーが発生しました',
      })
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Anthropic形式に合わせてレスポンスを返す（フロントエンドの互換性維持）
    res.status(200).json({
      content: { type: 'text', text },
    })

  } catch (e: any) {
    console.error('diagnosis error:', e)
    res.status(500).json({ error: e.message })
  }
})
