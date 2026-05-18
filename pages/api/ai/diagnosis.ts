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

  const safeApiKey = apiKey.trim().replace(/[^\x20-\x7E]/g, '')
  const isChatMode = mode === 'chat' || (messages && messages.length > 1)

  // ── 個体・気象情報を文字列化（両モードで共通使用）────────────────
  const cattleInfo = cattleData
    ? `対象個体: 耳標${cattleData.ear_tag_no || cattleData.earTagNo}、管理番号${cattleData.farm_id || cattleData.farmId}、品種:${cattleData.breed}、性別:${cattleData.sex}、ステータス:${cattleData.status}、備考:${cattleData.note || 'なし'}`
    : ''
  const weatherInfo = weatherData
    ? `気象: 気温${weatherData.current?.temp}℃、湿度${weatherData.current?.humidity}%、風速${weatherData.current?.wind}km/h`
    : ''

  // ── 共通ルール ──────────────────────────────────────────────────
  const BASE_RULE =
    '必ず日本語のみで回答してください。英語・その他言語は使用禁止。' +
    'RESPOND IN JAPANESE ONLY. ' +
    'あなたは日本の牧場専門の獣医師AIです。牛・畜産に関する質問のみ回答してください。' +
    '農業一般・作物・野菜・果物・穀物などの話題は対象外です。牛に無関係な質問には「畜産・牛に関するご質問にお答えしています」と日本語で断ってください。'

  // ── 初回診断モード ───────────────────────────────────────────────
  const diagnosisSystem =
    BASE_RULE + '\n' +
    '以下の個体データと気象情報を分析し、JSONのみで回答してください。コードブロック・マークダウン不要。\n' +
    `${cattleInfo}\n${weatherInfo}\n` +
    'JSON形式: {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"この個体の現状総評2文","actions":["この個体への具体的対応1","対応2","対応3"],"detail":"詳細説明2〜3文","weatherImpact":"現在の気象がこの個体に与える影響1文"}'

  // ── チャットモード ───────────────────────────────────────────────
  const chatSystem =
    BASE_RULE + '\n' +
    '以下の個体情報を前提に、獣医師として簡潔に日本語で回答してください。200文字以内。マークダウン記法（**や##）は使わないでください。\n' +
    `${cattleInfo}\n${weatherInfo}`

  const systemPrompt = isChatMode ? chatSystem : diagnosisSystem

  const diagnosisContent =
    `次の牛の個体データと気象情報を日本語で総合診断してください。\n${cattleInfo}\n${weatherInfo}`

  // ── メッセージ構築 ───────────────────────────────────────────────
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
        temperature: isChatMode ? 0.4 : 0.2,
        max_tokens:  isChatMode ? 400 : 1024,
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
