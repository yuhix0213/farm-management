// pages/breeding/index.tsx — 繁殖・分娩管理（授精日入力・分娩予定カウントダウン・編集対応）
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

const S = {
  label:  { display:'block' as const, fontSize:12, color:'#555', marginBottom:4 },
  input:  { width:'100%', padding:'8px 10px', border:'1px solid #C8D0DC', borderRadius:8, fontSize:13, boxSizing:'border-box' as const },
  select: { width:'100%', padding:'8px 10px', border:'1px solid #C8D0DC', borderRadius:8, fontSize:13, boxSizing:'border-box' as const, background:'#fff' },
}

const GESTATION = 285 // 受胎期間（日）

// 授精日 → 分娩予定日
const calcExpectedBirth = (insemDate: string): string => {
  if (!insemDate) return ''
  const d = new Date(insemDate)
  d.setDate(d.getDate() + GESTATION)
  return d.toISOString().slice(0, 10)
}

// 分娩予定日 → カウントダウン情報
const calcCountdown = (expectedBirth: string) => {
  if (!expectedBirth) return null
  const today = new Date(); today.setHours(0,0,0,0)
  const exp   = new Date(expectedBirth); exp.setHours(0,0,0,0)
  const diff  = Math.round((exp.getTime() - today.getTime()) / 86400000)
  return diff
}

const cowStatusColor: Record<string,[string,string]> = {
  '妊娠中':  ['#1D9E75','#E1F5EE'],
  '授精待ち':['#BA7517','#FAEEDA'],
  '空胎中':  ['#E24B4A','#FCEBEB'],
  '分娩後':  ['#378ADD','#E6F1FB'],
}

const blankCow = {
  ear_tag_no:'', farm_id:'', breed:'ホルスタイン', date_of_birth:'',
  status:'空胎中', parity:0, bull_id:'', last_insem_date:'', expected_birth:'', barn_id:'', note:''
}
const blankBull  = { name:'', reg_no:'', breed:'黒毛和種', type:'精液', owner:'', bms:'', note:'' }
const blankBirth = {
  cowId:'', bullId:'', insemDate:'', birthDate: new Date().toISOString().slice(0,10),
  calfEarTag:'', calfSex:'雄', calfWeightKg:'', dystocia:false, staffId:'', note:'', breed:''
}

// ── 授精記録モーダル ──────────────────────────────────────────────
function InsemModal({ cow, bulls, onClose, onSave }: { cow:any, bulls:any[], onClose:()=>void, onSave:(data:any)=>void }) {
  const [insemDate, setInsemDate] = useState(cow.last_insem_date || '')
  const [bullId,    setBullId]    = useState(String(cow.bull_id || ''))
  const [note,      setNote]      = useState('')
  const expectedBirth = calcExpectedBirth(insemDate)
  const countdown     = calcCountdown(expectedBirth)

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',zIndex:300,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',borderRadius:14,padding:'24px 28px',width:'100%',maxWidth:460,boxShadow:'0 8px 32px rgba(0,0,0,0.15)'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <span style={{fontSize:15,fontWeight:600,color:'#1D3557'}}>🐄 授精記録 — {cow.farm_id||cow.ear_tag_no}</span>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#9CA3AF'}}>✕</button>
        </div>

        <label style={S.label}>最終授精日 *</label>
        <input type="date" style={S.input} value={insemDate} onChange={e => setInsemDate(e.target.value)} />

        {/* 分娩予定日の自動計算・表示 */}
        {insemDate && (
          <div style={{margin:'12px 0',background:'#F0F9FF',border:'1px solid #BAE6FD',borderRadius:10,padding:'12px 16px'}}>
            <div style={{fontSize:11,color:'#0369A1',marginBottom:6,fontWeight:500}}>📅 自動計算（受胎期間 {GESTATION}日）</div>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:11,color:'#6B7280'}}>分娩予定日</div>
                <div style={{fontSize:17,fontWeight:700,color:'#1D3557'}}>{expectedBirth}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:11,color:'#6B7280'}}>カウントダウン</div>
                <div style={{
                  fontSize:17, fontWeight:700,
                  color: countdown === null ? '#888' : countdown < 0 ? '#E24B4A' : countdown <= 14 ? '#BA7517' : '#1D9E75'
                }}>
                  {countdown === null ? '—' : countdown < 0 ? `${Math.abs(countdown)}日超過` : countdown === 0 ? '本日！' : `あと ${countdown}日`}
                </div>
              </div>
            </div>
          </div>
        )}

        <label style={{...S.label, marginTop:12}}>使用種牛</label>
        <select style={S.select} value={bullId} onChange={e => setBullId(e.target.value)}>
          <option value="">未選択</option>
          {bulls.map((b:any) => <option key={b.id} value={b.id}>{b.name}（{b.breed}）</option>)}
        </select>

        <label style={{...S.label, marginTop:12}}>メモ</label>
        <input style={S.input} value={note} onChange={e => setNote(e.target.value)} placeholder="例: 1回目授精、受精卵移植など" />

        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
          <button onClick={onClose} style={{padding:'8px 18px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>キャンセル</button>
          <button onClick={() => onSave({ insemDate, bullId, expectedBirth, note })} disabled={!insemDate}
            style={{padding:'8px 22px',borderRadius:8,background:insemDate?'#1D9E75':'#A8D5C2',color:'#fff',border:'none',cursor:insemDate?'pointer':'not-allowed',fontSize:13,fontWeight:600}}>
            記録して保存
          </button>
        </div>
      </div>
    </div>
  )
}

