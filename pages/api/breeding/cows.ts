// pages/api/breeding/cows.ts — 母牛台帳(GET/POST/PUT)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query, insert } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await query(`
        SELECT c.*, b.name AS bull_name, br.name AS barn_name
        FROM   cows c
        LEFT JOIN bulls b ON c.bull_id  = b.id
        LEFT JOIN barns br ON c.barn_id = br.id
        ORDER BY c.id`))
    }
    if (req.method === 'POST') {
      const { ear_tag_no,farm_id,breed,date_of_birth,status,parity,
              bull_id,last_insem_date,expected_birth,barn_id,stall_no,note } = req.body
      const id = await insert(
        `INSERT INTO cows (ear_tag_no,farm_id,breed,date_of_birth,status,parity,
           bull_id,last_insem_date,expected_birth,barn_id,stall_no,note)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [ear_tag_no,farm_id||null,breed||null,date_of_birth||null,
         status||'空胎中',parity||0,bull_id||null,
         last_insem_date||null,expected_birth||null,barn_id||null,stall_no||null,note||null])
      const row = await query('SELECT * FROM cows WHERE id=?', [id])
      return res.status(201).json(row[0])
    }
    if (req.method === 'PUT') {
      const { id,ear_tag_no,farm_id,breed,date_of_birth,status,parity,
              bull_id,last_insem_date,expected_birth,barn_id,stall_no,note } = req.body
      await query(
        `UPDATE cows SET ear_tag_no=?,farm_id=?,breed=?,date_of_birth=?,status=?,parity=?,
           bull_id=?,last_insem_date=?,expected_birth=?,barn_id=?,stall_no=?,note=? WHERE id=?`,
        [ear_tag_no,farm_id||null,breed||null,date_of_birth||null,status,parity,
         bull_id||null,last_insem_date||null,expected_birth||null,barn_id||null,stall_no||null,note||null,id])
      const row = await query('SELECT * FROM cows WHERE id=?', [id])
      return res.status(200).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
