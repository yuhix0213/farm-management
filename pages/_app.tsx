// pages/_app.tsx — 元JSXのサイドバー型レイアウト完全再現 + レスポンシブ対応
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import '../styles/globals.css'

const NAV = [
  { key:'/',            label:'ダッシュボード' },
  { key:'/cattle',      label:'個体一覧' },
  { key:'/breeding',    label:'繁殖・分娩管理' },
  { key:'/calf-sales',  label:'子牛販売市場' },
  { key:'/masters',     label:'マスタ管理' },
]

export default function App({ Component, pageProps }: AppProps) {
  const router  = useRouter()
  const isLogin = router.pathname === '/auth/login'
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  const navTo = (key: string) => {
    router.push(key)
    setMenuOpen(false)
  }

  if (isLogin) return (
    <>
      <Head><meta name="viewport" content="width=device-width, initial-scale=1" /></Head>
      <Component {...pageProps} />
    </>
  )

  const currentLabel = NAV.find(n => router.pathname === n.key || (n.key !== '/' && router.pathname.startsWith(n.key)))?.label || ''

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>牧場管理システム</title>
      </Head>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; font-family: sans-serif; }
        .sidebar {
          width: 176px;
          background: #fff;
          border-right: 0.5px solid #E0E6ED;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          z-index: 99;
          overflow-y: auto;
          transition: transform 0.25s ease;
        }
        .main-content {
          margin-left: 176px;
          display: flex;
          flex-direction: column;
          min-height: 100dvh;
        }
        .mob-header { display: none; }
        .desk-header { display: flex; }
        .close-btn { display: none; }
        .overlay { display: none; }
        @media (max-width: 640px) {
          .sidebar { transform: translateX(-100%); width: 200px; }
          .sidebar.open { transform: translateX(0); }
          .main-content { margin-left: 0; }
          .mob-header { display: flex; }
          .desk-header { display: none; }
          .close-btn { display: block; }
          .overlay { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 98; }
        }
      `}</style>

      {/* オーバーレイ */}
      {menuOpen && <div className="overlay" onClick={() => setMenuOpen(false)} />}

      {/* サイドバー */}
      <div className={`sidebar${menuOpen ? ' open' : ''}`}>
        <div style={{ padding: '14px 16px', borderBottom: '0.5px solid #E0E6ED', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>🐄 牧場管理</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>FARM MANAGEMENT</div>
          </div>
          <button className="close-btn" onClick={() => setMenuOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B7280', padding: 4 }}>✕</button>
        </div>

        {NAV.map(n => {
          const active = router.pathname === n.key || (n.key !== '/' && router.pathname.startsWith(n.key))
          return (
            <div key={n.key} onClick={() => navTo(n.key)}
              style={{ padding: '9px 16px', fontSize: 13, cursor: 'pointer', background: active ? '#E1F5EE' : 'transparent', color: active ? '#085041' : '#6B7280', fontWeight: active ? 500 : 400 }}>
              {n.label}
            </div>
          )
        })}

        <div style={{ flex: 1 }} />
        <div style={{ padding: '10px 16px', fontSize: 11, color: '#9CA3AF', borderTop: '0.5px solid #E0E6ED' }}>
          v0.1.0 プレテスト
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="main-content">
        {/* モバイルヘッダー */}
        <div className="mob-header" style={{ background: '#fff', borderBottom: '0.5px solid #E0E6ED', padding: '11px 16px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button onClick={() => setMenuOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#6B7280', padding: 0, marginRight: 12 }}>☰</button>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#111827', flex: 1 }}>{currentLabel}</span>
          <button onClick={handleLogout}
            style={{ background: '#F3F4F6', border: '1px solid #E0E6ED', color: '#6B7280', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>
            ログアウト
          </button>
        </div>

        {/* PCヘッダー */}
        <div className="desk-header" style={{ background: '#fff', borderBottom: '0.5px solid #E0E6ED', padding: '11px 20px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#111827' }}>{currentLabel}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{process.env.NEXT_PUBLIC_FARM_NAME ?? ''}</span>
            <button onClick={handleLogout}
              style={{ background: '#F3F4F6', border: '1px solid #E0E6ED', color: '#6B7280', borderRadius: 6, padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>
              ログアウト
            </button>
          </div>
        </div>

        <Component {...pageProps} />
      </div>
    </>
  )
}
