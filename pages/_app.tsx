// pages/_app.tsx — グローバルレイアウト（認証ヘッダー・ログアウトボタン付き）
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Head from 'next/head'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const router  = useRouter()
  const isLogin = router.pathname === '/auth/login'

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/auth/login')
  }

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>牧場管理システム</title>
      </Head>
      {!isLogin && (
        <header style={{
          position:'sticky', top:0, zIndex:100,
          background:'#1D3557', color:'#fff',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'0 20px', height:48,
          boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
        }}>
          <span style={{ fontSize:14, fontWeight:600, letterSpacing:'0.03em' }}>
            🐄 {process.env.NEXT_PUBLIC_FARM_NAME ?? '牧場管理システム'}
          </span>
          <button onClick={handleLogout} style={{
            background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.25)',
            color:'#fff', borderRadius:6, padding:'5px 14px', fontSize:12,
            cursor:'pointer', fontFamily:'sans-serif',
          }}>
            ログアウト
          </button>
        </header>
      )}
      <Component {...pageProps} />
    </>
  )
}
