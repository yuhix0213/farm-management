// pages/api/auth/logout.ts — ログアウトAPI（Cookieを無効化）
import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  res.setHeader('Set-Cookie', serialize('farm_session', '', {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', path: '/', maxAge: 0, expires: new Date(0),
  }))
  return res.status(200).json({ ok: true })
}
