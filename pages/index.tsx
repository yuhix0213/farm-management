// pages/index.tsx — ダッシュボード（レスポンシブ対応）
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const nav = [
    { href:'/cattle',     icon:'🐄', label:'個体一覧',      desc:'個体の登録・体重・健康記録' },
    { href:'/breeding',   icon:'🌱', label:'繁殖・分娩管理', desc:'母牛・種牛・分娩記録' },
    { href:'/calf-sales', icon:'🏪', label:'子牛販売市場',   desc:'子牛上場・落札・PDF出力' },
  ]
  return (
    <>
      <Head><title>ダッシュボード | 牧場管理システム</title></Head>
      <main style={{ padding:16, fontFamily:'sans-serif', background:'#F0F4F8', minHeight:'calc(100vh - 48px)' }}>
        <h1 style={{ fontSize:18, fontWeight:600, color:'#1D3557', marginBottom:20 }}>ダッシュボード</h1>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:16 }}>
          {nav.map(n=>(
            <div key={n.href} onClick={()=>router.push(n.href)}
              style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', padding:'24px 20px', cursor:'pointer', transition:'box-shadow 0.2s' }}
              onMouseOver={e=>(e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)')}
              onMouseOut={e=>(e.currentTarget.style.boxShadow='none')}
            >
              <div style={{ fontSize:36, marginBottom:12 }}>{n.icon}</div>
              <div style={{ fontSize:15, fontWeight:600, color:'#1D3557', marginBottom:4 }}>{n.label}</div>
              <div style={{ fontSize:12, color:'#888' }}>{n.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
