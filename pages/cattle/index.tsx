// pages/cattle/index.tsx — 元JSXデザイン完全再現（サイドパネル詳細・体重・健康・AI診断）
import { useEffect, useState, useMemo } from 'react'
import Head from 'next/head'

function calcAge(dob: string) { return Math.floor((Date.now()-new Date(dob).getTime())/(1000*60*60*24*30.44)) }
const statusColor: Record<string,string> = {"肥育中":"#1D9E75","育成中":"#378ADD","繁殖中":"#BA7517","泌乳中":"#639922","出荷予定":"#534AB7","出荷済":"#888780","死廃":"#E24B4A"}
const statusBg:    Record<string,string> = {"肥育中":"#E1F5EE","育成中":"#E6F1FB","繁殖中":"#FAEEDA","泌乳中":"#EAF3DE","出荷予定":"#EEEDFE","出荷済":"#F1EFE8","死廃":"#FCEBEB"}

const WEATHER = {
  current:{ temp:12, apparent:9, humidity:72, wind:14, code:2 },
  daily:[{date:"2026-05-16",max:12,min:5,rain:30,code:2},{date:"2026-05-17",max:11,min:7,rain:0,code:1},{date:"2026-05-18",max:17,min:9,rain:0,code:1}]
}
const WMO_LABEL: Record<number,string> = {0:"快晴",1:"晴れ",2:"一部曇り",3:"曇り",63:"雨",80:"にわか雨"}
const WMO_ICON:  Record<number,string> = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",63:"🌧️",80:"🌦️"}

const S = {
  card:  { background:"#fff", border:"0.5px solid #E0E6ED", borderRadius:12, padding:"16px 20px", marginBottom:12 } as React.CSSProperties,
  input: { width:"100%", padding:"7px 10px", border:"0.5px solid #D1D5DB", borderRadius:8, fontSize:13, background:"#fff", color:"#111827", fontFamily:"inherit", boxSizing:"border-box" as const },
  select:{ width:"100%", padding:"7px 10px", border:"0.5px solid #D1D5DB", borderRadius:8, fontSize:13, background:"#fff", color:"#111827", fontFamily:"inherit", boxSizing:"border-box" as const },
  btn:      { padding:"7px 16px", borderRadius:8, fontSize:13, cursor:"pointer", border:"0.5px solid #D1D5DB", background:"#fff", color:"#374151", fontFamily:"inherit" } as React.CSSProperties,
  btnPrimary:{ padding:"7px 16px", borderRadius:8, fontSize:13, cursor:"pointer", border:"none", background:"#1D9E75", color:"white", fontFamily:"inherit" } as React.CSSProperties,
  btnDanger: { padding:"5px 12px", borderRadius:8, fontSize:12, cursor:"pointer", border:"none", background:"#FCEBEB", color:"#A32D2D", fontFamily:"inherit" } as React.CSSProperties,
  btnSm:    { padding:"5px 12px", borderRadius:8, fontSize:12, cursor:"pointer", border:"0.5px solid #D1D5DB", background:"#fff", color:"#374151", fontFamily:"inherit" } as React.CSSProperties,
  th: { padding:"9px 12px", textAlign:"left" as const, fontSize:12, fontWeight:500, color:"#6B7280", background:"#F9FAFB", borderBottom:"0.5px solid #E0E6ED", whiteSpace:"nowrap" as const },
  td: { padding:"9px 12px", borderBottom:"0.5px solid #F3F4F6", fontSize:13, color:"#111827", verticalAlign:"middle" as const },
  badge: (color:string,bg:string) => ({ fontSize:11, padding:"2px 10px", borderRadius:99, color, background:bg, whiteSpace:"nowrap" as const, display:"inline-block" }),
  label: { fontSize:11, color:"#6B7280", marginBottom:3, display:"block" } as React.CSSProperties,
}

function Field({label,span2,children}:{label:string,span2?:boolean,children:React.ReactNode}) {
  return <div style={{marginBottom:12,gridColumn:span2?"span 2":undefined}}><label style={S.label}>{label}</label>{children}</div>
}

