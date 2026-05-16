// pages/api/auth/login.ts — ログインAPI・セッショントークン発行
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import crypto from 'crypto'

const SESSION_COOKIE = 'farm_session'
const MAX_AGE        = 60 * 60 * 8   // 8時間

export function createSessionToken(username: string): string {
  const payload    = JSON.stringify({ username, exp: Date.now() + MAX_AGE * 1000 })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const sig        = crypto.createHmac('sha256', process.env.SESSION_SECRET!)
    .update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token?: string): string | null {
  if (!token) return null
  try {
    const [payloadB64, sig] = token.split('.')
    const expected = crypto.createHmac('sha256', process.env.SESSION_SECRET!)
      .update(payloadB64).digest('base64url')
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    if (Date.now() > payload.exp) return null
    return payload.username
  } catch { return null }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const { username, password } = req.body
  const validUser = process.env.ADMIN_USERNAME
  const validPass = process.env.ADMIN_PASSWORD
  if (!validUser || !validPass)
    return res.status(500).json({ message: 'サーバー設定エラー' })

  const userBuf = Buffer.from(username ?? ''), validBuf = Buffer.from(validUser)
  const passBuf = Buffer.from(password ?? ''), vpBuf   = Buffer.from(validPass)
  const lenOk   = userBuf.length === validBuf.length && passBuf.length === vpBuf.length
  const userOk  = lenOk && crypto.timingSafeEqual(userBuf, validBuf)
  const passOk  = lenOk && crypto.timingSafeEqual(passBuf, vpBuf)

  if (!userOk || !passOk) {
    await new Promise(r => setTimeout(r, 300))
    return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' })
  }

  res.setHeader('Set-Cookie', serialize(SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path:     '/',
    maxAge:   MAX_AGE,
  }))
  return res.status(200).json({ ok: true })
}
