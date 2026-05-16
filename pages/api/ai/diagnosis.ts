// pages/api/ai/diagnosis.ts — AI健康診断（Anthropic API・サーバーサイド）
import type { NextApiRequest, NextApiResponse } from 'next'
import Anthropic from '@anthropic-ai/sdk'
import { withAuth } from '@/lib/withAuth'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default withAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const { cattleData, weatherData, messages } = req.body
  try {
    const system =
      `あなたは日本の畜産専門の獣医師AIアシスタントです。` +
      `個体データと気象情報を総合的に分析し、JSONのみで返してください（コードブロック・前後文章不要）。` +
      `気象条件が牛の健康に与えるリスクを必ず診断に反映してください。` +
      `フォーマット: {"risk":"low|mid|high","riskLabel":"低リスク|要観察|要対応","summary":"2文以内","actions":["...","...","..."],"detail":"詳細2〜3文","weatherImpact":"気象影響コメント"}`

    const response = await client.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system,
      messages: messages ?? [{
        role: 'user',
        content: `以下のデータを総合診断してください。\n個体: ${JSON.stringify(cattleData)}\n気象: ${JSON.stringify(weatherData)}`,
      }],
    })
    res.status(200).json({ content: response.content[0] })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