function CattleForm({initial,barns,staff,onSave,onClose}:{initial:any,barns:any[],staff:any[],onSave:(f:any)=>void,onClose:()=>void}) {
  const blank = {ear_tag_no:"",farm_id:"",breed:"黒毛和種",sex:"去勢",cattle_type:"肉牛_肥育",date_of_birth:"",intro_date:"",intro_weight_kg:"",origin:"購入",barn_id:"",stall_no:"",status:"育成中",staff_id:"",note:""}
  const [f,setF] = useState(initial?{...initial,intro_weight_kg:initial.intro_weight_kg??"",...(initial.barn_id?{}:{barn_id:""})}:blank)
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}))
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <Field label="耳標番号 *"><input style={S.input} value={f.ear_tag_no} onChange={e=>set("ear_tag_no",e.target.value)} placeholder="例: 3012-0260"/></Field>
        <Field label="農場内管理番号"><input style={S.input} value={f.farm_id} onChange={e=>set("farm_id",e.target.value)} placeholder="例: A-0260"/></Field>
        <Field label="品種 *"><select style={S.select} value={f.breed} onChange={e=>set("breed",e.target.value)}>{["黒毛和種","褐毛和種","日本短角種","ホルスタイン","ジャージー","交雑種"].map(b=><option key={b}>{b}</option>)}</select></Field>
        <Field label="用途区分 *"><select style={S.select} value={f.cattle_type} onChange={e=>set("cattle_type",e.target.value)}>{["肉牛_繁殖","肉牛_肥育","乳牛","兼用"].map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="性別 *"><select style={S.select} value={f.sex} onChange={e=>set("sex",e.target.value)}>{["雌","去勢","雄"].map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="ステータス"><select style={S.select} value={f.status} onChange={e=>set("status",e.target.value)}>{["育成中","肥育中","繁殖中","泌乳中","出荷予定","出荷済","死廃"].map(s=><option key={s}>{s}</option>)}</select></Field>
        <Field label="生年月日 *"><input type="date" style={S.input} value={f.date_of_birth} onChange={e=>set("date_of_birth",e.target.value)}/></Field>
        <Field label="導入日"><input type="date" style={S.input} value={f.intro_date} onChange={e=>set("intro_date",e.target.value)}/></Field>
        <Field label="導入時体重 (kg)"><input type="number" style={S.input} value={f.intro_weight_kg} onChange={e=>set("intro_weight_kg",e.target.value)} placeholder="85"/></Field>
        <Field label="牛舎"><select style={S.select} value={f.barn_id} onChange={e=>set("barn_id",e.target.value)}><option value="">未選択</option>{barns.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
        <Field label="房番号"><input style={S.input} value={f.stall_no} onChange={e=>set("stall_no",e.target.value)} placeholder="A-01"/></Field>
        <Field label="担当者"><select style={S.select} value={f.staff_id} onChange={e=>set("staff_id",e.target.value)}><option value="">未選択</option>{staff.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
        <Field label="備考" span2><textarea style={{...S.input,minHeight:56,resize:"vertical"}} value={f.note} onChange={e=>set("note",e.target.value)}/></Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
        <button style={S.btn} onClick={onClose}>キャンセル</button>
        <button style={S.btnPrimary} onClick={()=>{
          if(!f.ear_tag_no.trim()){alert("耳標番号を入力してください");return}
          if(!f.date_of_birth){alert("生年月日を入力してください");return}
          onSave({...f,intro_weight_kg:f.intro_weight_kg!==''?Number(f.intro_weight_kg):null,barn_id:f.barn_id?Number(f.barn_id):null,staff_id:f.staff_id?Number(f.staff_id):null})
        }}>{initial?"更新する":"登録する"}</button>
      </div>
    </div>
  )
}

function WeightForm({cattleId,weights,onSave,onClose}:{cattleId:number,weights:any[],onSave:(f:any)=>void,onClose:()=>void}) {
  const [f,setF] = useState({measured_at:new Date().toISOString().slice(0,10),weight_kg:"",bcs:"3",note:""})
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}))
  const handleSave=()=>{
    if(!f.weight_kg){alert("体重を入力してください");return}
    const prev=[...weights].filter((w:any)=>w.cattle_id===cattleId).sort((a:any,b:any)=>b.measured_at.localeCompare(a.measured_at))[0]
    let adg=null
    if(prev){const days=Math.round((new Date(f.measured_at).getTime()-new Date(prev.measured_at).getTime())/86400000);if(days>0)adg=Math.round(((Number(f.weight_kg)-prev.weight_kg)/days)*100)/100}
    onSave({cattle_id:cattleId,...f,weight_kg:Number(f.weight_kg),bcs:Number(f.bcs),adg_kg:adg})
  }
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <Field label="測定日 *"><input type="date" style={S.input} value={f.measured_at} onChange={e=>set("measured_at",e.target.value)}/></Field>
        <Field label="体重 (kg) *"><input type="number" style={S.input} value={f.weight_kg} onChange={e=>set("weight_kg",e.target.value)} placeholder="500"/></Field>
        <Field label="BCS (1〜5)"><select style={S.select} value={f.bcs} onChange={e=>set("bcs",e.target.value)}>{["1","2","3","4","5"].map(v=><option key={v}>{v}</option>)}</select></Field>
        <Field label="備考"><input style={S.input} value={f.note} onChange={e=>set("note",e.target.value)}/></Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
        <button style={S.btn} onClick={onClose}>キャンセル</button>
        <button style={S.btnPrimary} onClick={handleSave}>記録する</button>
      </div>
    </div>
  )
}

