import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  const id = Number(req.query.id)
  try {
    if (req.method === 'PUT') {
      const { name, role, phone, email } = req.body
      if (!name?.trim()) return res.status(400).json({ error: '氏名は必須です' })
      await query(
        'UPDATE staff SET name=?, role=?, phone=?, email=? WHERE id=?',
        [name.trim(), role||null, phone||null, email||null, id]
      )
      const row = await query('SELECT * FROM staff WHERE id=?', [id])
      return res.status(200).json(row[0])
    }
    if (req.method === 'DELETE') {
      await query('DELETE FROM staff WHERE id=?', [id])
      return res.status(204).end()
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
