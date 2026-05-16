// pages/api/weight/index.ts — 体重記録(GET/POST)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  const cattle_id = req.query.cattle_id ? Number(req.query.cattle_id) : null
  try {
    if (req.method === 'GET') {
      const sql = cattle_id
        ? 'SELECT * FROM weight_records WHERE cattle_id=? ORDER BY measured_at DESC'
        : 'SELECT * FROM weight_records ORDER BY measured_at DESC LIMIT 100'
      const rows = await query(sql, cattle_id ? [cattle_id] : [])
      return res.status(200).json(rows)
    }
    if (req.method === 'POST') {
      const { cattle_id: cid, measured_at, weight_kg, adg_kg, bcs, staff_id, note } = req.body
      const [r]: any = await query(
        `INSERT INTO weight_records (cattle_id,measured_at,weight_kg,adg_kg,bcs,staff_id,note)
         VALUES (?,?,?,?,?,?,?)`,
        [cid, measured_at, weight_kg, adg_kg||null, bcs||null, staff_id||null, note||null])
      const row = await query('SELECT * FROM weight_records WHERE id=?', [r.insertId])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