function HealthForm({cattleId,onSave,onClose}:{cattleId:number,onSave:(f:any)=>void,onClose:()=>void}) {
  const [f,setF] = useState({record_date:new Date().toISOString().slice(0,10),record_type:"定期健診",temperature:"",diagnosis:"",treatment:"",medicine:"",cost:"",vet_name:"",next_checkup:""})
  const set=(k:string,v:any)=>setF((x:any)=>({...x,[k]:v}))
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        <Field label="記録日 *"><input type="date" style={S.input} value={f.record_date} onChange={e=>set("record_date",e.target.value)}/></Field>
        <Field label="種別 *"><select style={S.select} value={f.record_type} onChange={e=>set("record_type",e.target.value)}>{["定期健診","疾病治療","ワクチン","予防処置","去勢手術"].map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="体温 (℃)"><input type="number" style={S.input} step="0.1" value={f.temperature} onChange={e=>set("temperature",e.target.value)} placeholder="38.5"/></Field>
        <Field label="費用 (円)"><input type="number" style={S.input} value={f.cost} onChange={e=>set("cost",e.target.value)} placeholder="3000"/></Field>
        <Field label="診断内容"><input style={S.input} value={f.diagnosis} onChange={e=>set("diagnosis",e.target.value)}/></Field>
        <Field label="担当獣医師"><input style={S.input} value={f.vet_name} onChange={e=>set("vet_name",e.target.value)}/></Field>
        <Field label="処置内容"><input style={S.input} value={f.treatment} onChange={e=>set("treatment",e.target.value)}/></Field>
        <Field label="使用薬品"><input style={S.input} value={f.medicine} onChange={e=>set("medicine",e.target.value)}/></Field>
        <Field label="次回健診予定"><input type="date" style={S.input} value={f.next_checkup} onChange={e=>set("next_checkup",e.target.value)}/></Field>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:4}}>
        <button style={S.btn} onClick={onClose}>キャンセル</button>
        <button style={S.btnPrimary} onClick={()=>onSave({cattle_id:cattleId,...f,temperature:f.temperature?Number(f.temperature):null,cost:f.cost?Number(f.cost):null})}>記録する</button>
      </div>
    </div>
  )
}

