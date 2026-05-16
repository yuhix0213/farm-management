// pages/auth/login.tsx — ログイン画面
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (res.ok) {
        const from = router.query.from as string | undefined
        router.push(from && from.startsWith('/') ? from : '/')
      } else {
        const d = await res.json()
        setError(d.message ?? 'ログインに失敗しました')
      }
    } catch { setError('サーバーに接続できませんでした') }
    finally  { setLoading(false) }
  }

  const inp: React.CSSProperties = {
    width:'100%', padding:'9px 12px', border:'1px solid #C8D0DC',
    borderRadius:8, fontSize:14, boxSizing:'border-box', outline:'none',
    fontFamily:'sans-serif',
  }

  return (
    <>
      <Head><title>ログイン | 牧場管理システム</title></Head>
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center',
        justifyContent:'center', background:'#F0F4F8', fontFamily:'sans-serif' }}>
        <div style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0',
          padding:'40px 36px', width:'100%', maxWidth:400 }}>
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ fontSize:40, marginBottom:6 }}>🐄</div>
            <h1 style={{ fontSize:18, fontWeight:600, color:'#1D3557', margin:0 }}>
              牧場管理システム
            </h1>
            <p style={{ fontSize:12, color:'#888', marginTop:4 }}>
              {process.env.NEXT_PUBLIC_FARM_NAME ?? ''}
            </p>
          </div>

          {error && (
            <div style={{ background:'#FCEBEB', border:'1px solid #F09595',
              borderRadius:8, padding:'10px 14px', marginBottom:18,
              fontSize:13, color:'#A32D2D' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:12, color:'#555', marginBottom:4 }}>
                ユーザー名
              </label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                required autoComplete="username" placeholder="admin" style={inp} />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:'block', fontSize:12, color:'#555', marginBottom:4 }}>
                パスワード
              </label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                required autoComplete="current-password" placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              width:'100%', padding:'11px', background:loading?'#A8D5C2':'#1D9E75',
              color:'#fff', border:'none', borderRadius:8, fontSize:15, fontWeight:600,
              cursor:loading?'not-allowed':'pointer', fontFamily:'sans-serif',
            }}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
