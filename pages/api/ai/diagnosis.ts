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

  // ── 初回診断モード：JSON形式で返す ──────────────────────────────
  const diagnosisSystem =
    'You are a Japanese livestock veterinarian AI assistant. ' +
    'Analyze the cattle data and weather information carefully. ' +
    'Return ONLY a valid JSON object with NO code blocks, NO markdown, NO extra text. ' +
    'Format: {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"2文以内の総評（日本語）","actions":["具体的な対応1","具体的な対応2","具体的な対応3"],"detail":"詳細説明2〜3文（日本語）","weatherImpact":"気象が健康に与える影響（日本語1文）"}'

  // ── チャットモード：自然な日本語で返す ─────────────────────────
  const weatherInfo = weatherData
    ? `【気象情報】気温${weatherData.current?.temp}℃、湿度${weatherData.current?.humidity}%、風速${weatherData.current?.wind}km/h`
    : ''
  const cattleInfo = cattleData
    ? `【個体情報】${cattleData.farm_id || cattleData.farmId}、品種:${cattleData.breed}、ステータス:${cattleData.status}、備考:${cattleData.note || 'なし'}`
    : ''

  const chatSystem =
    `あなたは日本の畜産専門の獣医師AIアシスタントです。` +
    `以下の個体・気象情報を踏まえて、獣医師として丁寧に日本語で回答してください。` +
    `回答は200文字以内の自然な日本語にしてください。JSONは使わないでください。\n` +
    `${cattleInfo}\n${weatherInfo}`

  const systemPrompt = isChatMode ? chatSystem : diagnosisSystem

  const diagnosisContent =
    `以下のデータを総合診断してください。\n` +
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

  // 試行するモデルのリスト（上から順に試みる）
  const MODELS = [
    'meta-llama/llama-3.1-8b-instruct:free',
    'google/gemma-3-4b-it:free',
    'mistralai/mistral-7b-instruct:free',
  ]

  let lastError = ''

  for (const model of MODELS) {
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
          model,
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
        lastError = err.error?.message || `APIエラー: ${response.status}`
        console.error(`OpenRouter [${model}] error:`, lastError)
        continue // 次のモデルを試す
      }

      const data = await response.json()
      const text = (data.choices?.[0]?.message?.content || '').trim()

      if (!text) {
        lastError = 'レスポンスが空でした'
        continue
      }

      console.log(`OpenRouter success with model: ${model}`)
      return res.status(200).json({ content: { type: 'text', text } })

    } catch (e: any) {
      lastError = String(e.message)
      console.error(`OpenRouter [${model}] exception:`, lastError)
      continue
    }
  }

  // 全モデル失敗
  console.error('All models failed. Last error:', lastError)
  return res.status(500).json({ error: `診断に失敗しました: ${lastError}` })
})
