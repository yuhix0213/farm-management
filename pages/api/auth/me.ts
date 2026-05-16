// pages/api/auth/me.ts — セッション確認API（フロントで認証状態チェックに使用）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth, AuthenticatedRequest } from '@/lib/withAuth'

export default withAuth((req: NextApiRequest, res: NextApiResponse) => {
  const user = (req as AuthenticatedRequest).user
  return res.status(200).json({ username: user.username })
})
