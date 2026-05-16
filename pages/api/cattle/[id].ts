// pages/api/cattle/[id].ts — 個体詳細(GET) / 更新(PUT) / 削除(DELETE)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query, queryOne } from '@/lib/db'

export default withAuth(async (req, res) => {
  const id = Number(req.query.id)
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
    if (req.method === 'GET') {
      const row = await queryOne('SELECT * FROM cattle WHERE id=?', [id])
      if (!row) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json(row)
    }
    if (req.method === 'PUT') {
      const { ear_tag_no,farm_id,breed,sex,cattle_type,date_of_birth,
              intro_date,intro_weight_kg,intro_price,origin,
              barn_id,stall_no,status,staff_id,note } = req.body
      await query(
        `UPDATE cattle SET ear_tag_no=?,farm_id=?,breed=?,sex=?,cattle_type=?,
           date_of_birth=?,intro_date=?,intro_weight_kg=?,intro_price=?,origin=?,
           barn_id=?,stall_no=?,status=?,staff_id=?,note=? WHERE id=?`,
        [ear_tag_no,farm_id||null,breed,sex,cattle_type,date_of_birth,
         intro_date||null,intro_weight_kg||null,intro_price||null,origin||null,
         barn_id||null,stall_no||null,status,staff_id||null,note||null,id])
      const row = await queryOne('SELECT * FROM cattle WHERE id=?', [id])
      return res.status(200).json(row)
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM cattle WHERE id=?', [id])
      return res.status(204).end()
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
