// pages/api/masters.ts — マスタデータ一括取得(牛舎・スタッフ・種牛)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    const [barns, staff, bulls] = await Promise.all([
      query('SELECT * FROM barns ORDER BY id'),
      query('SELECT * FROM staff ORDER BY id'),
      query('SELECT * FROM bulls ORDER BY id'),
    ])
    res.status(200).json({ barns, staff, bulls })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
