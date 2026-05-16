// pages/api/breeding/bulls.ts — 種牛台帳(GET/POST/PUT)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query('SELECT * FROM bulls ORDER BY id'))
    }
    if (req.method === 'POST') {
      const { name,reg_no,breed,type,owner,bms,note } = req.body
      const [r]: any = await query(
        'INSERT INTO bulls (name,reg_no,breed,type,owner,bms,note) VALUES (?,?,?,?,?,?,?)',
        [name,reg_no||null,breed||null,type||'精液',owner||null,bms||null,note||null])
      const row = await query('SELECT * FROM bulls WHERE id=?', [r.insertId])
      return res.status(201).json(row[0])
    }
    if (req.method === 'PUT') {
      const { id,name,reg_no,breed,type,owner,bms,note } = req.body
      await query(
        'UPDATE bulls SET name=?,reg_no=?,breed=?,type=?,owner=?,bms=?,note=? WHERE id=?',
        [name,reg_no||null,breed||null,type||'精液',owner||null,bms||null,note||null,id])
      const row = await query('SELECT * FROM bulls WHERE id=?', [id])
      return res.status(200).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
