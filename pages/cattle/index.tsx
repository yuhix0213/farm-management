// pages/cattle/index.tsx — 個体一覧（登録フォーム付き・レスポンシブ）
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

const BREEDS  = ['黒毛和種','褐毛和種','ホルスタイン','交雑種','日本短角種','その他']
const TYPES   = ['肉牛_肥育','肉牛_繁殖','乳牛','兼用']
const SEXES   = ['去勢','雄','雌']
const ORIGINS = ['自家産','購入','預託']
const STATUSES= ['育成中','肥育中','繁殖中','泌乳中','出荷予定','出荷済','死廃']
const BARNS   = ['A棟','B棟','C棟','D棟']

const blank = { ear_tag_no:'', farm_id:'', breed:'黒毛和種', sex:'去勢', cattle_type:'肉牛_肥育',
  date_of_birth:'', intro_date:'', intro_weight_kg:'', intro_price:'', origin:'購入',
  barn_id:'', stall_no:'', status:'育成中', note:'' }

const statusColor: Record<string,[string,string]> = {
  '肥育中':['#1D9E75','#E1F5EE'],'育成中':['#378ADD','#E6F1FB'],
  '繁殖中':['#BA7517','#FAEEDA'],'泌乳中':['#639922','#EAF3DE'],
  '出荷予定':['#534AB7','#EEEDFE'],'出荷済':['#888780','#F1EFE8'],'死廃':['#E24B4A','#FCEBEB'],
}

const S = {
  label: { display:'block' as const, fontSize:12, color:'#555', marginBottom:4 },
  input: { width:'100%', padding:'8px 10px', border:'1px solid #C8D0DC', borderRadius:8, fontSize:13, boxSizing:'border-box' as const },
  select: { width:'100%', padding:'8px 10px', border:'1px solid #C8D0DC', borderRadius:8, fontSize:13, boxSizing:'border-box' as const, background:'#fff' },
}

