// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import crypto from 'crypto'

const COOKIE = 'farm_session'
const MAX_AGE = 60 * 60 * 8

export function createSessionToken(u: string): string {
  const secret = process.env.SESSION_SECRET || 'default-secret'
  const data   = JSON.stringify({ u, e: Date.now() + MAX_AGE * 1000 })
  const b64    = Buffer.from(data).toString('base64')
  const sig    = crypto.createHmac('sha256', secret).update(b64).digest('hex')
  return b64 + '.' + sig
}

export function verifySessionToken(token?: string): string | null {
  if (!token) return null
  try {
    const secret = process.env.SESSION_SECRET || 'default-secret'
    const dot    = token.lastIndexOf('.')
    if (dot < 0) return null
    const b64    = token.slice(0, dot)
    const sig    = token.slice(dot + 1)
    const check  = crypto.createHmac('sha256', secret).update(b64).digest('hex')
    if (sig !== check) return null
    const obj    = JSON.parse(Buffer.from(b64, 'base64').toString())
    if (Date.now() > obj.e) return null
    return obj.u
  } catch { return null }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const body     = req.body ?? {}
    const username = String(body.username ?? '')
    const password = String(body.password ?? '')

    const validUser = String(process.env.ADMIN_USERNAME ?? '')
    const validPass = String(process.env.ADMIN_PASSWORD ?? '')

    if (!validUser || !validPass) {
      return res.status(500).json({ message: 'サーバー設定エラー: 認証情報が未設定です' })
    }

    if (username !== validUser || password !== validPass) {
      return res.status(401).json({ message: 'ユーザー名またはパスワードが正しくありません' })
    }

    const token  = createSessionToken(username)
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; Path=/; Max-Age=${MAX_AGE}; SameSite=Lax${secure}`)
    return res.status(200).json({ ok: true })

  } catch (err: any) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'ログインエラー: ' + err.message })
  }
}
