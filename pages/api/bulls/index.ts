import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query, insert } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM bulls ORDER BY id')
      return res.status(200).json(rows)
    }
    if (req.method === 'POST') {
      const { name, reg_no, breed, type, owner, bms, note } = req.body
      if (!name?.trim()) return res.status(400).json({ error: '名号は必須です' })
      const id = await insert(
        'INSERT INTO bulls (name, reg_no, breed, type, owner, bms, note) VALUES (?,?,?,?,?,?,?)',
        [name.trim(), reg_no||null, breed||null, type||'精液', owner||null, bms||null, note||null]
      )
      const row = await query('SELECT * FROM bulls WHERE id=?', [id])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
