// pages/breeding/index.tsx — 繁殖・分娩管理ページ
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function BreedingPage() {
  const router = useRouter()
  const [cows, setCows] = useState<any[]>([])
  const [bulls, setBulls] = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'cows'|'bulls'|'records'>('cows')

  useEffect(() => {
    Promise.all([
      fetch('/api/breeding/cows').then(r => r.json()),
      fetch('/api/breeding/bulls').then(r => r.json()),
      fetch('/api/breeding/records').then(r => r.json()),
    ]).then(([c, b, rec]) => {
      setCows(Array.isArray(c) ? c : [])
      setBulls(Array.isArray(b) ? b : [])
      setRecords(Array.isArray(rec) ? rec : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    '妊娠中': '#1D9E75', '授精待ち': '#BA7517', '空胎中': '#E24B4A', '分娩後': '#378ADD',
  }

  const tabs = [['cows','母牛台帳'],['bulls','種牛台帳'],['records','分娩記録']] as const

  return (
    <>
      <Head><title>繁殖・分娩管理 | 牧場管理システム</title></Head>
      <main style={{ padding: 24, fontFamily: 'sans-serif', background: '#F0F4F8', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: '#1D3557' }}>繁殖・分娩管理</h1>
          <button onClick={() => router.push('/')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #C8D0DC', background: '#fff', cursor: 'pointer', fontSize: 13 }}>← 戻る</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #D0D7E0', marginBottom: 16 }}>
          {tabs.map(([key, label]) => (
            <div key={key} onClick={() => setTab(key)} style={{ padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: tab === key ? 600 : 400, color: tab === key ? '#1D9E75' : '#666', borderBottom: tab === key ? '2px solid #1D9E75' : '2px solid transparent', marginBottom: -1 }}>
              {label}
            </div>
          ))}
        </div>

        {loading && <div style={{ color: '#888', fontSize: 14 }}>読み込み中...</div>}

        {!loading && tab === 'cows' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
            {cows.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>母牛が登録されていません</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#F4F6F8' }}>
                  {['管理番号','品種','産次','ステータス','授精日','分娩予定日','種牛'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {cows.map((c, i) => (
                    <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{c.farm_id || c.ear_tag_no}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.breed || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.parity}産</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>
                        <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: (statusColor[c.status] || '#888') + '22', color: statusColor[c.status] || '#888', fontWeight: 500 }}>{c.status}</span>
                      </td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.last_insem_date || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.expected_birth || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.bull_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && tab === 'bulls' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
            {bulls.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>種牛が登録されていません</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#F4F6F8' }}>
                  {['名号','登録番号','品種','種別','所有者','BMS'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {bulls.map((b, i) => (
                    <tr key={b.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{b.name}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{b.reg_no || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{b.breed || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{b.type}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{b.owner || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{b.bms || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {!loading && tab === 'records' && (
          <div style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
            {records.length === 0 ? <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>分娩記録がありません</div> : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#F4F6F8' }}>
                  {['分娩日','母牛','種牛','子牛耳標','性別','生時体重','難産'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.birth_date}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.cow_farm_id || r.cow_ear_tag || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.bull_name || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{r.calf_ear_tag}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.calf_sex || '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.calf_weight_kg ? r.calf_weight_kg + 'kg' : '—'}</td>
                      <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{r.dystocia ? '⚠️ あり' : 'なし'}</td>
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
