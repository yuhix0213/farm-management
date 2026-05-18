// pages/api/ai/diagnosis.ts — AI健康診断（OpenRouter）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'

export default withAuth(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY が設定されていません。' })
  }

  const { cattleData, weatherData, messages, mode } = req.body
  // mode: "diagnosis"（初回診断・JSON返却）| "chat"（追加相談・自然文返却）

  const safeApiKey = apiKey.trim().replace(/[^\x20-\x7E]/g, '')

  const isChatMode = mode === 'chat' || (messages && messages.length > 1)

  // ── 共通：日本語強制指示 ────────────────────────────────────────
  const JAPANESE_RULE =
    '重要: 必ず日本語のみで回答してください。英語・中国語など他言語は絶対に使用しないでください。' +
    'IMPORTANT: Respond ONLY in Japanese. Do NOT use English or any other language under any circumstances.'

  // ── 初回診断モード：JSON形式で返す ──────────────────────────────
  const diagnosisSystem =
    JAPANESE_RULE + '\n' +
    'あなたは日本の畜産専門の獣医師AIアシスタントです。' +
    '個体データと気象情報を分析し、以下のJSON形式のみで回答してください。' +
    'コードブロック・マークダウン・余分なテキストは一切含めないでください。' +
    'JSON形式: {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"2文以内の総評（日本語）","actions":["具体的な対応1","具体的な対応2","具体的な対応3"],"detail":"詳細説明2〜3文（日本語）","weatherImpact":"気象が健康に与える影響（日本語1文）"}'

  // ── チャットモード：自然な日本語で返す ─────────────────────────
  const weatherInfo = weatherData
    ? `【気象情報】気温${weatherData.current?.temp}℃、湿度${weatherData.current?.humidity}%、風速${weatherData.current?.wind}km/h`
    : ''
  const cattleInfo = cattleData
    ? `【個体情報】${cattleData.farm_id || cattleData.farmId}、品種:${cattleData.breed}、ステータス:${cattleData.status}、備考:${cattleData.note || 'なし'}`
    : ''

  const chatSystem =
    JAPANESE_RULE + '\n' +
    'あなたは日本の畜産専門の獣医師AIアシスタントです。' +
    '以下の個体・気象情報を踏まえて、獣医師として丁寧に日本語のみで回答してください。' +
    '回答は200文字以内の自然な日本語にしてください。JSONは使わないでください。\n' +
    `${cattleInfo}\n${weatherInfo}`

  const systemPrompt = isChatMode ? chatSystem : diagnosisSystem

  const diagnosisContent =
    '以下のデータを日本語で総合診断してください。\n' +
    `個体データ: ${JSON.stringify(cattleData)}\n` +
    `気象データ: ${JSON.stringify(weatherData)}`

  // メッセージ構築
  let chatMessages: any[]
  if (isChatMode && messages?.length > 0) {
    chatMessages = messages.map((m: any) => ({
      role:    m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content),
    }))
  } else {
    chatMessages = [{ role: 'user', content: diagnosisContent }]
  }

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
        model:       'openrouter/free',
        temperature: isChatMode ? 0.5 : 0.2,
        max_tokens:  isChatMode ? 512 : 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatMessages,
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
    const text = (data.choices?.[0]?.message?.content || '').trim()

    res.status(200).json({ content: { type: 'text', text } })

  } catch (e: any) {
    console.error('diagnosis error:', e)
    res.status(500).json({ error: String(e.message) })
  }
})
