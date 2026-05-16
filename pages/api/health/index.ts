// pages/api/health/index.ts — 健康記録(GET/POST)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  const cattle_id = req.query.cattle_id ? Number(req.query.cattle_id) : null
  try {
    if (req.method === 'GET') {
      const sql = cattle_id
        ? 'SELECT * FROM health_records WHERE cattle_id=? ORDER BY record_date DESC'
        : 'SELECT * FROM health_records ORDER BY record_date DESC LIMIT 100'
      return res.status(200).json(await query(sql, cattle_id ? [cattle_id] : []))
    }
    if (req.method === 'POST') {
      const { cattle_id: cid, record_date, record_type, temperature,
              diagnosis, treatment, medicine, cost, vet_name, next_checkup } = req.body
      const [r]: any = await query(
        `INSERT INTO health_records
           (cattle_id,record_date,record_type,temperature,diagnosis,treatment,medicine,cost,vet_name,next_checkup)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [cid,record_date,record_type,temperature||null,diagnosis||null,
         treatment||null,medicine||null,cost||null,vet_name||null,next_checkup||null])
      const row = await query('SELECT * FROM health_records WHERE id=?', [r.insertId])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
