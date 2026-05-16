// pages/calf-sales/index.tsx — 子牛販売市場ページ
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function CalfSalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/calf-sales')
      .then(r => r.json())
      .then(data => { setSales(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const total = sales.filter(s => s.status === '完了' && s.price).reduce((a, s) => a + s.price, 0)

  const statusColor: Record<string, string> = { '完了': '#1D9E75', '予定': '#BA7517', '登録済': '#378ADD' }

  return (
    <>
      <Head><title>子牛販売市場 | 牧場管理システム</title></Head>
      <main style={{ padding: 24, fontFamily: 'sans-serif', background: '#F0F4F8', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1D3557' }}>子牛販売市場</h1>
          <button onClick={() => router.push('/')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #C8D0DC', background: '#fff', cursor: 'pointer', fontSize: 13 }}>← 戻る</button>
        </div>

        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            ['登録頭数', sales.length + '頭'],
            ['落札済', sales.filter(s => s.status === '完了').length + '頭'],
            ['累計売上', '¥' + total.toLocaleString()],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #D0D7E0', padding: '14px 18px' }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#1D3557' }}>{value}</div>
            </div>
          ))}
        </div>

        {loading && <div style={{ color: '#888', fontSize: 14 }}>読み込み中...</div>}

        {!loading && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
            {sales.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>販売記録がありません</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#F4F6F8' }}>
                  {['子牛耳標','母牛耳標','品種','性別','日齢','体重','上場市場','上場日','落札額','落札者','状態'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sales.map((s, i) => (
                    <tr key={s.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{s.ear_tag_no}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.mother_ear_tag || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.breed || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.sex || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.age_days ? s.age_days + '日' : '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.weight_kg ? s.weight_kg + 'kg' : '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.market || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.sale_date || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.price ? '¥' + s.price.toLocaleString() : '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{s.buyer || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: (statusColor[s.status] || '#888') + '22', color: statusColor[s.status] || '#888', fontWeight: 500 }}>{s.status}</span>
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
