// lib/withAuth.ts
import type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { verifySessionToken } from '@/pages/api/auth/login'

export interface AuthenticatedRequest extends NextApiRequest {
  user: { username: string }
}

export function withAuth(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const cookieHeader = req.headers.cookie ?? ''
    const match = cookieHeader.match(/(?:^|;\s*)farm_session=([^;]+)/)
    const token = match ? match[1] : undefined
    const username = verifySessionToken(token)
    if (!username) {
      return res.status(401).json({ message: 'ログインが必要です' })
    }
    ;(req as AuthenticatedRequest).user = { username }
    return handler(req, res)
  }
}