export default function CattlePage() {
  const router = useRouter()
  const [cattle, setCattle]   = useState<any[]>([])
  const [barns,  setBarns]    = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [showForm,setShowForm]= useState(false)
  const [form,    setForm]    = useState<any>(blank)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/cattle').then(r=>r.json()),
      fetch('/api/masters').then(r=>r.json()),
    ]).then(([c,m])=>{
      setCattle(Array.isArray(c)?c:[])
      setBarns(Array.isArray(m?.barns)?m.barns:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const set = (k:string,v:any) => setForm((f:any)=>({...f,[k]:v}))

  const handleSubmit = async () => {
    if (!form.ear_tag_no||!form.date_of_birth) { setMsg('耳標番号と生年月日は必須です'); return }
    setSaving(true); setMsg('')
    try {
      const barnId = barns.find((b:any)=>b.name===form.barn_id)?.id || null
      const res = await fetch('/api/cattle',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({...form, barn_id:barnId,
          intro_weight_kg: form.intro_weight_kg||null,
          intro_price: form.intro_price||null }),
      })
      if (res.ok) { setShowForm(false); setForm(blank); load() }
      else { const d=await res.json(); setMsg(d.error||'登録に失敗しました') }
    } catch { setMsg('通信エラーが発生しました') }
    finally { setSaving(false) }
  }

  const filtered = cattle.filter(c=>
    !search||c.ear_tag_no?.includes(search)||c.farm_id?.includes(search)||c.breed?.includes(search))

  return (
    <>
      <Head><title>個体一覧 | 牧場管理システム</title></Head>
      <style>{`@media(max-width:640px){.tbl{display:none!important}.cds{display:flex!important}}@media(min-width:641px){.cds{display:none!important}}`}</style>
      <main style={{padding:16,fontFamily:'sans-serif',background:'#F0F4F8',minHeight:'calc(100vh - 48px)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
          <h1 style={{fontSize:18,fontWeight:600,color:'#1D3557',margin:0}}>個体一覧</h1>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{setShowForm(!showForm);setMsg('')}} style={{padding:'7px 16px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}}>
              {showForm?'✕ 閉じる':'＋ 個体登録'}
            </button>
            <button onClick={()=>router.push('/')} style={{padding:'7px 14px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>← 戻る</button>
          </div>
        </div>

        {/* 登録フォーム */}
        {showForm && (
          <div style={{background:'#fff',borderRadius:12,border:'2px solid #1D9E75',padding:'20px',marginBottom:16}}>
            <h2 style={{fontSize:15,fontWeight:600,color:'#1D3557',marginBottom:16}}>個体新規登録</h2>
            {msg && <div style={{background:'#FCEBEB',border:'1px solid #F09595',borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:13,color:'#A32D2D'}}>{msg}</div>}
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0 16px'}}>
              {[
                ['耳標番号 *','ear_tag_no','text','3012-0300'],
                ['農場内管理番号','farm_id','text','A-0300'],
                ['生年月日 *','date_of_birth','date',''],
                ['導入日','intro_date','date',''],
                ['導入時体重(kg)','intro_weight_kg','number',''],
                ['導入価格(円)','intro_price','number',''],
                ['房番号','stall_no','text','A-01'],
              ].map(([lbl,key,type,ph])=>(
                <div key={key} style={{marginBottom:12}}>
                  <label style={S.label}>{lbl}</label>
                  <input type={type as string} style={S.input} value={form[key]} placeholder={ph as string}
                    onChange={e=>set(key,e.target.value)}/>
                </div>
              ))}
              {[
                ['品種','breed',BREEDS],['性別','sex',SEXES],['用途','cattle_type',TYPES],
                ['導入区分','origin',ORIGINS],['ステータス','status',STATUSES],
              ].map(([lbl,key,opts])=>(
                <div key={key} style={{marginBottom:12}}>
                  <label style={S.label}>{lbl}</label>
                  <select style={S.select} value={form[key]} onChange={e=>set(key,e.target.value)}>
                    {(opts as string[]).map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div style={{marginBottom:12}}>
                <label style={S.label}>牛舎</label>
                <select style={S.select} value={form.barn_id} onChange={e=>set('barn_id',e.target.value)}>
                  <option value="">未選択</option>
                  {barns.map((b:any)=><option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12,gridColumn:'span 2'}}>
                <label style={S.label}>備考</label>
                <textarea style={{...S.input,minHeight:60,resize:'vertical'}} value={form.note} onChange={e=>set('note',e.target.value)}/>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:4}}>
              <button onClick={()=>{setShowForm(false);setForm(blank);setMsg('')}} style={{padding:'8px 18px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>キャンセル</button>
              <button onClick={handleSubmit} disabled={saving} style={{padding:'8px 22px',borderRadius:8,background:saving?'#A8D5C2':'#1D9E75',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer',fontSize:13,fontWeight:600}}>
                {saving?'登録中...':'登録する'}
              </button>
            </div>
          </div>
        )}

        {/* サマリー */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10,marginBottom:14}}>
          {[['総頭数',cattle.length+'頭','#1D3557'],['肥育中',cattle.filter(c=>c.status==='肥育中').length+'頭','#1D9E75'],['出荷予定',cattle.filter(c=>c.status==='出荷予定').length+'頭','#534AB7']].map(([l,v,col])=>(
            <div key={l} style={{background:'#fff',borderRadius:10,border:'0.5px solid #D0D7E0',padding:'12px 14px'}}>
              <div style={{fontSize:11,color:'#888'}}>{l}</div>
              <div style={{fontSize:20,fontWeight:600,color:col as string,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>

        <input placeholder="耳標・管理番号・品種で検索..." value={search} onChange={e=>setSearch(e.target.value)}
          style={{...S.input,marginBottom:14,background:'#fff'}}/>

        {loading && <div style={{color:'#888',textAlign:'center',padding:32}}>読み込み中...</div>}
        {!loading && (
          <>
            <div className="tbl" style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#F4F6F8'}}>
                  {['管理番号','耳標番号','品種','性別','用途','牛舎・房','ステータス'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#555',borderBottom:'1px solid #E0E6ED',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#888'}}>該当する個体がありません</td></tr>}
                  {filtered.map((c,i)=>{
                    const [col,bg]=statusColor[c.status]??['#888','#eee']
                    return(<tr key={c.id} style={{background:i%2===0?'#fff':'#FAFBFC'}}>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',fontWeight:600}}>{c.farm_id||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.ear_tag_no}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.breed}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.sex}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.cattle_type}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.barn_name||'—'}{c.stall_no?' / '+c.stall_no:''}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}><span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:bg,color:col,fontWeight:500}}>{c.status}</span></td>
                    </tr>)
                  })}
                </tbody>
              </table>
            </div>
            <div className="cds" style={{flexDirection:'column',gap:10}}>
              {filtered.length===0&&<div style={{textAlign:'center',color:'#888',padding:32}}>該当する個体がありません</div>}
              {filtered.map(c=>{
                const [col,bg]=statusColor[c.status]??['#888','#eee']
                return(<div key={c.id} style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <div><span style={{fontWeight:600,fontSize:15,color:'#1D3557'}}>{c.farm_id||c.ear_tag_no}</span><span style={{fontSize:12,color:'#888',marginLeft:8}}>{c.ear_tag_no}</span></div>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:bg,color:col,fontWeight:500}}>{c.status}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,fontSize:13}}>
                    {[['品種',c.breed],['性別',c.sex],['用途',c.cattle_type],['牛舎',c.barn_name||'—']].map(([l,v])=>(
                      <div key={l}><span style={{color:'#888',fontSize:11}}>{l}</span><div style={{color:'#333'}}>{v}</div></div>
                    ))}
                  </div>
                  {c.note&&<div style={{marginTop:8,fontSize:12,color:'#888',borderTop:'1px solid #EEF0F3',paddingTop:8}}>📝 {c.note}</div>}
                </div>)
              })}
            </div>
          </>
        )}
      </main>
    </>
  )
}
