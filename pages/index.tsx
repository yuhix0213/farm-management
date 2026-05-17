// pages/index.tsx — ダッシュボード（元JSXデザイン完全再現 + DB連携）
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

const WMO_LABEL: Record<number,string> = {0:"快晴",1:"晴れ",2:"一部曇り",3:"曇り",45:"霧",48:"霧氷",51:"小雨",53:"雨",55:"大雨",61:"弱い雨",63:"雨",65:"大雨",71:"小雪",73:"雪",75:"大雪",80:"にわか雨",81:"にわか雨",82:"強いにわか雨",95:"雷雨",96:"雷雨+雹",99:"激しい雷雨"}
const WMO_ICON:  Record<number,string> = {0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌧️",55:"🌧️",61:"🌦️",63:"🌧️",65:"🌧️",71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌧️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️"}

const WEATHER = {
  current:{ temp:12, apparent:9, humidity:72, wind:14, code:2 },
  daily:[
    {date:"2026-05-16",max:12,min:5, rain:30,code:2},
    {date:"2026-05-17",max:11,min:7, rain:0, code:1},
    {date:"2026-05-18",max:17,min:9, rain:0, code:1},
    {date:"2026-05-19",max:10,min:5, rain:60,code:63},
    {date:"2026-05-20",max:13,min:5, rain:0, code:2},
    {date:"2026-05-21",max:22,min:12,rain:10,code:1},
    {date:"2026-05-22",max:18,min:10,rain:20,code:2},
  ]
}

const S = {
  card: { background:"#fff", border:"0.5px solid #E0E6ED", borderRadius:12, padding:"16px 20px", marginBottom:12 } as React.CSSProperties,
  th:   { padding:"9px 12px", textAlign:"left" as const, fontSize:12, fontWeight:500, color:"#6B7280", background:"#F9FAFB", borderBottom:"0.5px solid #E0E6ED", whiteSpace:"nowrap" as const },
  td:   { padding:"9px 12px", borderBottom:"0.5px solid #F3F4F6", fontSize:13, color:"#111827", verticalAlign:"middle" as const },
  badge: (color:string,bg:string) => ({ fontSize:11, padding:"2px 10px", borderRadius:99, color, background:bg, whiteSpace:"nowrap" as const, display:"inline-block" }),
}