function AiAdvisor({cattle,weights,healthRecords}:{cattle:any,weights:any[],healthRecords:any[]}) {
  // チャット履歴をlocalStorageに永続化（個体IDごとにキーを分ける）
  const storageKey = `ai_chat_${cattle.id}`
  const storageResultKey = `ai_result_${cattle.id}`

  const loadStored = () => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  }
  const loadStoredResult = () => {
    try {
      const stored = localStorage.getItem(storageResultKey)
      return stored ? JSON.parse(stored) : null
    } catch { return null }
  }

  const [aiResult,setAiResult] = useState<any>(loadStoredResult)
  const [loading,setLoading]   = useState(false)
  const [messages,setMessages] = useState<any[]>(loadStored)
  const [input,setInput]       = useState("")
  const [chatLoading,setChatLoading] = useState(false)
  const [dotCount,setDotCount]  = useState(1)  // アニメーション用

  // 送信中のドットアニメーション
  useEffect(()=>{
    if(!chatLoading&&!loading) return
    const timer = setInterval(()=>setDotCount(d=>(d%3)+1),500)
    return ()=>clearInterval(timer)
  },[chatLoading,loading])

  // メッセージ変更時にlocalStorageへ保存
  useEffect(()=>{
    try { localStorage.setItem(storageKey, JSON.stringify(messages)) } catch {}
  },[messages,storageKey])

  // 診断結果変更時にlocalStorageへ保存
  useEffect(()=>{
    try {
      if(aiResult) localStorage.setItem(storageResultKey, JSON.stringify(aiResult))
    } catch {}
  },[aiResult,storageResultKey])

  const lw         = [...weights].filter((w:any)=>w.cattle_id===cattle.id).sort((a:any,b:any)=>b.measured_at.localeCompare(a.measured_at))[0]
  const lastHealth = [...healthRecords].filter((h:any)=>h.cattle_id===cattle.id).sort((a:any,b:any)=>b.record_date.localeCompare(a.record_date))[0]
  const weather = WEATHER

  const runDiagnosis = async () => {
    setLoading(true); setAiResult(null); setMessages([])
    try {
      localStorage.removeItem(storageKey)
      localStorage.removeItem(storageResultKey)
      const res = await fetch("/api/ai/diagnosis",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({cattleData:cattle,weatherData:weather})})
      const data = await res.json()
      const text = data.content?.text||""
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim())
      setAiResult(parsed)
      setMessages([{role:"assistant",content:text}])
    } catch(e) {
      setAiResult({risk:"error",riskLabel:"エラー",summary:"診断の取得に失敗しました。再試行してください。",actions:[],detail:"",weatherImpact:""})
    }
    setLoading(false)
  }

  const clearHistory = () => {
    if(!window.confirm("このAI診断履歴を削除しますか？")) return
    localStorage.removeItem(storageKey)
    localStorage.removeItem(storageResultKey)
    setMessages([]); setAiResult(null)
  }

  const sendChat = async () => {
    if(!input.trim()||chatLoading) return
    const userMsg=input.trim(); setInput("")
    const newMsgs=[...messages,{role:"user",content:userMsg}]
    setMessages(newMsgs); setChatLoading(true)
    try {
      const res = await fetch("/api/ai/diagnosis",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({cattleData:cattle,weatherData:weather,messages:newMsgs,mode:"chat"})})
      const data = await res.json()
      let replyText = data.content?.text || "回答を取得できませんでした。"
      try {
        const parsed = JSON.parse(replyText.replace(/```json|```/g,"").trim())
        if (parsed.summary) replyText = parsed.summary + (parsed.detail?" "+parsed.detail:"")
      } catch { /* プレーンテキストならそのまま */ }
      setMessages((m:any)=>[...m,{role:"assistant",content:replyText}])
    } catch {
      setMessages((m:any)=>[...m,{role:"assistant",content:"エラーが発生しました。"}])
    }
    setChatLoading(false)
  }

  const riskColor = (r:string) => ({"high":"#E24B4A","mid":"#BA7517","low":"#1D9E75"}[r]||"#888")
  const riskBg    = (r:string) => ({"high":"#FCEBEB","mid":"#FAEEDA","low":"#E1F5EE"}[r]||"#eee")
  const QUICK = ["飼料の改善点を教えてください","出荷適期はいつ頃ですか？","体重増加が鈍い原因は？","ワクチンスケジュールを教えてください"]
  const dots = ".".repeat(dotCount)

  return (
    <div>
      <style>{`
        @keyframes aipulse{0%,80%,100%{opacity:.2}40%{opacity:1}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes typingDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
      `}</style>

      {/* 気象バナー */}
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:"#E6F1FB",borderRadius:8,marginBottom:12,fontSize:12,flexWrap:"wrap"}}>
        <span style={{fontSize:18}}>{WMO_ICON[weather.current.code]||"🌤️"}</span>
        <span style={{color:"#0C447C",fontWeight:500}}>網走市 現在 {weather.current.temp}℃ / {WMO_LABEL[weather.current.code]||"—"}</span>
        <span style={{color:"#185FA5"}}>湿度 {weather.current.humidity}%</span>
        <span style={{marginLeft:"auto",color:"#185FA5",fontSize:11}}>✅ 診断に反映済み</span>
      </div>

      {/* 未診断 */}
      {!aiResult&&!loading&&(
        <div style={{textAlign:"center",padding:"24px 0"}}>
          <div style={{fontSize:13,color:"#6B7280",marginBottom:16}}>個体データ＋気象情報をAIが総合分析し、健康リスクと推奨アクションを提案します</div>
          <button style={{...S.btnPrimary,padding:"10px 28px",fontSize:14}} onClick={runDiagnosis}>🩺 AI診断を開始する</button>
        </div>
      )}

      {/* 診断中アニメーション */}
      {loading&&(
        <div style={{textAlign:"center",padding:"36px 0"}}>
          <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:14}}>
            {[0,1,2].map(i=>(
              <div key={i} style={{width:10,height:10,borderRadius:"50%",background:"#1D9E75",animation:`typingDot 1.2s ${i*0.2}s ease-in-out infinite`}}/>
            ))}
          </div>
          <div style={{fontSize:13,color:"#1D9E75",fontWeight:500}}>🩺 AI診断中{dots}</div>
          <div style={{fontSize:11,color:"#9CA3AF",marginTop:6}}>個体データ・気象情報を分析しています。しばらくお待ちください</div>
        </div>
      )}

      {/* 診断結果 */}
      {aiResult&&!loading&&(
        <div>
          <div style={{background:riskBg(aiResult.risk),border:`1px solid ${riskColor(aiResult.risk)}50`,borderRadius:10,padding:"14px 16px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,flexWrap:"wrap"}}>
              <span style={{fontSize:12,fontWeight:500,padding:"3px 12px",borderRadius:99,background:riskColor(aiResult.risk),color:"white"}}>{aiResult.riskLabel}</span>
              <span style={{fontSize:13,fontWeight:500,color:"#111827"}}>{aiResult.summary}</span>
            </div>
            {aiResult.detail&&<div style={{fontSize:12,color:"#6B7280",lineHeight:1.6,marginBottom:aiResult.weatherImpact?6:0}}>{aiResult.detail}</div>}
            {aiResult.weatherImpact&&<div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#185FA5",background:"#E6F1FB",padding:"5px 10px",borderRadius:6,marginTop:6}}><span>🌡️</span><span>{aiResult.weatherImpact}</span></div>}
          </div>

          {aiResult.actions?.length>0&&(
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:500,color:"#6B7280",marginBottom:8}}>推奨アクション</div>
              {aiResult.actions.map((a:string,i:number)=>(
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"9px 12px",background:"#F9FAFB",borderRadius:8,marginBottom:6}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:"#1D9E75",color:"white",fontSize:11,fontWeight:500,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{i+1}</div>
                  <div style={{fontSize:13,color:"#111827",lineHeight:1.5}}>{a}</div>
                </div>
              ))}
            </div>
          )}

          {/* 追加相談エリア */}
          <div style={{borderTop:"0.5px solid #E0E6ED",paddingTop:12,marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:6}}>
              <span style={{fontSize:12,fontWeight:500,color:"#6B7280"}}>追加で相談する</span>
              <div style={{display:"flex",gap:6}}>
                <button style={S.btnSm} onClick={runDiagnosis}>再診断</button>
                <button style={{...S.btnSm,color:"#9CA3AF"}} onClick={clearHistory}>🗑️ 履歴削除</button>
              </div>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {QUICK.map(q=>(
                <div key={q} onClick={()=>!chatLoading&&setInput(q)}
                  style={{fontSize:11,padding:"4px 12px",border:"0.5px solid #D1D5DB",borderRadius:99,cursor:chatLoading?"not-allowed":"pointer",background:"#fff",color:chatLoading?"#D1D5DB":"#6B7280",transition:"all 0.15s"}}>
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* チャット履歴 */}
          {messages.slice(1).length>0&&(
            <div style={{marginBottom:10}}>
              {messages.slice(1).map((m:any,i:number)=>(
                <div key={i} style={{display:"flex",gap:8,marginBottom:8,flexDirection:m.role==="user"?"row-reverse":"row"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:m.role==="user"?"#F3F4F6":"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>
                    {m.role==="user"?"👤":"🩺"}
                  </div>
                  <div style={{maxWidth:"78%",padding:"9px 13px",borderRadius:10,fontSize:13,lineHeight:1.6,background:m.role==="user"?"#1D9E75":"#F9FAFB",color:m.role==="user"?"white":"#111827",border:m.role==="user"?"none":"0.5px solid #E0E6ED"}}>
                    {m.content}
                  </div>
                </div>
              ))}

              {/* 回答中インジケーター */}
              {chatLoading&&(
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🩺</div>
                  <div style={{padding:"9px 16px",borderRadius:10,background:"#F9FAFB",border:"0.5px solid #E0E6ED",display:"flex",alignItems:"center",gap:6}}>
                    <div style={{display:"flex",gap:4}}>
                      {[0,1,2].map(i=>(
                        <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#1D9E75",animation:`typingDot 1.2s ${i*0.2}s ease-in-out infinite`}}/>
                      ))}
                    </div>
                    <span style={{fontSize:12,color:"#6B7280"}}>回答を生成中{dots}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* チャット中インジケーター（履歴が空の場合） */}
          {chatLoading&&messages.slice(1).length===0&&(
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:"#E1F5EE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🩺</div>
              <div style={{padding:"9px 16px",borderRadius:10,background:"#F9FAFB",border:"0.5px solid #E0E6ED",display:"flex",alignItems:"center",gap:6}}>
                <div style={{display:"flex",gap:4}}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{width:7,height:7,borderRadius:"50%",background:"#1D9E75",animation:`typingDot 1.2s ${i*0.2}s ease-in-out infinite`}}/>
                  ))}
                </div>
                <span style={{fontSize:12,color:"#6B7280"}}>回答を生成中{dots}</span>
              </div>
            </div>
          )}

          {/* 入力エリア */}
          <div style={{display:"flex",gap:8}}>
            <input style={{...S.input,flex:1,opacity:chatLoading?0.7:1}}
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendChat()}
              placeholder={chatLoading?"回答生成中...":"質問を入力... (Enter で送信)"}
              disabled={chatLoading}
            />
            <button
              style={{...S.btnPrimary,padding:"7px 16px",opacity:chatLoading?0.5:1,cursor:chatLoading?"not-allowed":"pointer"}}
              onClick={sendChat}
              disabled={chatLoading}
            >
              {chatLoading?"…":"送信"}
            </button>
          </div>

          {/* 履歴保持の注記 */}
          <div style={{fontSize:10,color:"#D1D5DB",marginTop:6,textAlign:"right"}}>
            💾 チャット履歴はこのデバイスに保存されます
          </div>
        </div>
      )}
    </div>
  )
}

