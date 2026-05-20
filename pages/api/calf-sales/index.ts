// pages/api/calf-sales/index.ts — 子牛販売台帳(GET/POST/PUT)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query, insert } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { month } = req.query
      const sql = month
        ? "SELECT * FROM calf_sales WHERE sale_date LIKE ? ORDER BY sale_date DESC"
        : "SELECT * FROM calf_sales ORDER BY created_at DESC"
      return res.status(200).json(await query(sql, month ? [`${month}%`] : []))
    }
    if (req.method === 'POST') {
      const { ear_tag_no, mother_ear_tag, breed, sex,
              date_of_birth, age_days, weight_kg,
              market, sale_date, price, buyer, status } = req.body
      if (!ear_tag_no?.trim()) return res.status(400).json({ error: '子牛耳標番号は必須です' })
      const id = await insert(
        `INSERT INTO calf_sales
           (ear_tag_no, mother_ear_tag, breed, sex, date_of_birth, age_days,
            weight_kg, market, sale_date, price, buyer, status)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [ear_tag_no.trim(), mother_ear_tag||null, breed||null, sex||null,
         date_of_birth||null, age_days||null, weight_kg||null,
         market||null, sale_date||null, price||null, buyer||null, status||'登録済'])
      const row = await query('SELECT * FROM calf_sales WHERE id=?', [id])
      return res.status(201).json(row[0])
    }
    if (req.method === 'PUT') {
      const { id, market, sale_date, price, buyer, status } = req.body
      const ageDays = req.body.date_of_birth
        ? Math.round((new Date(sale_date||Date.now()).getTime() - new Date(req.body.date_of_birth).getTime()) / 86400000)
        : null
      await query(
        `UPDATE calf_sales SET market=?,sale_date=?,price=?,buyer=?,status=?,age_days=COALESCE(?,age_days) WHERE id=?`,
        [market||null, sale_date||null, price||null, buyer||null, status, ageDays, id])
      const row = await query('SELECT * FROM calf_sales WHERE id=?', [id])
      return res.status(200).json(row[0])
    }
    res.status(405).end()
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})
