// pages/breeding/index.tsx — 繁殖・分娩管理（レスポンシブ対応）
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
      fetch('/api/breeding/cows').then(r=>r.json()),
      fetch('/api/breeding/bulls').then(r=>r.json()),
      fetch('/api/breeding/records').then(r=>r.json()),
    ]).then(([c,b,rec]) => {
      setCows(Array.isArray(c)?c:[])
      setBulls(Array.isArray(b)?b:[])
      setRecords(Array.isArray(rec)?rec:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }, [])

  const cowStatusColor: Record<string,[string,string]> = {
    '妊娠中':   ['#1D9E75','#E1F5EE'],
    '授精待ち': ['#BA7517','#FAEEDA'],
    '空胎中':   ['#E24B4A','#FCEBEB'],
    '分娩後':   ['#378ADD','#E6F1FB'],
  }

  const tabs = [['cows','母牛台帳'],['bulls','種牛台帳'],['records','分娩記録']] as const

  return (
    <>
      <Head><title>繁殖・分娩管理 | 牧場管理システム</title></Head>
      <style>{`
        @media(max-width:640px){.breed-table{display:none!important}.breed-cards{display:flex!important}}
        @media(min-width:641px){.breed-cards{display:none!important}}
      `}</style>
      <main style={{ padding: 16, fontFamily: 'sans-serif', background: '#F0F4F8', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <h1 style={{ fontSize:18, fontWeight:600, color:'#1D3557', margin:0 }}>繁殖・分娩管理</h1>
          <button onClick={()=>router.push('/')} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #C8D0DC', background:'#fff', cursor:'pointer', fontSize:13 }}>← 戻る</button>
        </div>

        {/* サマリー */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10, marginBottom:16 }}>
          {[
            ['母牛数', cows.length+'頭', '#1D3557'],
            ['妊娠中', cows.filter(c=>c.status==='妊娠中').length+'頭', '#1D9E75'],
            ['授精待ち', cows.filter(c=>c.status==='授精待ち').length+'頭', '#BA7517'],
            ['今年分娩', records.filter(r=>r.birth_date?.startsWith('2026')).length+'頭', '#534AB7'],
          ].map(([l,v,col])=>(
            <div key={l} style={{ background:'#fff', borderRadius:10, border:'0.5px solid #D0D7E0', padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'#888' }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:600, color:col as string, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* タブ */}
        <div style={{ display:'flex', borderBottom:'1px solid #D0D7E0', marginBottom:14, overflowX:'auto' }}>
          {tabs.map(([key,label])=>(
            <div key={key} onClick={()=>setTab(key)} style={{ padding:'8px 16px', cursor:'pointer', fontSize:13, fontWeight:tab===key?600:400, color:tab===key?'#1D9E75':'#666', borderBottom:tab===key?'2px solid #1D9E75':'2px solid transparent', marginBottom:-1, whiteSpace:'nowrap' }}>{label}</div>
          ))}
        </div>

        {loading && <div style={{ color:'#888', textAlign:'center', padding:32 }}>読み込み中...</div>}

        {/* 母牛台帳 */}
        {!loading && tab==='cows' && (
          <>
            <div className="breed-table" style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', overflow:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ background:'#F4F6F8' }}>
                  {['管理番号','品種','産次','ステータス','授精日','分娩予定','種牛','牛舎'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, color:'#555', borderBottom:'1px solid #E0E6ED', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {cows.length===0 && <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#888' }}>母牛が登録されていません</td></tr>}
                  {cows.map((c,i)=>{
                    const [col,bg] = cowStatusColor[c.status]??['#888','#eee']
                    return (
                      <tr key={c.id} style={{ background:i%2===0?'#fff':'#FAFBFC' }}>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', fontWeight:600 }}>{c.farm_id||c.ear_tag_no}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.breed||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.parity}産</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}><span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:bg, color:col, fontWeight:500 }}>{c.status}</span></td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.last_insem_date||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.expected_birth||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.bull_name||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{c.barn_name||'—'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="breed-cards" style={{ flexDirection:'column', gap:10 }}>
              {cows.map(c=>{
                const [col,bg] = cowStatusColor[c.status]??['#888','#eee']
                return (
                  <div key={c.id} style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', padding:'14px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                      <div><span style={{ fontWeight:600, fontSize:15 }}>{c.farm_id||c.ear_tag_no}</span><span style={{ fontSize:12, color:'#888', marginLeft:8 }}>{c.parity}産</span></div>
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:bg, color:col, fontWeight:500 }}>{c.status}</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                      {[['品種',c.breed||'—'],['種牛',c.bull_name||'—'],['授精日',c.last_insem_date||'—'],['分娩予定',c.expected_birth||'—']].map(([l,v])=>(
                        <div key={l}><span style={{ fontSize:11, color:'#888' }}>{l}</span><div>{v}</div></div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 種牛台帳 */}
        {!loading && tab==='bulls' && (
          <>
            <div className="breed-table" style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', overflow:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ background:'#F4F6F8' }}>
                  {['名号','登録番号','品種','種別','所有者','BMS傾向','備考'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, color:'#555', borderBottom:'1px solid #E0E6ED' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {bulls.length===0 && <tr><td colSpan={7} style={{ padding:32, textAlign:'center', color:'#888' }}>種牛が登録されていません</td></tr>}
                  {bulls.map((b,i)=>(
                    <tr key={b.id} style={{ background:i%2===0?'#fff':'#FAFBFC' }}>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', fontWeight:600 }}>{b.name}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{b.reg_no||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{b.breed||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>
                        <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:b.type==='自家保有'?'#E1F5EE':'#E6F1FB', color:b.type==='自家保有'?'#1D9E75':'#378ADD', fontWeight:500 }}>{b.type}</span>
                      </td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{b.owner||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{b.bms||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888', fontSize:12 }}>{b.note||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="breed-cards" style={{ flexDirection:'column', gap:10 }}>
              {bulls.map(b=>(
                <div key={b.id} style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontWeight:600, fontSize:15 }}>{b.name}</span>
                    <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:b.type==='自家保有'?'#E1F5EE':'#E6F1FB', color:b.type==='自家保有'?'#1D9E75':'#378ADD' }}>{b.type}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                    {[['品種',b.breed||'—'],['登録番号',b.reg_no||'—'],['BMS',b.bms||'—'],['所有者',b.owner||'—']].map(([l,v])=>(
                      <div key={l}><span style={{ fontSize:11, color:'#888' }}>{l}</span><div>{v}</div></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 分娩記録 */}
        {!loading && tab==='records' && (
          <>
            <div className="breed-table" style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', overflow:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ background:'#F4F6F8' }}>
                  {['分娩日','母牛','種牛','子牛耳標','性別','生時体重','難産','担当'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, color:'#555', borderBottom:'1px solid #E0E6ED', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {records.length===0 && <tr><td colSpan={8} style={{ padding:32, textAlign:'center', color:'#888' }}>分娩記録がありません</td></tr>}
                  {records.map((r,i)=>(
                    <tr key={r.id} style={{ background:i%2===0?'#fff':'#FAFBFC' }}>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{r.birth_date}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', fontWeight:600 }}>{r.cow_farm_id||r.cow_ear_tag||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{r.bull_name||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', fontWeight:600 }}>{r.calf_ear_tag}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{r.calf_sex||'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{r.calf_weight_kg?r.calf_weight_kg+'kg':'—'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{r.dystocia?<span style={{ color:'#E24B4A', fontWeight:600 }}>⚠️ あり</span>:'なし'}</td>
                      <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{r.staff_name||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="breed-cards" style={{ flexDirection:'column', gap:10 }}>
              {records.map(r=>(
                <div key={r.id} style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', padding:'14px 16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontWeight:600 }}>{r.calf_ear_tag}</span>
                    <span style={{ fontSize:12, color:'#888' }}>{r.birth_date}</span>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                    {[['母牛',r.cow_farm_id||r.cow_ear_tag||'—'],['種牛',r.bull_name||'—'],['性別',r.calf_sex||'—'],['生時体重',r.calf_weight_kg?r.calf_weight_kg+'kg':'—']].map(([l,v])=>(
                      <div key={l}><span style={{ fontSize:11, color:'#888' }}>{l}</span><div>{v}</div></div>
                    ))}
                  </div>
                  {r.dystocia ? <div style={{ marginTop:8, color:'#E24B4A', fontSize:13, fontWeight:600 }}>⚠️ 難産あり</div> : null}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