function CattleDetail({cattle,weights,healthRecords,barns,staff,onAddWeight,onAddHealth,onEdit,onClose}:any) {
  const [tab,setTab] = useState("info")
  const [modal,setModal] = useState("none")
  const ws = [...weights].filter((w:any)=>w.cattle_id===cattle.id).sort((a:any,b:any)=>b.measured_at.localeCompare(a.measured_at))
  const hs = [...healthRecords].filter((h:any)=>h.cattle_id===cattle.id).sort((a:any,b:any)=>b.record_date.localeCompare(a.record_date))
  const lw = ws[0]
  const TABS = [["info","基本情報"],["weight","体重履歴"],["health","健康記録"],["ai","🩺 AI診断"]]
  const staffName = staff.find((s:any)=>s.id===cattle.staff_id)?.name||"—"
  const barnName  = barns.find((b:any)=>b.id===cattle.barn_id)?.name||"—"

  const saveWeight = async (f:any) => {
    const res = await fetch('/api/weight',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
    if(res.ok){ setModal("none"); onAddWeight() }
    else alert('体重記録に失敗しました')
  }
  const saveHealth = async (f:any) => {
    const res = await fetch('/api/health',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)})
    if(res.ok){ setModal("none"); onAddHealth() }
    else alert('健康記録に失敗しました')
  }

  return (
    <div style={{...S.card,border:"2px solid #1D9E75",marginBottom:12}}>
      {modal==="weight"&&<div style={{marginBottom:12,background:"#F9FAFB",borderRadius:10,padding:"16px 20px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:15,fontWeight:500}}>{cattle.farm_id} — 体重記録</span><button style={S.btnSm} onClick={()=>setModal("none")}>✕</button></div><WeightForm cattleId={cattle.id} weights={weights} onSave={saveWeight} onClose={()=>setModal("none")}/></div>}
      {modal==="health"&&<div style={{marginBottom:12,background:"#F9FAFB",borderRadius:10,padding:"16px 20px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}><span style={{fontSize:15,fontWeight:500}}>{cattle.farm_id} — 健康記録</span><button style={S.btnSm} onClick={()=>setModal("none")}>✕</button></div><HealthForm cattleId={cattle.id} onSave={saveHealth} onClose={()=>setModal("none")}/></div>}

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          <span style={{fontSize:15,fontWeight:500,color:"#111827"}}>{cattle.farm_id||cattle.ear_tag_no}</span>
          <span style={{fontSize:12,color:"#6B7280"}}>{cattle.ear_tag_no}</span>
          <span style={S.badge(statusColor[cattle.status]||"#888",statusBg[cattle.status]||"#eee")}>{cattle.status}</span>
        </div>
        <div style={{display:"flex",gap:6,flexShrink:0}}>
          <button style={S.btnSm} onClick={onEdit}>編集</button>
          <button style={S.btnSm} onClick={onClose}>✕ 閉じる</button>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(110px,1fr))",gap:8,marginBottom:14}}>
        {[["品種",cattle.breed],["月齢",cattle.date_of_birth?calcAge(cattle.date_of_birth)+"ヶ月":"—"],["現体重",lw?lw.weight_kg+"kg":"未記録"],["日増体量",lw?.adg_kg!=null?Number(lw.adg_kg).toFixed(2)+"kg/日":"—"]].map(([l,v])=>(
          <div key={l as string} style={{background:"#F9FAFB",borderRadius:8,padding:"10px 12px"}}>
            <div style={{fontSize:11,color:"#9CA3AF"}}>{l}</div>
            <div style={{fontSize:14,fontWeight:500,marginTop:3,color:"#111827"}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",borderBottom:"0.5px solid #E0E6ED",marginBottom:12,overflowX:"auto"}}>
        {TABS.map(([key,label])=>(
          <div key={key} onClick={()=>setTab(key)} style={{padding:"7px 14px",fontSize:13,cursor:"pointer",color:tab===key?"#1D9E75":"#6B7280",borderBottom:tab===key?"2px solid #1D9E75":"2px solid transparent",fontWeight:tab===key?500:400,marginBottom:-1,whiteSpace:"nowrap"}}>{label}</div>
        ))}
      </div>

      {tab==="info"&&(
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",fontSize:13,borderCollapse:"collapse"}}>
            <tbody>
              {[["性別",cattle.sex],["用途区分",cattle.cattle_type],["生年月日",cattle.date_of_birth||"—"],["導入日",cattle.intro_date||"—"],["導入時体重",cattle.intro_weight_kg?cattle.intro_weight_kg+"kg":"—"],["牛舎",barnName+(cattle.stall_no?" / "+cattle.stall_no:"")],["担当者",staffName],["備考",cattle.note||"—"]].map(([l,v])=>(
                <tr key={l as string}><td style={{...S.td,color:"#6B7280",width:130}}>{l}</td><td style={S.td}>{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="weight"&&(
        <>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <button style={S.btnPrimary} onClick={()=>setModal("weight")}>+ 体重記録</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><th style={S.th}>測定日</th><th style={S.th}>体重</th><th style={S.th}>日増体量</th><th style={S.th}>BCS</th><th style={S.th}>備考</th></tr></thead>
              <tbody>
                {ws.length===0?<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#9CA3AF"}}>記録なし</td></tr>
                :ws.map((w:any)=>(
                  <tr key={w.id}>
                    <td style={S.td}>{w.measured_at}</td>
                    <td style={S.td}><strong>{w.weight_kg}kg</strong></td>
                    <td style={S.td}>{w.adg_kg!=null?<span style={{color:w.adg_kg<0.5?"#E24B4A":w.adg_kg<0.8?"#BA7517":"#1D9E75"}}>{Number(w.adg_kg).toFixed(2)}kg/日</span>:"—"}</td>
                    <td style={S.td}>{w.bcs||"—"}</td>
                    <td style={{...S.td,color:"#6B7280"}}>{w.note||"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="health"&&(
        <>
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
            <button style={S.btnPrimary} onClick={()=>setModal("health")}>+ 健康記録</button>
          </div>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead><tr><th style={S.th}>日付</th><th style={S.th}>種別</th><th style={S.th}>体温</th><th style={S.th}>診断内容</th><th style={S.th}>費用</th></tr></thead>
              <tbody>
                {hs.length===0?<tr><td colSpan={5} style={{...S.td,textAlign:"center",color:"#9CA3AF"}}>記録なし</td></tr>
                :hs.map((h:any)=>(
                  <tr key={h.id}>
                    <td style={S.td}>{h.record_date}</td>
                    <td style={S.td}><span style={S.badge("#185FA5","#E6F1FB")}>{h.record_type}</span></td>
                    <td style={S.td}>{h.temperature!=null?<span style={{color:h.temperature>=39.5?"#E24B4A":h.temperature>=39.0?"#BA7517":"inherit"}}>{h.temperature}℃</span>:"—"}</td>
                    <td style={{...S.td,color:"#6B7280"}}>{h.diagnosis||"—"}</td>
                    <td style={S.td}>{h.cost?"¥"+Number(h.cost).toLocaleString():"—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab==="ai"&&<AiAdvisor cattle={cattle} weights={weights} healthRecords={healthRecords}/>}
    </div>
  )
}

export default function CattlePage() {
  const [cattle,   setCattle]   = useState<any[]>([])
  const [weights,  setWeights]  = useState<any[]>([])
  const [health,   setHealth]   = useState<any[]>([])
  const [barns,    setBarns]    = useState<any[]>([])
  const [staff,    setStaff]    = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [modal,    setModal]    = useState("none")
  const [search,   setSearch]   = useState("")
  const [filterStatus,setFilterStatus] = useState("")
  const [filterBarn,  setFilterBarn]   = useState("")

  const load = () => {
    Promise.all([
      fetch('/api/cattle').then(r=>r.json()),
      fetch('/api/weight').then(r=>r.json()),
      fetch('/api/health').then(r=>r.json()),
      fetch('/api/masters').then(r=>r.json()),
    ]).then(([c,w,h,m])=>{
      setCattle(Array.isArray(c)?c:[])
      setWeights(Array.isArray(w)?w:[])
      setHealth(Array.isArray(h)?h:[])
      setBarns(Array.isArray(m?.barns)?m.barns:[])
      setStaff(Array.isArray(m?.staff)?m.staff:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[])

  const filtered = useMemo(()=>cattle.filter((c:any)=>{
    const q=search.toLowerCase()
    return (!q||c.ear_tag_no?.toLowerCase().includes(q)||c.farm_id?.toLowerCase().includes(q)||c.breed?.includes(q))
      &&(!filterStatus||c.status===filterStatus)
      &&(!filterBarn||barns.find((b:any)=>b.id===c.barn_id)?.name===filterBarn)
  }),[cattle,search,filterStatus,filterBarn,barns])

  const addCattle = async (form:any) => {
    const res = await fetch('/api/cattle',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if(res.ok){ setModal("none"); load() } else { const d=await res.json().catch(()=>({})); alert('登録に失敗しました
' + (d.error||res.status)) }
  }
  const editCattle = async (form:any) => {
    const res = await fetch(`/api/cattle/${selected.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    if(res.ok){ const d=await res.json(); setSelected(d); setCattle((cs:any)=>cs.map((c:any)=>c.id===d.id?d:c)); setModal("none") } else { const d=await res.json().catch(()=>({})); alert('更新に失敗しました
' + (d.error||res.status)) }
  }
  const deleteCattle = async (id:number) => {
    if(!window.confirm("この個体を削除しますか？")) return
    const res = await fetch(`/api/cattle/${id}`,{method:'DELETE'})
    if(res.ok){ setCattle((cs:any)=>cs.filter((c:any)=>c.id!==id)); if(selected?.id===id){ setSelected(null); setModal("none") } } else alert('削除に失敗しました')
  }

  return (
    <>
      <Head><title>個体一覧 | 牧場管理システム</title></Head>
      <div style={{background:"#F3F4F6",minHeight:"calc(100vh - 48px)",padding:0}}>
        {/* ページヘッダー */}
        <div style={{background:"#fff",borderBottom:"0.5px solid #E0E6ED",padding:"11px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:48,zIndex:10}}>
          <span style={{fontSize:15,fontWeight:500,color:"#111827"}}>個体一覧</span>
          {modal==="none"&&!selected&&<button style={S.btnPrimary} onClick={()=>setModal("add")}>+ 個体登録</button>}
          {(modal!=="none"||selected)&&<button style={S.btnSm} onClick={()=>{setModal("none");setSelected(null)}}>← 戻る</button>}
        </div>

        <div style={{padding:16}}>
          {/* 登録・編集フォーム */}
          {(modal==="add"||modal==="edit")&&(
            <div style={{...S.card,border:"0.5px solid #E0E6ED",marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontSize:15,fontWeight:500,color:"#111827"}}>{modal==="add"?"個体登録":`${selected?.farm_id||""} — 情報を編集`}</span>
                <button style={S.btnSm} onClick={()=>setModal("none")}>✕ 閉じる</button>
              </div>
              <CattleForm initial={modal==="edit"?selected:null} barns={barns} staff={staff} onSave={modal==="add"?addCattle:editCattle} onClose={()=>setModal("none")}/>
            </div>
          )}

          {/* 個体詳細パネル */}
          {selected&&modal==="none"&&(
            <CattleDetail cattle={selected} weights={weights} healthRecords={health} barns={barns} staff={staff}
              onAddWeight={load} onAddHealth={load}
              onEdit={()=>setModal("edit")} onClose={()=>setSelected(null)}/>
          )}

          {/* 検索・フィルター */}
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>
            <input style={{...S.input,flex:"1 1 180px",minWidth:160}} placeholder="耳標・管理番号・品種で検索..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select style={{...S.select,flex:"0 0 130px"}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="">全ステータス</option>
              {["肥育中","育成中","繁殖中","泌乳中","出荷予定"].map(s=><option key={s}>{s}</option>)}
            </select>
            <select style={{...S.select,flex:"0 0 90px"}} value={filterBarn} onChange={e=>setFilterBarn(e.target.value)}>
              <option value="">全牛舎</option>
              {barns.map((b:any)=><option key={b.id}>{b.name}</option>)}
            </select>
          </div>

          {/* 個体テーブル */}
          <div style={{...S.card,overflowX:"auto"}}>
            {loading&&<div style={{color:"#9CA3AF",textAlign:"center",padding:32}}>読み込み中...</div>}
            {!loading&&(
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:600}}>
                <thead>
                  <tr>
                    {["管理番号","品種","性別","月齢","現体重","日増体量","牛舎","ステータス",""].map(h=>(
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={9} style={{...S.td,textAlign:"center",color:"#9CA3AF"}}>該当する個体がありません</td></tr>}
                  {filtered.map((c:any)=>{
                    const lw=weights.filter((w:any)=>w.cattle_id===c.id).sort((a:any,b:any)=>b.measured_at.localeCompare(a.measured_at))[0]
                    const barnName=barns.find((b:any)=>b.id===c.barn_id)?.name||"—"
                    return(
                      <tr key={c.id} style={{cursor:"pointer",background:selected?.id===c.id?"#E1F5EE":"transparent"}} onClick={()=>{setSelected(c);setModal("none")}}>
                        <td style={S.td}><strong>{c.farm_id||"—"}</strong></td>
                        <td style={S.td}>{c.breed}</td>
                        <td style={S.td}>{c.sex}</td>
                        <td style={S.td}>{c.date_of_birth?calcAge(c.date_of_birth):"—"}ヶ月</td>
                        <td style={S.td}>{lw?lw.weight_kg+"kg":"—"}</td>
                        <td style={S.td}>{lw?.adg_kg!=null?<span style={{color:lw.adg_kg<0.5?"#E24B4A":lw.adg_kg<0.8?"#BA7517":"#1D9E75"}}>{Number(lw.adg_kg).toFixed(2)}kg/日</span>:"—"}</td>
                        <td style={S.td}>{barnName}</td>
                        <td style={S.td}><span style={S.badge(statusColor[c.status]||"#888",statusBg[c.status]||"#eee")}>{c.status}</span></td>
                        <td style={S.td} onClick={e=>{e.stopPropagation();deleteCattle(c.id)}}><button style={S.btnDanger}>削除</button></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
