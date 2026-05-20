import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  const id = Number(req.query.id)
  try {
    if (req.method === 'PUT') {
      const { name, reg_no, breed, type, owner, bms, note } = req.body
      if (!name?.trim()) return res.status(400).json({ error: '名号は必須です' })
      await query(
        'UPDATE bulls SET name=?, reg_no=?, breed=?, type=?, owner=?, bms=?, note=? WHERE id=?',
        [name.trim(), reg_no||null, breed||null, type||'精液', owner||null, bms||null, note||null, id]
      )
      const row = await query('SELECT * FROM bulls WHERE id=?', [id])
      return res.status(200).json(row[0])
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM bulls WHERE id=?', [id])
      return res.status(204).end()
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
