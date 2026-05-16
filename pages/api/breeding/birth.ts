// pages/api/breeding/birth.ts — 分娩登録 → 子牛販売台帳に自動追加（トランザクション）
import type { NextApiRequest, NextApiResponse } from 'next'
import { withAuth } from '@/lib/withAuth'
import pool from '@/lib/db'

export default withAuth(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end()
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const { cowId,bullId,insemDate,birthDate,calfEarTag,
            calfSex,calfWeightKg,dystocia,staffId,note,breed } = req.body

    // 1. 分娩記録を登録
    const [r1]: any = await conn.execute(
      `INSERT INTO birth_records
         (cow_id,bull_id,insem_date,birth_date,calf_ear_tag,calf_sex,calf_weight_kg,dystocia,staff_id,note)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [cowId,bullId||null,insemDate||null,birthDate,calfEarTag,
       calfSex||null,calfWeightKg||null,dystocia?1:0,staffId||null,note||null])
    const birthRecordId = r1.insertId

    // 2. 母牛の産次を取得して+1・ステータスを「授精待ち」に更新
    const [cowRows]: any = await conn.execute(
      'SELECT parity, ear_tag_no FROM cows WHERE id=?', [cowId])
    const cow = cowRows[0]
    await conn.execute(
      `UPDATE cows SET status='授精待ち',parity=?,bull_id=NULL,
         last_insem_date=NULL,expected_birth=NULL WHERE id=?`,
      [(cow?.parity ?? 0) + 1, cowId])

    // 3. 子牛を販売台帳に自動登録
    const ageDays = Math.round((Date.now() - new Date(birthDate).getTime()) / 86400000)
    await conn.execute(
      `INSERT INTO calf_sales
         (ear_tag_no,mother_ear_tag,birth_record_id,breed,sex,date_of_birth,age_days,weight_kg,status)
       VALUES (?,?,?,?,?,?,?,?,'登録済')`,
      [calfEarTag,cow?.ear_tag_no||null,birthRecordId,
       breed||null,calfSex||null,birthDate,ageDays,calfWeightKg||null])

    await conn.commit()
    res.status(201).json({ birthRecordId, message: '分娩登録・子牛台帳追加が完了しました' })
  } catch (e: any) {
    await conn.rollback()
    res.status(500).json({ error: e.message })
  } finally { conn.release() }
})
