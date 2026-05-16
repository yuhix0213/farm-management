// pages/cattle/index.tsx — 個体一覧ページ
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function CattlePage() {
  const router = useRouter()
  const [cattle, setCattle] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/cattle')
      .then(r => r.json())
      .then(data => { setCattle(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError('データの取得に失敗しました'); setLoading(false) })
  }, [])

  const statusColor: Record<string, string> = {
    '肥育中': '#1D9E75', '育成中': '#378ADD', '繁殖中': '#BA7517',
    '泌乳中': '#639922', '出荷予定': '#534AB7', '出荷済': '#888', '死廃': '#E24B4A',
  }

  return (
    <>
      <Head><title>個体一覧 | 牧場管理システム</title></Head>
      <main style={{ padding: 24, fontFamily: 'sans-serif', background: '#F0F4F8', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1D3557' }}>個体一覧</h1>
          <button onClick={() => router.push('/')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #C8D0DC', background: '#fff', cursor: 'pointer', fontSize: 13 }}>← 戻る</button>
        </div>

        {loading && <div style={{ color: '#888', fontSize: 14 }}>読み込み中...</div>}
        {error   && <div style={{ color: '#E24B4A', fontSize: 14 }}>{error}</div>}

        {!loading && !error && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
            {cattle.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 14 }}>
                個体が登録されていません
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F4F6F8' }}>
                    {['管理番号', '耳標番号', '品種', '性別', '用途', '牛舎', 'ステータス'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cattle.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{c.farm_id || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.ear_tag_no}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.breed}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.sex}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.cattle_type}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.barn_name || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: (statusColor[c.status] || '#888') + '22', color: statusColor[c.status] || '#888', fontWeight: 500 }}>
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </>
  )
}
