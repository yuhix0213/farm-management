import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query, insert } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const rows = await query('SELECT * FROM staff ORDER BY id')
      return res.status(200).json(rows)
    }
    if (req.method === 'POST') {
      const { name, role, phone, email } = req.body
      if (!name?.trim()) return res.status(400).json({ error: '氏名は必須です' })
      const id = await insert(
        'INSERT INTO staff (name, role, phone, email) VALUES (?,?,?,?)',
        [name.trim(), role||null, phone||null, email||null]
      )
      const row = await query('SELECT * FROM staff WHERE id=?', [id])
      return res.status(201).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
