// lib/withAuth.ts — API Routes 認証ガードラッパー
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { parse } from 'cookie'
import { verifySessionToken } from '@/pages/api/auth/login'

export interface AuthenticatedRequest extends NextApiRequest {
  user: { username: string }
}

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookies  = parse(req.headers.cookie ?? '')
    const token    = cookies['farm_session']
    const username = verifySessionToken(token)
    if (!username) {
      return res.status(401).json({ message: 'ログインが必要です' })
    }
    ;(req as AuthenticatedRequest).user = { username }
    return handler(req, res)
  }
}
