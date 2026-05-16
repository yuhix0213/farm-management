// pages/api/cattle/index.ts — 個体一覧(GET) / 登録(POST)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await query(`
        SELECT c.*, b.name AS barn_name, s.name AS staff_name
        FROM   cattle c
        LEFT JOIN barns b ON c.barn_id  = b.id
        LEFT JOIN staff s ON c.staff_id = s.id
        ORDER BY c.created_at DESC`)
      return res.status(200).json(rows)
    }
    if (req.method === 'POST') {
      const { ear_tag_no,farm_id,breed,sex,cattle_type,date_of_birth,
              intro_date,intro_weight_kg,intro_price,origin,
              barn_id,stall_no,status,staff_id,note } = req.body
      const [r]: any = await query(
        `INSERT INTO cattle (ear_tag_no,farm_id,breed,sex,cattle_type,date_of_birth,
           intro_date,intro_weight_kg,intro_price,origin,barn_id,stall_no,status,staff_id,note)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [ear_tag_no,farm_id||null,breed,sex,cattle_type,date_of_birth,
         intro_date||null,intro_weight_kg||null,intro_price||null,origin||null,
         barn_id||null,stall_no||null,status||'育成中',staff_id||null,note||null])
      const row = await query('SELECT * FROM cattle WHERE id=?', [r.insertId])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
