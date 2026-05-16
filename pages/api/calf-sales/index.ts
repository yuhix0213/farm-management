// pages/api/calf-sales/index.ts — 子牛販売台帳(GET/PUT)
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import { query } from '@/lib/db'

export default withAuth(async (req, res) => {
  try {
    if (req.method === 'GET') {
      const { month } = req.query
      const sql = month
        ? "SELECT * FROM calf_sales WHERE sale_date LIKE ? ORDER BY sale_date DESC"
        : "SELECT * FROM calf_sales ORDER BY created_at DESC"
      const rows = await query(sql, month ? [`${month}%`] : [])
      return res.status(200).json(rows)
    }
    if (req.method === 'PUT') {
      // 落札情報の更新（市場・日付・落札額・落札者・ステータス）
      const { id, market, sale_date, price, buyer, status } = req.body
      // 日齢を再計算
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
