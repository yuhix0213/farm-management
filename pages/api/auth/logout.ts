// pages/api/auth/logout.ts
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  res.setHeader('Set-Cookie', 'farm_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax')
  return res.status(200).json({ ok: true })
}