// ── カウントダウンバッジ ─────────────────────────────────────────
function CountdownBadge({ expectedBirth }: { expectedBirth: string }) {
  const days = calcCountdown(expectedBirth)
  if (days === null) return <span style={{color:'#9CA3AF'}}>—</span>
  const [color, bg, text] =
    days < 0    ? ['#E24B4A','#FCEBEB', `${Math.abs(days)}日超過`] :
    days === 0  ? ['#E24B4A','#FCEBEB', '本日！'] :
    days <= 7   ? ['#E24B4A','#FCEBEB', `あと${days}日 🚨`] :
    days <= 21  ? ['#BA7517','#FAEEDA', `あと${days}日 ⚠️`] :
                  ['#1D9E75','#E1F5EE', `あと${days}日`]
  return (
    <span style={{fontSize:11,padding:'3px 8px',borderRadius:99,background:bg,color,fontWeight:500,whiteSpace:'nowrap'}}>
      {text}
    </span>
  )
}

export default function BreedingPage() {
  const router = useRouter()
  const [cows,    setCows]    = useState<any[]>([])
  const [bulls,   setBulls]   = useState<any[]>([])
  const [records, setRecords] = useState<any[]>([])
  const [staff,   setStaff]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'cows'|'bulls'|'records'>('cows')
  const [showForm,setShowForm]= useState(false)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState('')

  // 授精モーダル
  const [insemTarget, setInsemTarget] = useState<any>(null)

  const [cowForm,   setCowForm]   = useState<any>(blankCow)
  const [bullForm,  setBullForm]  = useState<any>(blankBull)
  const [birthForm, setBirthForm] = useState<any>(blankBirth)

  const load = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/breeding/cows').then(r=>r.json()),
      fetch('/api/breeding/bulls').then(r=>r.json()),
      fetch('/api/breeding/records').then(r=>r.json()),
      fetch('/api/masters').then(r=>r.json()),
    ]).then(([c,b,rec,m])=>{
      setCows(Array.isArray(c)?c:[])
      setBulls(Array.isArray(b)?b:[])
      setRecords(Array.isArray(rec)?rec:[])
      setStaff(Array.isArray(m?.staff)?m.staff:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const setCow   = (k:string,v:any) => setCowForm  ((f:any)=>({...f,[k]:v}))
  const setBull  = (k:string,v:any) => setBullForm ((f:any)=>({...f,[k]:v}))
  const setBirth = (k:string,v:any) => setBirthForm((f:any)=>({...f,[k]:v}))

  // 最終授精日が変わったら分娩予定日を自動更新（母牛登録フォーム内）
  const handleInsemDateChange = (date: string) => {
    setCow('last_insem_date', date)
    const exp = calcExpectedBirth(date)
    setCow('expected_birth', exp)
    if (exp) setCow('status', '妊娠中')
  }

  // 授精記録保存（既存母牛の授精日更新）
  const handleInsemSave = async (data: any) => {
    const { insemDate, bullId, expectedBirth } = data
    setSaving(true)
    try {
      const res = await fetch(`/api/breeding/cows`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id:               insemTarget.id,
          ear_tag_no:       insemTarget.ear_tag_no,
          farm_id:          insemTarget.farm_id,
          breed:            insemTarget.breed,
          date_of_birth:    insemTarget.date_of_birth,
          status:           '妊娠中',
          parity:           insemTarget.parity,
          bull_id:          bullId || null,
          last_insem_date:  insemDate,
          expected_birth:   expectedBirth,
          barn_id:          insemTarget.barn_id,
          stall_no:         insemTarget.stall_no,
          note:             insemTarget.note,
        }),
      })
      if (res.ok) { setInsemTarget(null); load() }
      else { const d = await res.json(); alert(d.error || '保存失敗') }
    } catch { alert('通信エラー') } finally { setSaving(false) }
  }

  const handleCowSave = async () => {
    if (!cowForm.ear_tag_no) { setMsg('耳標番号は必須です'); return }
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/breeding/cows', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cowForm, bull_id: cowForm.bull_id||null, parity: Number(cowForm.parity)||0 }),
      })
      if (res.ok) { setShowForm(false); setCowForm(blankCow); load() }
      else { const d = await res.json(); setMsg(d.error||'登録に失敗しました') }
    } catch { setMsg('通信エラー') } finally { setSaving(false) }
  }

  const handleBullSave = async () => {
    if (!bullForm.name) { setMsg('名号は必須です'); return }
    setSaving(true); setMsg('')
    try {
      const res = await fetch('/api/breeding/bulls', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bullForm),
      })
      if (res.ok) { setShowForm(false); setBullForm(blankBull); load() }
      else { const d = await res.json(); setMsg(d.error||'登録に失敗しました') }
    } catch { setMsg('通信エラー') } finally { setSaving(false) }
  }

  const handleBirthSave = async () => {
    if (!birthForm.cowId||!birthForm.calfEarTag||!birthForm.birthDate) {
      setMsg('母牛・子牛耳標・分娩日は必須です'); return
    }
    setSaving(true); setMsg('')
    const cow  = cows.find((c:any) => String(c.id)===String(birthForm.cowId))
    const bull = bulls.find((b:any) => String(b.id)===String(birthForm.bullId))
    const breed = cow&&bull ? (cow.breed===bull.breed?cow.breed:cow.breed+'×'+bull.breed) : cow?.breed||''
    try {
      const res = await fetch('/api/breeding/birth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...birthForm, breed,
          cowId:       Number(birthForm.cowId),
          bullId:      birthForm.bullId ? Number(birthForm.bullId) : null,
          calfWeightKg:birthForm.calfWeightKg ? Number(birthForm.calfWeightKg) : null,
          staffId:     birthForm.staffId ? Number(birthForm.staffId) : null,
        }),
      })
      if (res.ok) { setShowForm(false); setBirthForm(blankBirth); load() }
      else { const d = await res.json(); setMsg(d.error||'登録に失敗しました') }
    } catch { setMsg('通信エラー') } finally { setSaving(false) }
  }

  // ── 妊娠中の牛（カウントダウン順）
  const pregnantCows = cows
    .filter(c => c.status==='妊娠中' && c.expected_birth)
    .sort((a,b) => new Date(a.expected_birth).getTime() - new Date(b.expected_birth).getTime())

  const tabs = [['cows','母牛台帳'],['bulls','種牛台帳'],['records','分娩記録']] as const
  const btnLabel = tab==='cows'?'＋ 母牛登録':tab==='bulls'?'＋ 種牛登録':'＋ 分娩登録'

  return (
    <>
      <Head><title>繁殖・分娩管理 | 牧場管理システム</title></Head>
      <style>{`@media(max-width:640px){.tbl{display:none!important}.cds{display:flex!important}}@media(min-width:641px){.cds{display:none!important}}`}</style>

      {/* 授精記録モーダル */}
      {insemTarget && (
        <InsemModal
          cow={insemTarget}
          bulls={bulls}
          onClose={() => setInsemTarget(null)}
          onSave={handleInsemSave}
        />
      )}

      <main style={{padding:16,fontFamily:'sans-serif',background:'#F0F4F8',minHeight:'calc(100vh - 48px)'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
          <h1 style={{fontSize:18,fontWeight:600,color:'#1D3557',margin:0}}>繁殖・分娩管理</h1>
          <button onClick={()=>router.push('/')} style={{padding:'7px 14px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>← 戻る</button>
        </div>

        {/* サマリーカード */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))',gap:10,marginBottom:14}}>
          {[
            ['母牛数',    cows.length+'頭',                                                             '#1D3557'],
            ['妊娠中',    cows.filter(c=>c.status==='妊娠中').length+'頭',                              '#1D9E75'],
            ['授精待ち',  cows.filter(c=>c.status==='授精待ち'||c.status==='空胎中').length+'頭',       '#BA7517'],
            ['今年分娩',  records.filter(r=>r.birth_date?.startsWith(new Date().getFullYear().toString())).length+'頭', '#534AB7'],
          ].map(([l,v,col])=>(
            <div key={l as string} style={{background:'#fff',borderRadius:10,border:'0.5px solid #D0D7E0',padding:'12px 14px'}}>
              <div style={{fontSize:11,color:'#888'}}>{l}</div>
              <div style={{fontSize:18,fontWeight:600,color:col as string,marginTop:2}}>{v}</div>
            </div>
          ))}
        </div>

        {/* 分娩予定カウントダウン一覧（妊娠中の牛がいる場合） */}
        {pregnantCows.length > 0 && (
          <div style={{background:'#fff',borderRadius:12,border:'1px solid #BAE6FD',padding:'14px 16px',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:600,color:'#0369A1',marginBottom:10}}>🗓️ 分娩予定カウントダウン</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {pregnantCows.map(c => {
                const days = calcCountdown(c.expected_birth)
                const urgent = days !== null && days <= 14
                return (
                  <div key={c.id} style={{
                    display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:8,
                    padding:'10px 14px',borderRadius:9,
                    background: urgent ? '#FFFBEB' : '#F8FAFC',
                    border: urgent ? '1px solid #FCD34D' : '1px solid #E0E6ED',
                  }}>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:14}}>{c.farm_id||c.ear_tag_no}</div>
                        <div style={{fontSize:11,color:'#6B7280'}}>{c.breed} / {c.parity}産 / 授精日: {c.last_insem_date||'—'}</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontSize:11,color:'#6B7280'}}>分娩予定日</div>
                        <div style={{fontSize:13,fontWeight:500}}>{c.expected_birth}</div>
                      </div>
                      <CountdownBadge expectedBirth={c.expected_birth} />
                      <button onClick={() => setInsemTarget(c)}
                        style={{padding:'5px 12px',borderRadius:7,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:12,color:'#374151'}}>
                        授精更新
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* タブ */}
        <div style={{display:'flex',borderBottom:'1px solid #D0D7E0',marginBottom:14,overflowX:'auto'}}>
          {tabs.map(([key,label])=>(
            <div key={key} onClick={()=>{setTab(key);setShowForm(false);setMsg('')}}
              style={{padding:'8px 16px',cursor:'pointer',fontSize:13,fontWeight:tab===key?600:400,color:tab===key?'#1D9E75':'#666',borderBottom:tab===key?'2px solid #1D9E75':'2px solid transparent',marginBottom:-1,whiteSpace:'nowrap'}}>
              {label}
            </div>
          ))}
          <div style={{marginLeft:'auto',paddingBottom:4,display:'flex',alignItems:'center'}}>
            <button onClick={()=>{setShowForm(!showForm);setMsg('')}}
              style={{padding:'6px 14px',borderRadius:8,background:'#1D9E75',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600,whiteSpace:'nowrap'}}>
              {showForm?'✕ 閉じる':btnLabel}
            </button>
          </div>
        </div>

        {msg && <div style={{background:'#FCEBEB',border:'1px solid #F09595',borderRadius:8,padding:'8px 12px',marginBottom:12,fontSize:13,color:'#A32D2D'}}>{msg}</div>}

        {/* ── 母牛登録フォーム ── */}
        {showForm && tab==='cows' && (
          <div style={{background:'#fff',borderRadius:12,border:'2px solid #1D9E75',padding:20,marginBottom:14}}>
            <h2 style={{fontSize:15,fontWeight:600,color:'#1D3557',marginBottom:14}}>母牛新規登録</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0 16px'}}>
              {[['耳標番号 *','ear_tag_no','text'],['農場内管理番号','farm_id','text'],['生年月日','date_of_birth','date']].map(([lbl,key,type])=>(
                <div key={key} style={{marginBottom:12}}>
                  <label style={S.label}>{lbl}</label>
                  <input type={type} style={S.input} value={cowForm[key]} onChange={e=>setCow(key,e.target.value)}/>
                </div>
              ))}
              {/* 最終授精日 → 分娩予定日自動計算 */}
              <div style={{marginBottom:12}}>
                <label style={S.label}>最終授精日</label>
                <input type="date" style={S.input} value={cowForm.last_insem_date} onChange={e => handleInsemDateChange(e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>分娩予定日 <span style={{color:'#1D9E75',fontSize:11}}>(授精日+{GESTATION}日 自動計算)</span></label>
                <input type="date" style={{...S.input, background:'#F0F9FF', color: cowForm.expected_birth?'#0369A1':'#9CA3AF'}}
                  value={cowForm.expected_birth} onChange={e=>setCow('expected_birth',e.target.value)}/>
                {cowForm.expected_birth && (
                  <div style={{marginTop:4,display:'flex',alignItems:'center',gap:8}}>
                    <CountdownBadge expectedBirth={cowForm.expected_birth} />
                  </div>
                )}
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>品種</label>
                <select style={S.select} value={cowForm.breed} onChange={e=>setCow('breed',e.target.value)}>
                  {['ホルスタイン','黒毛和種','褐毛和種','ホルスタイン×黒毛','交雑種'].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>ステータス</label>
                <select style={S.select} value={cowForm.status} onChange={e=>setCow('status',e.target.value)}>
                  {['妊娠中','授精待ち','空胎中','分娩後'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>産次</label>
                <input type="number" style={S.input} value={cowForm.parity} onChange={e=>setCow('parity',e.target.value)} min={0}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>使用種牛</label>
                <select style={S.select} value={cowForm.bull_id} onChange={e=>setCow('bull_id',e.target.value)}>
                  <option value="">未選択</option>
                  {bulls.map((b:any)=><option key={b.id} value={b.id}>{b.name}（{b.breed}）</option>)}
                </select>
              </div>
              <div style={{marginBottom:12,gridColumn:'span 2'}}>
                <label style={S.label}>備考</label>
                <textarea style={{...S.input,minHeight:52,resize:'vertical'}} value={cowForm.note} onChange={e=>setCow('note',e.target.value)}/>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>{setShowForm(false);setCowForm(blankCow);setMsg('')}} style={{padding:'8px 18px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>キャンセル</button>
              <button onClick={handleCowSave} disabled={saving} style={{padding:'8px 22px',borderRadius:8,background:saving?'#A8D5C2':'#1D9E75',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer',fontSize:13,fontWeight:600}}>{saving?'登録中...':'登録する'}</button>
            </div>
          </div>
        )}

        {/* ── 種牛登録フォーム ── */}
        {showForm && tab==='bulls' && (
          <div style={{background:'#fff',borderRadius:12,border:'2px solid #1D9E75',padding:20,marginBottom:14}}>
            <h2 style={{fontSize:15,fontWeight:600,color:'#1D3557',marginBottom:14}}>種牛新規登録</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0 16px'}}>
              {[['名号 *','name','text'],['登録番号','reg_no','text'],['所有者・供給元','owner','text'],['BMS傾向','bms','text']].map(([lbl,key,type])=>(
                <div key={key} style={{marginBottom:12}}>
                  <label style={S.label}>{lbl}</label>
                  <input type={type} style={S.input} value={bullForm[key]} onChange={e=>setBull(key,e.target.value)}/>
                </div>
              ))}
              <div style={{marginBottom:12}}>
                <label style={S.label}>品種</label>
                <select style={S.select} value={bullForm.breed} onChange={e=>setBull('breed',e.target.value)}>
                  {['黒毛和種','褐毛和種','ホルスタイン','日本短角種'].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>種別</label>
                <select style={S.select} value={bullForm.type} onChange={e=>setBull('type',e.target.value)}>
                  {['精液','自家保有'].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12,gridColumn:'span 2'}}>
                <label style={S.label}>備考</label>
                <textarea style={{...S.input,minHeight:52,resize:'vertical'}} value={bullForm.note} onChange={e=>setBull('note',e.target.value)}/>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>{setShowForm(false);setBullForm(blankBull);setMsg('')}} style={{padding:'8px 18px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>キャンセル</button>
              <button onClick={handleBullSave} disabled={saving} style={{padding:'8px 22px',borderRadius:8,background:saving?'#A8D5C2':'#1D9E75',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer',fontSize:13,fontWeight:600}}>{saving?'登録中...':'登録する'}</button>
            </div>
          </div>
        )}

        {/* ── 分娩登録フォーム ── */}
        {showForm && tab==='records' && (
          <div style={{background:'#fff',borderRadius:12,border:'2px solid #E24B4A',padding:20,marginBottom:14}}>
            <h2 style={{fontSize:15,fontWeight:600,color:'#1D3557',marginBottom:6}}>分娩登録</h2>
            <div style={{background:'#E1F5EE',borderRadius:8,padding:'8px 12px',marginBottom:14,fontSize:12,color:'#085041'}}>
              ✅ 登録すると子牛が<strong>子牛販売台帳に自動登録</strong>され、母牛のステータスが「授精待ち」に更新されます
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'0 16px'}}>
              <div style={{marginBottom:12}}>
                <label style={S.label}>母牛 *</label>
                <select style={S.select} value={birthForm.cowId} onChange={e=>{
                  setBirth('cowId',e.target.value)
                  const c=cows.find((x:any)=>String(x.id)===e.target.value)
                  if(c){ setBirth('bullId',c.bull_id||''); setBirth('insemDate',c.last_insem_date||'') }
                }}>
                  <option value="">選択してください</option>
                  {cows.map((c:any)=><option key={c.id} value={c.id}>{c.farm_id||c.ear_tag_no}（{c.breed}・{c.parity}産）</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>使用種牛</label>
                <select style={S.select} value={birthForm.bullId} onChange={e=>setBirth('bullId',e.target.value)}>
                  <option value="">未選択</option>
                  {bulls.map((b:any)=><option key={b.id} value={b.id}>{b.name}（{b.breed}）</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>授精日</label>
                <input type="date" style={S.input} value={birthForm.insemDate} onChange={e=>setBirth('insemDate',e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>分娩日 *</label>
                <input type="date" style={S.input} value={birthForm.birthDate} onChange={e=>setBirth('birthDate',e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>子牛耳標番号 *</label>
                <input style={S.input} value={birthForm.calfEarTag} placeholder="例: 3012-0310" onChange={e=>setBirth('calfEarTag',e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>性別</label>
                <select style={S.select} value={birthForm.calfSex} onChange={e=>setBirth('calfSex',e.target.value)}>
                  {['雄','雌','去勢'].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>生時体重(kg)</label>
                <input type="number" style={S.input} value={birthForm.calfWeightKg} placeholder="35" onChange={e=>setBirth('calfWeightKg',e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={S.label}>担当者</label>
                <select style={S.select} value={birthForm.staffId} onChange={e=>setBirth('staffId',e.target.value)}>
                  <option value="">未選択</option>
                  {staff.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12,display:'flex',alignItems:'center',gap:10}}>
                <label style={{...S.label,marginBottom:0}}>難産</label>
                <input type="checkbox" checked={birthForm.dystocia} onChange={e=>setBirth('dystocia',e.target.checked)} style={{width:16,height:16}}/>
                <span style={{fontSize:13,color:'#666'}}>あり</span>
              </div>
              <div style={{marginBottom:12,gridColumn:'span 2'}}>
                <label style={S.label}>備考</label>
                <textarea style={{...S.input,minHeight:52,resize:'vertical'}} value={birthForm.note} onChange={e=>setBirth('note',e.target.value)}/>
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>{setShowForm(false);setBirthForm(blankBirth);setMsg('')}} style={{padding:'8px 18px',borderRadius:8,border:'1px solid #C8D0DC',background:'#fff',cursor:'pointer',fontSize:13}}>キャンセル</button>
              <button onClick={handleBirthSave} disabled={saving} style={{padding:'8px 22px',borderRadius:8,background:saving?'#F09595':'#E24B4A',color:'#fff',border:'none',cursor:saving?'not-allowed':'pointer',fontSize:13,fontWeight:600}}>{saving?'登録中...':'登録して子牛台帳に反映'}</button>
            </div>
          </div>
        )}

        {loading && <div style={{color:'#888',textAlign:'center',padding:32}}>読み込み中...</div>}

        {/* 母牛台帳テーブル */}
        {!loading && tab==='cows' && (
          <>
            <div className="tbl" style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#F4F6F8'}}>
                  {['管理番号','品種','産次','ステータス','最終授精日','分娩予定日','残日数','種牛','操作'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#555',borderBottom:'1px solid #E0E6ED',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {cows.length===0&&<tr><td colSpan={9} style={{padding:32,textAlign:'center',color:'#888'}}>母牛が登録されていません</td></tr>}
                  {cows.map((c,i)=>{
                    const [col,bg]=cowStatusColor[c.status]??['#888','#eee']
                    return(
                      <tr key={c.id} style={{background:i%2===0?'#fff':'#FAFBFC'}}>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',fontWeight:600}}>{c.farm_id||c.ear_tag_no}</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.breed||'—'}</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.parity}産</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>
                          <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:bg,color:col,fontWeight:500}}>{c.status}</span>
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.last_insem_date||'—'}</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{c.expected_birth||'—'}</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>
                          {c.expected_birth ? <CountdownBadge expectedBirth={c.expected_birth}/> : <span style={{color:'#9CA3AF'}}>—</span>}
                        </td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888'}}>{c.bull_name||'—'}</td>
                        <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>
                          <button onClick={() => setInsemTarget(c)}
                            style={{padding:'4px 10px',borderRadius:6,border:'1px solid #1D9E75',background:'#E1F5EE',color:'#085041',cursor:'pointer',fontSize:12,fontWeight:500}}>
                            授精記録
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {/* モバイルカード */}
            <div className="cds" style={{flexDirection:'column',gap:10}}>
              {cows.map(c=>{
                const [col,bg]=cowStatusColor[c.status]??['#888','#eee']
                return(
                  <div key={c.id} style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',padding:'14px 16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                      <div><span style={{fontWeight:600,fontSize:15}}>{c.farm_id||c.ear_tag_no}</span><span style={{fontSize:12,color:'#888',marginLeft:8}}>{c.parity}産</span></div>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:bg,color:col,fontWeight:500}}>{c.status}</span>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:13,marginBottom:10}}>
                      {[['品種',c.breed||'—'],['種牛',c.bull_name||'—'],['最終授精日',c.last_insem_date||'—'],['分娩予定',c.expected_birth||'—']].map(([l,v])=>(
                        <div key={l}><span style={{fontSize:11,color:'#888'}}>{l}</span><div>{v}</div></div>
                      ))}
                    </div>
                    {c.expected_birth && (
                      <div style={{marginBottom:10,display:'flex',gap:8,alignItems:'center'}}>
                        <span style={{fontSize:11,color:'#6B7280'}}>残日数:</span>
                        <CountdownBadge expectedBirth={c.expected_birth}/>
                      </div>
                    )}
                    <button onClick={() => setInsemTarget(c)}
                      style={{width:'100%',padding:'8px',borderRadius:8,border:'1px solid #1D9E75',background:'#E1F5EE',color:'#085041',cursor:'pointer',fontSize:13,fontWeight:500}}>
                      授精記録を入力
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* 種牛台帳テーブル */}
        {!loading && tab==='bulls' && (
          <>
            <div className="tbl" style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#F4F6F8'}}>
                  {['名号','登録番号','品種','種別','所有者','BMS傾向','備考'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#555',borderBottom:'1px solid #E0E6ED'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {bulls.length===0&&<tr><td colSpan={7} style={{padding:32,textAlign:'center',color:'#888'}}>種牛が登録されていません</td></tr>}
                  {bulls.map((b,i)=>(
                    <tr key={b.id} style={{background:i%2===0?'#fff':'#FAFBFC'}}>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',fontWeight:600}}>{b.name}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888'}}>{b.reg_no||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{b.breed||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>
                        <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:b.type==='自家保有'?'#E1F5EE':'#E6F1FB',color:b.type==='自家保有'?'#1D9E75':'#378ADD',fontWeight:500}}>{b.type}</span>
                      </td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888'}}>{b.owner||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{b.bms||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888',fontSize:12}}>{b.note||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cds" style={{flexDirection:'column',gap:10}}>
              {bulls.map(b=>(
                <div key={b.id} style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontWeight:600,fontSize:15}}>{b.name}</span>
                    <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:b.type==='自家保有'?'#E1F5EE':'#E6F1FB',color:b.type==='自家保有'?'#1D9E75':'#378ADD'}}>{b.type}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:13}}>
                    {[['品種',b.breed||'—'],['登録番号',b.reg_no||'—'],['BMS',b.bms||'—'],['所有者',b.owner||'—']].map(([l,v])=>(
                      <div key={l}><span style={{fontSize:11,color:'#888'}}>{l}</span><div>{v}</div></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 分娩記録テーブル */}
        {!loading && tab==='records' && (
          <>
            <div className="tbl" style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',overflow:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead><tr style={{background:'#F4F6F8'}}>
                  {['分娩日','母牛','種牛','子牛耳標','性別','生時体重','難産','担当'].map(h=>(
                    <th key={h} style={{padding:'10px 14px',textAlign:'left',fontWeight:500,color:'#555',borderBottom:'1px solid #E0E6ED',whiteSpace:'nowrap'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {records.length===0&&<tr><td colSpan={8} style={{padding:32,textAlign:'center',color:'#888'}}>分娩記録がありません</td></tr>}
                  {records.map((r,i)=>(
                    <tr key={r.id} style={{background:i%2===0?'#fff':'#FAFBFC'}}>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{r.birth_date}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',fontWeight:600}}>{r.cow_farm_id||r.cow_ear_tag||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888'}}>{r.bull_name||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',fontWeight:600}}>{r.calf_ear_tag}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{r.calf_sex||'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{r.calf_weight_kg?r.calf_weight_kg+'kg':'—'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3'}}>{r.dystocia?<span style={{color:'#E24B4A',fontWeight:600}}>⚠️ あり</span>:'なし'}</td>
                      <td style={{padding:'10px 14px',borderBottom:'1px solid #EEF0F3',color:'#888'}}>{r.staff_name||'—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cds" style={{flexDirection:'column',gap:10}}>
              {records.map(r=>(
                <div key={r.id} style={{background:'#fff',borderRadius:12,border:'0.5px solid #D0D7E0',padding:'14px 16px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontWeight:600}}>{r.calf_ear_tag}</span>
                    <span style={{fontSize:12,color:'#888'}}>{r.birth_date}</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,fontSize:13}}>
                    {[['母牛',r.cow_farm_id||r.cow_ear_tag||'—'],['種牛',r.bull_name||'—'],['性別',r.calf_sex||'—'],['生時体重',r.calf_weight_kg?r.calf_weight_kg+'kg':'—']].map(([l,v])=>(
                      <div key={l}><span style={{fontSize:11,color:'#888'}}>{l}</span><div>{v}</div></div>
                    ))}
                  </div>
                  {r.dystocia?<div style={{marginTop:8,color:'#E24B4A',fontSize:13,fontWeight:600}}>⚠️ 難産あり</div>:null}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  )
}
