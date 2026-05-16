// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

const SESSION_COOKIE = 'farm_session'
const MAX_AGE        = 60 * 60 * 8  // 8時間

export function createSessionToken(username: string): string {
  const secret     = process.env.SESSION_SECRET || 'fallback-secret-key-change-me'
  const payload    = JSON.stringify({ username, exp: Date.now() + MAX_AGE * 1000 })
  const payloadB64 = Buffer.from(payload).toString('base64url')
  const sig        = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token?: string): string | null {
  if (!token) return null
  try {
    const secret = process.env.SESSION_SECRET || 'fallback-secret-key-change-me'
    const [payloadB64, sig] = token.split('.')
    if (!payloadB64 || !sig) return null
    const expected = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
    if (sig !== expected) return null
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString())
    if (Date.now() > payload.exp) return null
    return payload.username
  } catch {
    return null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { username, password } = req.body ?? {}

  const validUser = process.env.ADMIN_USERNAME
  const validPass = process.env.ADMIN_PASSWORD

  if (!validUser || !validPass) {
    console.error('ADMIN_USERNAME or ADMIN_PASSWORD is not set')
    return res.status(500).json({ message: 'サーバー設定エラー: 認証情報が未設定です' })
  }

  const userOk = String(username ?? '') === String(validUser)
  const passOk = String(password ?? '') === String(validPass)

  if (!userOk || !passOk) {
    await new Promise(r => setTimeout(r, 300))
    return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' })
  }

  const token   = createSessionToken(String(username))
  const cookie  = `${SESSION_COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
  res.setHeader('Set-Cookie', cookie)

  return res.status(200).json({ ok: true })
}