export default function Dashboard() {
  const router = useRouter()
  const [cattle,    setCattle]   = useState<any[]>([])
  const [cows,      setCows]     = useState<any[]>([])
  const [calfSales, setCalfSales]= useState<any[]>([])
  const [weights,   setWeights]  = useState<any[]>([])
  const [loading,   setLoading]  = useState(true)

  useEffect(()=>{
    Promise.all([
      fetch('/api/cattle').then(r=>r.json()),
      fetch('/api/breeding/cows').then(r=>r.json()),
      fetch('/api/calf-sales').then(r=>r.json()),
      fetch('/api/weight').then(r=>r.json()),
    ]).then(([c,cw,cs,w])=>{
      setCattle(Array.isArray(c)?c:[])
      setCows(Array.isArray(cw)?cw:[])
      setCalfSales(Array.isArray(cs)?cs:[])
      setWeights(Array.isArray(w)?w:[])
      setLoading(false)
    }).catch(()=>setLoading(false))
  },[])

  const totalHead = cattle.filter(c=>c.status!=='出荷済'&&c.status!=='死廃').length
  const cur = WEATHER.current

  // 畜産向け注意事項
  const notices: {c:string,bg:string,t:string,s:string}[] = []
  if (cur.temp>=25) notices.push({c:"#E24B4A",bg:"#FCEBEB",t:"高温ストレス注意",s:"牛舎換気・飲水確保を徹底してください"})
  if (cur.temp<=5)  notices.push({c:"#185FA5",bg:"#E6F1FB",t:"低温ストレス注意",s:"新生子牛・病弱個体の保温対策を確認してください"})
  if (cur.humidity>=80) notices.push({c:"#854F0B",bg:"#FAEEDA",t:"高湿度",s:"蹄病・皮膚疾患が発生しやすい環境です"})
  if (WEATHER.daily[0]?.rain>=60) notices.push({c:"#854F0B",bg:"#FAEEDA",t:"降水リスク高",s:"放牧中の個体は早めに収容を検討してください"})

  const tempAlert = cur.temp>=25?{label:"高温注意",color:"#E24B4A",bg:"#FCEBEB"}:cur.temp<=5?{label:"低温注意",color:"#185FA5",bg:"#E6F1FB"}:null

  const recentWeights = [...weights].sort((a:any,b:any)=>b.measured_at?.localeCompare(a.measured_at)).slice(0,5)

  return (
    <>
      <Head><title>ダッシュボード | 牧場管理システム</title></Head>
      <main style={{padding:16,fontFamily:"sans-serif",background:"#F3F4F6",minHeight:"calc(100vh - 48px)"}}>

        {/* サマリーカード */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:10,marginBottom:14}}>
          {[
            ["総飼養頭数", loading?"—":totalHead+"頭", null],
            ["分娩予定",   loading?"—":cows.filter((c:any)=>c.status==="妊娠中").length+"頭","#BA7517"],
            ["出荷予定",   loading?"—":calfSales.filter((s:any)=>s.status==="予定").length+"頭","#534AB7"],
            ["要注意",     loading?"—":cattle.filter((c:any)=>c.note&&c.note.length>0).length+"頭","#E24B4A"],
          ].map(([l,v,col])=>(
            <div key={l as string} style={{background:"#F9FAFB",borderRadius:8,padding:"12px 14px",border:"0.5px solid #E0E6ED"}}>
              <div style={{fontSize:11,color:"#9CA3AF"}}>{l}</div>
              <div style={{fontSize:22,fontWeight:500,color:(col||"#111827") as string,marginTop:4}}>{v}</div>
            </div>
          ))}
        </div>

        {/* 天気パネル */}
        <div style={S.card}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:8}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:13,fontWeight:500,color:"#111827"}}>🌡️ 網走市 — 気象情報</span>
              {tempAlert&&<span style={{fontSize:11,padding:"2px 10px",borderRadius:99,background:tempAlert.bg,color:tempAlert.color,fontWeight:500}}>{tempAlert.label}</span>}
            </div>
            <span style={{fontSize:11,color:"#9CA3AF"}}>実況データ 2026/05/16取得</span>
          </div>

          {/* 現況 */}
          <div style={{display:"grid",gridTemplateColumns:"auto 1fr 1fr 1fr 1fr",gap:10,alignItems:"center",background:"#F9FAFB",borderRadius:10,padding:"12px 16px",marginBottom:12,overflowX:"auto"}}>
            <div style={{fontSize:36,lineHeight:1}}>{WMO_ICON[cur.code]||"🌤️"}</div>
            <div>
              <div style={{fontSize:11,color:"#9CA3AF"}}>現在気温</div>
              <div style={{fontSize:22,fontWeight:500,color:cur.temp>=25?"#E24B4A":cur.temp<=5?"#185FA5":"#111827"}}>{cur.temp}℃</div>
              <div style={{fontSize:11,color:"#9CA3AF"}}>{WMO_LABEL[cur.code]||"—"}</div>
            </div>
            {[["体感気温",cur.apparent+"℃"],["湿度",cur.humidity+"%"],["風速",cur.wind+"km/h"]].map(([lbl,val])=>(
              <div key={lbl as string}>
                <div style={{fontSize:11,color:"#9CA3AF"}}>{lbl}</div>
                <div style={{fontSize:16,fontWeight:500,color:"#111827"}}>{val}</div>
              </div>
            ))}
          </div>

          {/* 7日間予報 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:notices.length?12:0}}>
            {WEATHER.daily.map((d,i)=>{
              const dt = new Date(d.date+"T00:00:00")
              const dow = ["日","月","火","水","木","金","土"][dt.getDay()]
              const label = i===0?"今日":i===1?"明日":`${dt.getMonth()+1}/${dt.getDate()}(${dow})`
              return(
                <div key={d.date} style={{background:i===0?"#E1F5EE":"#F9FAFB",border:i===0?"1px solid #5DCAA5":"0.5px solid #E0E6ED",borderRadius:8,padding:"8px 4px",textAlign:"center"}}>
                  <div style={{fontSize:10,color:i===0?"#085041":"#9CA3AF",marginBottom:3,fontWeight:i===0?500:400}}>{label}</div>
                  <div style={{fontSize:18,marginBottom:3}}>{WMO_ICON[d.code]||"🌤️"}</div>
                  <div style={{fontSize:12,fontWeight:500,color:d.max>=25?"#E24B4A":"#111827"}}>{d.max}℃</div>
                  <div style={{fontSize:11,color:d.min<=5?"#185FA5":"#6B7280"}}>{d.min}℃</div>
                  <div style={{fontSize:10,color:"#378ADD",marginTop:2}}>{d.rain}%</div>
                </div>
              )
            })}
          </div>

          {/* 畜産向け注意事項 */}
          {notices.length>0&&(
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {notices.map((n,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"8px 12px",background:n.bg,borderRadius:8,borderLeft:`3px solid ${n.c}`,flexWrap:"wrap"}}>
                  <span style={{fontSize:12,fontWeight:500,color:n.c,flexShrink:0}}>{n.t}</span>
                  <span style={{fontSize:12,color:"#6B7280"}}>{n.s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アラート */}
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:10,color:"#111827"}}>要対応アラート</div>
          {loading ? <div style={{color:"#9CA3AF",fontSize:13}}>読み込み中...</div> : (
            <>
              {cows.filter((c:any)=>c.expected_birth&&Math.round((new Date(c.expected_birth).getTime()-Date.now())/86400000)<=7).map((c:any)=>{
                const days = Math.round((new Date(c.expected_birth).getTime()-Date.now())/86400000)
                return(
                  <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F9FAFB",borderRadius:8,marginBottom:6,borderLeft:"3px solid #EF9F27"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#111827"}}>分娩予定 — {c.farm_id||c.ear_tag_no}</div>
                      <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{days<=0?"本日以降":days+"日後"} / {c.breed}</div>
                    </div>
                    <span style={{fontSize:11,padding:"3px 12px",borderRadius:99,background:"#FAEEDA",color:"#854F0B",fontWeight:500}}>{days<=0?"本日以降":days+"日後"}</span>
                  </div>
                )
              })}
              {cattle.filter((c:any)=>c.note&&c.note.length>0).slice(0,3).map((c:any)=>(
                <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:"#F9FAFB",borderRadius:8,marginBottom:6,borderLeft:"3px solid #E24B4A"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500,color:"#111827"}}>個体 {c.farm_id||c.ear_tag_no}</div>
                    <div style={{fontSize:11,color:"#6B7280",marginTop:2}}>{c.note}</div>
                  </div>
                </div>
              ))}
              {cows.filter((c:any)=>c.expected_birth&&Math.round((new Date(c.expected_birth).getTime()-Date.now())/86400000)<=7).length===0&&
               cattle.filter((c:any)=>c.note&&c.note.length>0).length===0&&(
                <div style={{fontSize:13,color:"#9CA3AF",textAlign:"center",padding:"12px 0"}}>現在アラートはありません</div>
              )}
            </>
          )}
        </div>

        {/* 最近の体重記録 */}
        <div style={S.card}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:10,color:"#111827"}}>最近の体重記録</div>
          {loading ? <div style={{color:"#9CA3AF",fontSize:13}}>読み込み中...</div> : (
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:400}}>
                <thead><tr>
                  {["個体","測定日","体重","日増体量"].map(h=><th key={h} style={S.th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {recentWeights.length===0&&<tr><td colSpan={4} style={{...S.td,textAlign:"center",color:"#9CA3AF"}}>記録なし</td></tr>}
                  {recentWeights.map((w:any)=>{
                    const c = cattle.find((x:any)=>x.id===w.cattle_id)
                    return(
                      <tr key={w.id}>
                        <td style={S.td}>{c?.farm_id||"—"}</td>
                        <td style={S.td}>{w.measured_at}</td>
                        <td style={S.td}><strong>{w.weight_kg}kg</strong></td>
                        <td style={S.td}>{w.adg_kg!=null?<span style={{color:w.adg_kg<0.5?"#E24B4A":w.adg_kg<0.8?"#BA7517":"#1D9E75"}}>{Number(w.adg_kg).toFixed(2)}kg/日</span>:"—"}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </>
  )
}
