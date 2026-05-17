// pages/cattle/index.tsx — 個体一覧（レスポンシブ対応）
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function CattlePage() {
  const router = useRouter()
  const [cattle, setCattle] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/cattle')
      .then(r => r.json())
      .then(data => { setCattle(Array.isArray(data) ? data : []); setLoading(false) })
      .catch(() => { setError('データの取得に失敗しました'); setLoading(false) })
  }, [])

  const statusColor: Record<string, [string,string]> = {
    '肥育中':   ['#1D9E75','#E1F5EE'],
    '育成中':   ['#378ADD','#E6F1FB'],
    '繁殖中':   ['#BA7517','#FAEEDA'],
    '泌乳中':   ['#639922','#EAF3DE'],
    '出荷予定': ['#534AB7','#EEEDFE'],
    '出荷済':   ['#888780','#F1EFE8'],
    '死廃':     ['#E24B4A','#FCEBEB'],
  }

  const filtered = cattle.filter(c =>
    !search ||
    c.ear_tag_no?.includes(search) ||
    c.farm_id?.includes(search) ||
    c.breed?.includes(search)
  )

  return (
    <>
      <Head><title>個体一覧 | 牧場管理システム</title></Head>
      <style>{`
        @media (max-width: 640px) {
          .cattle-table { display: none !important; }
          .cattle-cards { display: flex !important; }
        }
        @media (min-width: 641px) {
          .cattle-cards { display: none !important; }
        }
      `}</style>
      <main style={{ padding: '16px', fontFamily: 'sans-serif', background: '#F0F4F8', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, color: '#1D3557', margin: 0 }}>個体一覧</h1>
          <button onClick={() => router.push('/')} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #C8D0DC', background: '#fff', cursor: 'pointer', fontSize: 13 }}>← 戻る</button>
        </div>

        {/* サマリー */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            ['総頭数', cattle.length + '頭', '#1D3557'],
            ['肥育中', cattle.filter(c=>c.status==='肥育中').length + '頭', '#1D9E75'],
            ['出荷予定', cattle.filter(c=>c.status==='出荷予定').length + '頭', '#534AB7'],
          ].map(([l,v,col]) => (
            <div key={l} style={{ background: '#fff', borderRadius: 10, border: '0.5px solid #D0D7E0', padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#888' }}>{l}</div>
              <div style={{ fontSize: 20, fontWeight: 600, color: col as string, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* 検索 */}
        <input
          placeholder="耳標・管理番号・品種で検索..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #C8D0DC', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', marginBottom: 14, background: '#fff' }}
        />

        {loading && <div style={{ color: '#888', fontSize: 14, textAlign: 'center', padding: 32 }}>読み込み中...</div>}
        {error   && <div style={{ color: '#E24B4A', fontSize: 14 }}>{error}</div>}

        {!loading && !error && (
          <>
            {/* PC: テーブル */}
            <div className="cattle-table" style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F4F6F8' }}>
                    {['管理番号','耳標番号','品種','性別','用途','牛舎・房','ステータス'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 500, color: '#555', borderBottom: '1px solid #E0E6ED', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#888' }}>該当する個体がありません</td></tr>
                  )}
                  {filtered.map((c, i) => {
                    const [col, bg] = statusColor[c.status] ?? ['#888','#eee']
                    return (
                      <tr key={c.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFC' }}>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3', fontWeight: 600 }}>{c.farm_id || '—'}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.ear_tag_no}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.breed}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.sex}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.cattle_type}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>{c.barn_name || '—'}{c.stall_no ? ' / ' + c.stall_no : ''}</td>
                        <td style={{ padding: '10px 14px', borderBottom: '1px solid #EEF0F3' }}>
                          <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: bg, color: col, fontWeight: 500 }}>{c.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* スマホ: カード */}
            <div className="cattle-cards" style={{ flexDirection: 'column', gap: 10 }}>
              {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: 32 }}>該当する個体がありません</div>}
              {filtered.map(c => {
                const [col, bg] = statusColor[c.status] ?? ['#888','#eee']
                return (
                  <div key={c.id} style={{ background: '#fff', borderRadius: 12, border: '0.5px solid #D0D7E0', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 15, color: '#1D3557' }}>{c.farm_id || c.ear_tag_no}</span>
                        <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{c.ear_tag_no}</span>
                      </div>
                      <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: bg, color: col, fontWeight: 500 }}>{c.status}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 13 }}>
                      {[['品種',c.breed],['性別',c.sex],['用途',c.cattle_type],['牛舎',c.barn_name||'—']].map(([l,v]) => (
                        <div key={l}><span style={{ color: '#888', fontSize: 11 }}>{l}</span><div style={{ color: '#333' }}>{v}</div></div>
                      ))}
                    </div>
                    {c.note && <div style={{ marginTop: 8, fontSize: 12, color: '#888', borderTop: '1px solid #EEF0F3', paddingTop: 8 }}>📝 {c.note}</div>}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </>
  )
}
