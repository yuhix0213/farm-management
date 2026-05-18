// lib/db.ts — MySQL接続プール（全APIで共有・lazy初期化）
import mysql from 'mysql2/promise'

let _pool: mysql.Pool | null = null

function getPool(): mysql.Pool {
  if (!_pool) {
    _pool = mysql.createPool({
      host:               process.env.DB_HOST!,
      port:               Number(process.env.DB_PORT ?? 3306),
      user:               process.env.DB_USER!,
      password:           process.env.DB_PASSWORD!,
      database:           process.env.DB_NAME!,
      charset:            'utf8mb4',
      timezone:           '+09:00',
      connectionLimit:    10,
      waitForConnections: true,
      queueLimit:         0,
    })
  }
  return _pool
}

// pool.getConnection() / pool.execute() 等をそのまま使えるProxy
const pool = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    return (getPool() as any)[prop]
  }
})

export default pool

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const [rows] = await getPool().execute(sql, params)
  return rows as T[]
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] ?? null
}
