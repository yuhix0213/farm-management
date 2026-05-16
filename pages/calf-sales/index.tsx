// pages/calf-sales/index.tsx — 子牛販売市場（レスポンシブ対応）
import { useEffect, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function CalfSalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pdfMonth, setPdfMonth] = useState(new Date().toISOString().slice(0,7))

  useEffect(() => {
    fetch('/api/calf-sales')
      .then(r=>r.json())
      .then(data=>{ setSales(Array.isArray(data)?data:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [])

  const statusColor: Record<string,[string,string]> = {
    '完了':   ['#1D9E75','#E1F5EE'],
    '予定':   ['#BA7517','#FAEEDA'],
    '登録済': ['#378ADD','#E6F1FB'],
  }

  const total     = sales.filter(s=>s.status==='完了'&&s.price).reduce((a,s)=>a+Number(s.price),0)
  const months    = [...new Set(sales.filter(s=>s.sale_date).map(s=>s.sale_date.slice(0,7)))].sort().reverse()
  const filtered  = sales.filter(s=>s.sale_date?.startsWith(pdfMonth)&&s.status==='完了')
  const monthTotal= filtered.reduce((a,s)=>a+Number(s.price||0),0)

  const generatePDF = () => {
    const [y,m] = pdfMonth.split('-')
    const label = `${y}年${parseInt(m)}月`
    const tax10  = Math.round(monthTotal/1.10*0.10)
    const taxBase= monthTotal - tax10
    const today  = new Date().toLocaleDateString('ja-JP',{year:'numeric',month:'long',day:'numeric'})
    const rows   = filtered.map((s,i)=>`
      <tr style="background:${i%2===0?'#F4F8FC':'#fff'}">
        <td style="text-align:center;padding:4px 6px">${i+1}</td>
        <td style="text-align:center;padding:4px 6px">${s.sale_date?.replace(/-/g,'/')}</td>
        <td style="text-align:center;padding:4px 6px;font-size:11px">${s.ear_tag_no}</td>
        <td style="text-align:center;padding:4px 6px;font-size:11px">${s.mother_ear_tag||'—'}</td>
        <td style="padding:4px 6px;font-size:10px">${s.breed||'—'}</td>
        <td style="text-align:center;padding:4px 6px">${s.sex||'—'}</td>
        <td style="text-align:center;padding:4px 6px">${s.age_days||'—'}</td>
        <td style="text-align:center;padding:4px 6px">${s.weight_kg||'—'}</td>
        <td style="padding:4px 6px;font-size:10px">${s.market||'—'}</td>
        <td style="padding:4px 6px;font-size:10px">${s.buyer||'—'}</td>
        <td style="text-align:right;padding:4px 6px">¥${Number(s.price).toLocaleString()}</td>
      </tr>`).join('')
    const empty = Array.from({length:Math.max(0,8-filtered.length)},(_,i)=>`
      <tr style="background:${(filtered.length+i)%2===0?'#F4F8FC':'#fff'}">
        <td colspan="11" style="padding:18px">&nbsp;</td>
      </tr>`).join('')
    const html = `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">
<title>子牛販売売上台帳 ${label}分</title>
<style>
  @page{size:A4;margin:14mm 16mm}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:"MS Mincho","游明朝",serif;font-size:9pt;color:#111}
  h1{font-family:"MS Gothic","游ゴシック",sans-serif;font-size:15pt;text-align:center;letter-spacing:.3em;margin-bottom:4px}
  h2{font-family:"MS Gothic",sans-serif;font-size:10pt;text-align:center;margin-bottom:8px}
  hr{border:none;border-top:1.5px solid #111;margin-bottom:6px}
  table{width:100%;border-collapse:collapse}
  th{background:#1D3557;color:#fff;font-family:"MS Gothic",sans-serif;font-size:8pt;padding:4px 3px;text-align:center}
  td{font-size:8pt;border:.4px solid #BBB;vertical-align:middle}
  .info-label{background:#EEE;font-family:"MS Gothic",sans-serif;font-weight:bold;width:24mm;padding:3px 4px}
  .info-val{padding:3px 4px}
  .total-row{background:#E4F0E8!important;font-family:"MS Gothic",sans-serif;font-weight:bold}
  .tax-head{background:#1D3557;color:#fff}
  .tax-total{background:#E4F0E8;font-weight:bold;font-family:"MS Gothic",sans-serif}
  .note{font-size:7pt;color:#555;line-height:1.7}
  .sig-label{background:#EEE;font-family:"MS Gothic",sans-serif;font-size:8pt;text-align:center;padding:3px}
  .sig-cell{height:14mm;border:.8px solid #111}
</style></head><body>
<h1>子　牛　販　売　売　上　台　帳</h1>
<h2>（${label}分）</h2><hr>
<table style="margin-bottom:7px;border:.5px solid #AAA">
  <tr><td class="info-label">事業者名</td><td class="info-val">${process.env.NEXT_PUBLIC_FARM_NAME||'有限会社 北海道牧場'}</td><td class="info-label">課税期間</td><td class="info-val">${y}年1月1日 ～ ${y}年12月31日</td></tr>
  <tr><td class="info-label">所在地</td><td class="info-val">${process.env.NEXT_PUBLIC_FARM_ADDRESS||'北海道網走市○○町1-2-3'}</td><td class="info-label">帳簿作成日</td><td class="info-val">${today}</td></tr>
  <tr><td class="info-label">電話番号</td><td class="info-val">${process.env.NEXT_PUBLIC_FARM_TEL||''}</td><td class="info-label">適格請求書登録番号</td><td class="info-val">${process.env.NEXT_PUBLIC_INVOICE_REG_NO||''}</td></tr>
</table>
<table style="margin-bottom:8px;border:1px solid #111">
  <colgroup><col style="width:4%"><col style="width:9%"><col style="width:10%"><col style="width:10%"><col style="width:13%"><col style="width:4%"><col style="width:5%"><col style="width:6%"><col style="width:12%"><col style="width:13%"><col style="width:14%"></colgroup>
  <thead><tr><th>No.</th><th>販売日</th><th>子牛耳標</th><th>母牛耳標</th><th>品種</th><th>性別</th><th>日齢</th><th>体重(kg)</th><th>販売市場</th><th>落札者</th><th>販売金額(円)</th></tr></thead>
  <tbody>${rows}${empty}
    <tr class="total-row"><td colspan="10" style="text-align:left;padding:4px 8px;border-top:1.2px solid #111;border-bottom:1.2px solid #111">合　　計</td><td style="text-align:right;padding:4px 6px;border-top:1.2px solid #111;border-bottom:1.2px solid #111">¥${monthTotal.toLocaleString()}</td></tr>
  </tbody>
</table>
<div style="font-family:'MS Gothic',sans-serif;font-weight:bold;font-size:9pt;margin-bottom:3px">【消費税区分別集計（インボイス対応）】</div>
<table style="margin-bottom:8px;border:1px solid #111;width:75%">
  <thead><tr class="tax-head"><th style="width:45%">区分</th><th style="width:18%">税抜売上高</th><th style="width:18%">消費税額</th><th style="width:19%">税込合計</th></tr></thead>
  <tbody>
    <tr><td style="padding:4px">課税売上（10%）子牛販売</td><td style="text-align:right;padding:4px">¥${taxBase.toLocaleString()}</td><td style="text-align:right;padding:4px">¥${tax10.toLocaleString()}</td><td style="text-align:right;padding:4px">¥${monthTotal.toLocaleString()}</td></tr>
    <tr><td style="padding:4px">非課税売上</td><td style="text-align:right;padding:4px">¥0</td><td style="text-align:center;padding:4px">—</td><td style="text-align:right;padding:4px">¥0</td></tr>
    <tr class="tax-total"><td style="padding:4px">合計</td><td style="text-align:right;padding:4px">¥${taxBase.toLocaleString()}</td><td style="text-align:right;padding:4px">¥${tax10.toLocaleString()}</td><td style="text-align:right;padding:4px">¥${monthTotal.toLocaleString()}</td></tr>
  </tbody>
</table>
<div class="note" style="margin-bottom:6px">
1. 本帳簿は消費税法第58条及び所得税法第148条に基づく帳簿書類として作成しています。<br>
2. 子牛の販売は課税資産の譲渡等に該当し、標準税率10%が適用されます。<br>
3. 各取引の販売金額は家畜市場の競り台帳（売渡精算書）と照合済みです。<br>
4. 本帳簿は国税7年・地方税5年の保存義務があります。
</div>
<table style="border:.8px solid #111">
  <tr><th class="sig-label" style="width:33%">作成者氏名</th><th class="sig-label" style="width:33%">確認者氏名</th><th class="sig-label" style="width:34%">保管担当者</th></tr>
  <tr><td class="sig-cell"></td><td class="sig-cell"></td><td class="sig-cell"></td></tr>
</table>
<script>window.onload=()=>window.print()</script>
</body></html>`
    const blob = new Blob([html],{type:'text/html;charset=utf-8'})
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href=url; a.download=`子牛販売売上台帳_${pdfMonth}.html`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Head><title>子牛販売市場 | 牧場管理システム</title></Head>
      <style>{`
        @media(max-width:640px){.sales-table{display:none!important}.sales-cards{display:flex!important}}
        @media(min-width:641px){.sales-cards{display:none!important}}
      `}</style>
      <main style={{ padding:16, fontFamily:'sans-serif', background:'#F0F4F8', minHeight:'calc(100vh - 48px)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:8 }}>
          <h1 style={{ fontSize:18, fontWeight:600, color:'#1D3557', margin:0 }}>子牛販売市場</h1>
          <button onClick={()=>router.push('/')} style={{ padding:'6px 14px', borderRadius:8, border:'1px solid #C8D0DC', background:'#fff', cursor:'pointer', fontSize:13 }}>← 戻る</button>
        </div>

        {/* サマリー */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(110px,1fr))', gap:10, marginBottom:16 }}>
          {[
            ['登録頭数', sales.length+'頭', '#1D3557'],
            ['落札済', sales.filter(s=>s.status==='完了').length+'頭', '#1D9E75'],
            ['累計売上', '¥'+total.toLocaleString(), '#534AB7'],
          ].map(([l,v,col])=>(
            <div key={l} style={{ background:'#fff', borderRadius:10, border:'0.5px solid #D0D7E0', padding:'12px 14px' }}>
              <div style={{ fontSize:11, color:'#888' }}>{l}</div>
              <div style={{ fontSize:18, fontWeight:600, color:col as string, marginTop:2 }}>{v}</div>
            </div>
          ))}
        </div>

        {/* PDF出力パネル */}
        <div style={{ background:'#E1F5EE', border:'1px solid #5DCAA5', borderRadius:10, padding:'12px 16px', marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#085041', marginBottom:10 }}>📄 月別売上台帳 PDF出力</div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <select value={pdfMonth} onChange={e=>setPdfMonth(e.target.value)}
              style={{ padding:'7px 10px', borderRadius:8, border:'1px solid #5DCAA5', background:'#fff', fontSize:13 }}>
              {(months.length>0?months:['2026-05','2026-04']).map(m=>{
                const [y,mo]=m.split('-')
                return <option key={m} value={m}>{y}年{parseInt(mo)}月</option>
              })}
            </select>
            <span style={{ fontSize:12, color:'#0F6E56' }}>{filtered.length}件 / ¥{monthTotal.toLocaleString()}</span>
            <button onClick={generatePDF} disabled={filtered.length===0}
              style={{ padding:'7px 18px', borderRadius:8, background:filtered.length===0?'#A8D5C2':'#1D9E75', color:'#fff', border:'none', cursor:filtered.length===0?'not-allowed':'pointer', fontSize:13, fontWeight:600 }}>
              📥 ダウンロード
            </button>
          </div>
          <div style={{ fontSize:11, color:'#0F6E56', marginTop:8 }}>※ HTMLをダウンロード後、ブラウザで開いて印刷（PDF保存）してください</div>
        </div>

        {loading && <div style={{ color:'#888', textAlign:'center', padding:32 }}>読み込み中...</div>}

        {!loading && (
          <>
            {/* PC: テーブル */}
            <div className="sales-table" style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', overflow:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead><tr style={{ background:'#F4F6F8' }}>
                  {['子牛耳標','母牛耳標','品種','性別','日齢','体重','上場市場','上場日','落札額','落札者','状態'].map(h=>(
                    <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontWeight:500, color:'#555', borderBottom:'1px solid #E0E6ED', whiteSpace:'nowrap' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sales.length===0 && <tr><td colSpan={11} style={{ padding:32, textAlign:'center', color:'#888' }}>販売記録がありません</td></tr>}
                  {sales.map((s,i)=>{
                    const [col,bg]=statusColor[s.status]??['#888','#eee']
                    return (
                      <tr key={s.id} style={{ background:i%2===0?'#fff':'#FAFBFC' }}>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', fontWeight:600 }}>{s.ear_tag_no}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{s.mother_ear_tag||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.breed||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.sex||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.age_days?s.age_days+'日':'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.weight_kg?s.weight_kg+'kg':'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{s.market||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.sale_date||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>{s.price?'¥'+Number(s.price).toLocaleString():'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3', color:'#888' }}>{s.buyer||'—'}</td>
                        <td style={{ padding:'10px 14px', borderBottom:'1px solid #EEF0F3' }}>
                          <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:bg, color:col, fontWeight:500 }}>{s.status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* スマホ: カード */}
            <div className="sales-cards" style={{ flexDirection:'column', gap:10 }}>
              {sales.map(s=>{
                const [col,bg]=statusColor[s.status]??['#888','#eee']
                return (
                  <div key={s.id} style={{ background:'#fff', borderRadius:12, border:'0.5px solid #D0D7E0', padding:'14px 16px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <span style={{ fontWeight:600, fontSize:15 }}>{s.ear_tag_no}</span>
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:99, background:bg, color:col, fontWeight:500 }}>{s.status}</span>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:13 }}>
                      {[['母牛',s.mother_ear_tag||'—'],['品種',s.breed||'—'],['性別',s.sex||'—'],['日齢',s.age_days?s.age_days+'日':'—'],['体重',s.weight_kg?s.weight_kg+'kg':'—'],['上場市場',s.market||'—'],['上場日',s.sale_date||'—'],['落札額',s.price?'¥'+Number(s.price).toLocaleString():'—']].map(([l,v])=>(
                        <div key={l}><span style={{ fontSize:11, color:'#888' }}>{l}</span><div>{v}</div></div>
                      ))}
                    </div>
                    {s.buyer && <div style={{ marginTop:8, fontSize:12, color:'#1D9E75', fontWeight:600 }}>落札者: {s.buyer}</div>}
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
