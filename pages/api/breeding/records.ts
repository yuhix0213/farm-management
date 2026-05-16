// pages/api/breeding/records.ts — 分娩記録一覧(GET)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end()
  try {
    return res.status(200).json(await query(`
      SELECT br.*,
             c.ear_tag_no AS cow_ear_tag, c.farm_id AS cow_farm_id,
             b.name       AS bull_name,
             s.name       AS staff_name
      FROM   birth_records br
      LEFT JOIN cows  c ON br.cow_id  = c.id
      LEFT JOIN bulls b ON br.bull_id = b.id
      LEFT JOIN staff s ON br.staff_id= s.id
      ORDER BY br.birth_date DESC`))
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
