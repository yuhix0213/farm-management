import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM barns ORDER BY id')
      return res.status(200).json(rows)
    }
    if (req.method === 'POST') {
      const { name, type, capacity, note } = req.body
      if (!name?.trim()) return res.status(400).json({ error: '牛舎名は必須です' })
      const [r]: any = await query(
        'INSERT INTO barns (name, type, capacity, note) VALUES (?,?,?,?)',
        [name.trim(), type||null, capacity||null, note||null]
      )
      const row = await query('SELECT * FROM barns WHERE id=?', [r.insertId])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
