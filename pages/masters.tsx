// pages/masters.tsx — マスタ管理（牛舎・スタッフ・種牛）
import { useState, useEffect } from 'react'

// ── スタイル定数 ────────────────────────────────────────────────
const S = {
  page:    { padding: '20px 24px', maxWidth: 900, margin: '0 auto' } as const,
  tabs:    { display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid #E0E6ED' } as const,
  tab:     (active: boolean) => ({
    padding: '8px 18px', fontSize: 13, cursor: 'pointer', fontWeight: active ? 600 : 400,
    color: active ? '#085041' : '#6B7280', borderBottom: active ? '2px solid #1D9E75' : '2px solid transparent',
    background: 'none', border: 'none', outline: 'none',
  } as const),
  card:    { background: '#fff', borderRadius: 10, border: '1px solid #E0E6ED', overflow: 'hidden' } as const,
  thead:   { background: '#F9FAFB' } as const,
  th:      { padding: '10px 14px', fontSize: 12, color: '#6B7280', fontWeight: 500, textAlign: 'left', borderBottom: '1px solid #E0E6ED' } as const,
  td:      { padding: '11px 14px', fontSize: 13, color: '#111827', borderBottom: '1px solid #F3F4F6' } as const,
  btn:     (color: string) => ({
    padding: '5px 12px', fontSize: 12, borderRadius: 6, cursor: 'pointer', fontWeight: 500,
    background: color === 'green' ? '#1D9E75' : color === 'red' ? '#FEE2E2' : '#F3F4F6',
    color:      color === 'green' ? '#fff'    : color === 'red' ? '#DC2626' : '#374151',
    border:     color === 'green' ? 'none'    : color === 'red' ? '1px solid #FCA5A5' : '1px solid #E0E6ED',
  } as const),
  modal:   { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' } as const,
  mbox:    { background: '#fff', borderRadius: 12, padding: '24px 28px', width: '100%', maxWidth: 480, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' } as const,
  label:   { display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, marginTop: 12 } as const,
  input:   { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 6, outline: 'none', boxSizing: 'border-box' } as const,
  select:  { width: '100%', padding: '8px 10px', fontSize: 13, border: '1px solid #D1D5DB', borderRadius: 6, outline: 'none', background: '#fff', boxSizing: 'border-box' } as const,
  row:     { display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' } as const,
}

// ── 汎用モーダル ────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.mbox} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── 牛舎タブ ────────────────────────────────────────────────────
function BarnsTab() {
  const [rows, setRows]   = useState<any[]>([])
  const [modal, setModal] = useState<'none'|'add'|'edit'>('none')
  const [sel, setSel]     = useState<any>(null)
  const blank = { name: '', type: '', capacity: '', note: '' }
  const [f, setF]         = useState(blank)

  const load = () => fetch('/api/barns').then(r => r.json()).then(d => setRows(Array.isArray(d) ? d : []))
  useEffect(() => { load() }, [])

  const openAdd  = () => { setF(blank); setModal('add') }
  const openEdit = (row: any) => { setF({ name: row.name, type: row.type||'', capacity: row.capacity||'', note: row.note||'' }); setSel(row); setModal('edit') }

  const save = async () => {
    const url    = modal === 'add' ? '/api/barns' : `/api/barns/${sel.id}`
    const method = modal === 'add' ? 'POST' : 'PUT'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, capacity: f.capacity ? Number(f.capacity) : null }) })
    if (res.ok) { setModal('none'); load() } else { const d = await res.json(); alert(d.error || '保存失敗') }
  }

  const del = async (id: number) => {
    if (!confirm('削除しますか？この牛舎を使用中の個体は未割当になります。')) return
    const res = await fetch(`/api/barns/${id}`, { method: 'DELETE' })
    if (res.ok) load(); else { const d = await res.json(); alert(d.error || '削除失敗') }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{rows.length}件</span>
        <button style={S.btn('green')} onClick={openAdd}>＋ 牛舎を追加</button>
      </div>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={S.thead}>
            <tr><th style={S.th}>牛舎名</th><th style={S.th}>種別</th><th style={S.th}>収容頭数</th><th style={S.th}>備考</th><th style={S.th}></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#9CA3AF' }}>データなし</td></tr>}
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...S.td, fontWeight: 500 }}>{r.name}</td>
                <td style={S.td}>{r.type || '—'}</td>
                <td style={S.td}>{r.capacity ? `${r.capacity}頭` : '—'}</td>
                <td style={{ ...S.td, color: '#6B7280', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.note || '—'}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={S.btn('')} onClick={() => openEdit(r)}>編集</button>
                    <button style={S.btn('red')} onClick={() => del(r.id)}>削除</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== 'none' && (
        <Modal title={modal === 'add' ? '牛舎を追加' : '牛舎を編集'} onClose={() => setModal('none')}>
          <label style={S.label}>牛舎名 *</label>
          <input style={S.input} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例: A棟" />
          <label style={S.label}>種別</label>
          <select style={S.select} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
            <option value="">未設定</option>
            {['肥育', '繁殖', '育成', '分娩', '搾乳'].map(t => <option key={t}>{t}</option>)}
          </select>
          <label style={S.label}>収容頭数</label>
          <input type="number" style={S.input} value={f.capacity} onChange={e => setF({ ...f, capacity: e.target.value })} placeholder="例: 50" />
          <label style={S.label}>備考</label>
          <input style={S.input} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="メモ" />
          <div style={S.row}>
            <button style={S.btn('')} onClick={() => setModal('none')}>キャンセル</button>
            <button style={S.btn('green')} onClick={save}>保存</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── スタッフタブ ────────────────────────────────────────────────
function StaffTab() {
  const [rows, setRows]   = useState<any[]>([])
  const [modal, setModal] = useState<'none'|'add'|'edit'>('none')
  const [sel, setSel]     = useState<any>(null)
  const blank = { name: '', role: '', phone: '', email: '' }
  const [f, setF]         = useState(blank)

  const load = () => fetch('/api/staff').then(r => r.json()).then(d => setRows(Array.isArray(d) ? d : []))
  useEffect(() => { load() }, [])

  const openAdd  = () => { setF(blank); setModal('add') }
  const openEdit = (row: any) => { setF({ name: row.name, role: row.role||'', phone: row.phone||'', email: row.email||'' }); setSel(row); setModal('edit') }

  const save = async () => {
    const url    = modal === 'add' ? '/api/staff' : `/api/staff/${sel.id}`
    const method = modal === 'add' ? 'POST' : 'PUT'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    if (res.ok) { setModal('none'); load() } else { const d = await res.json(); alert(d.error || '保存失敗') }
  }

  const del = async (id: number) => {
    if (!confirm('このスタッフを削除しますか？担当中の個体は未割当になります。')) return
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' })
    if (res.ok) load(); else { const d = await res.json(); alert(d.error || '削除失敗') }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{rows.length}件</span>
        <button style={S.btn('green')} onClick={openAdd}>＋ スタッフを追加</button>
      </div>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={S.thead}>
            <tr><th style={S.th}>氏名</th><th style={S.th}>役職</th><th style={S.th}>電話番号</th><th style={S.th}>メール</th><th style={S.th}></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5} style={{ ...S.td, textAlign: 'center', color: '#9CA3AF' }}>データなし</td></tr>}
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...S.td, fontWeight: 500 }}>{r.name}</td>
                <td style={S.td}>{r.role || '—'}</td>
                <td style={S.td}>{r.phone || '—'}</td>
                <td style={S.td}>{r.email || '—'}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={S.btn('')} onClick={() => openEdit(r)}>編集</button>
                    <button style={S.btn('red')} onClick={() => del(r.id)}>削除</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== 'none' && (
        <Modal title={modal === 'add' ? 'スタッフを追加' : 'スタッフを編集'} onClose={() => setModal('none')}>
          <label style={S.label}>氏名 *</label>
          <input style={S.input} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例: 田中 太郎" />
          <label style={S.label}>役職</label>
          <input style={S.input} value={f.role} onChange={e => setF({ ...f, role: e.target.value })} placeholder="例: 主任" />
          <label style={S.label}>電話番号</label>
          <input style={S.input} value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} placeholder="例: 090-1234-5678" />
          <label style={S.label}>メールアドレス</label>
          <input style={S.input} value={f.email} onChange={e => setF({ ...f, email: e.target.value })} placeholder="例: tanaka@farm.jp" />
          <div style={S.row}>
            <button style={S.btn('')} onClick={() => setModal('none')}>キャンセル</button>
            <button style={S.btn('green')} onClick={save}>保存</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── 種牛タブ ────────────────────────────────────────────────────
function BullsTab() {
  const [rows, setRows]   = useState<any[]>([])
  const [modal, setModal] = useState<'none'|'add'|'edit'>('none')
  const [sel, setSel]     = useState<any>(null)
  const blank = { name: '', reg_no: '', breed: '黒毛和種', type: '精液', owner: '', bms: '', note: '' }
  const [f, setF]         = useState(blank)

  const load = () => fetch('/api/bulls').then(r => r.json()).then(d => setRows(Array.isArray(d) ? d : []))
  useEffect(() => { load() }, [])

  const openAdd  = () => { setF(blank); setModal('add') }
  const openEdit = (row: any) => { setF({ name: row.name, reg_no: row.reg_no||'', breed: row.breed||'黒毛和種', type: row.type||'精液', owner: row.owner||'', bms: row.bms||'', note: row.note||'' }); setSel(row); setModal('edit') }

  const save = async () => {
    const url    = modal === 'add' ? '/api/bulls' : `/api/bulls/${sel.id}`
    const method = modal === 'add' ? 'POST' : 'PUT'
    const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) })
    if (res.ok) { setModal('none'); load() } else { const d = await res.json(); alert(d.error || '保存失敗') }
  }

  const del = async (id: number) => {
    if (!confirm('この種牛を削除しますか？')) return
    const res = await fetch(`/api/bulls/${id}`, { method: 'DELETE' })
    if (res.ok) load(); else { const d = await res.json(); alert(d.error || '削除失敗') }
  }

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: '#6B7280' }}>{rows.length}件</span>
        <button style={S.btn('green')} onClick={openAdd}>＋ 種牛を追加</button>
      </div>
      <div style={S.card}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={S.thead}>
            <tr><th style={S.th}>名号</th><th style={S.th}>登録番号</th><th style={S.th}>品種</th><th style={S.th}>種別</th><th style={S.th}>BMS傾向</th><th style={S.th}></th></tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} style={{ ...S.td, textAlign: 'center', color: '#9CA3AF' }}>データなし</td></tr>}
            {rows.map(r => (
              <tr key={r.id}>
                <td style={{ ...S.td, fontWeight: 500 }}>{r.name}</td>
                <td style={S.td}>{r.reg_no || '—'}</td>
                <td style={S.td}>{r.breed || '—'}</td>
                <td style={S.td}>
                  <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: 11, background: r.type === '自家保有' ? '#FEF3C7' : '#E1F5EE', color: r.type === '自家保有' ? '#92400E' : '#085041' }}>
                    {r.type}
                  </span>
                </td>
                <td style={S.td}>{r.bms || '—'}</td>
                <td style={{ ...S.td, textAlign: 'right' }}>
                  <span style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button style={S.btn('')} onClick={() => openEdit(r)}>編集</button>
                    <button style={S.btn('red')} onClick={() => del(r.id)}>削除</button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal !== 'none' && (
        <Modal title={modal === 'add' ? '種牛を追加' : '種牛を編集'} onClose={() => setModal('none')}>
          <label style={S.label}>名号 *</label>
          <input style={S.input} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="例: 安福久" />
          <label style={S.label}>登録番号</label>
          <input style={S.input} value={f.reg_no} onChange={e => setF({ ...f, reg_no: e.target.value })} placeholder="例: K-00124" />
          <label style={S.label}>品種</label>
          <select style={S.select} value={f.breed} onChange={e => setF({ ...f, breed: e.target.value })}>
            {['黒毛和種', '褐毛和種', '日本短角種', '無角和種', 'ホルスタイン', '交雑種', 'その他'].map(b => <option key={b}>{b}</option>)}
          </select>
          <label style={S.label}>種別</label>
          <select style={S.select} value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>
            <option>精液</option>
            <option>自家保有</option>
          </select>
          <label style={S.label}>所有者・供給元</label>
          <input style={S.input} value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })} placeholder="例: ○○種苗センター" />
          <label style={S.label}>BMS傾向</label>
          <input style={S.input} value={f.bms} onChange={e => setF({ ...f, bms: e.target.value })} placeholder="例: 8.2平均" />
          <label style={S.label}>備考</label>
          <input style={S.input} value={f.note} onChange={e => setF({ ...f, note: e.target.value })} placeholder="メモ" />
          <div style={S.row}>
            <button style={S.btn('')} onClick={() => setModal('none')}>キャンセル</button>
            <button style={S.btn('green')} onClick={save}>保存</button>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── メインページ ────────────────────────────────────────────────
export default function MastersPage() {
  const [tab, setTab] = useState<'barns'|'staff'|'bulls'>('barns')

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#111827' }}>マスタ管理</h2>
        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9CA3AF' }}>牛舎・スタッフ・種牛のマスタデータを管理します</p>
      </div>

      <div style={S.tabs}>
        <button style={S.tab(tab === 'barns')} onClick={() => setTab('barns')}>🏠 牛舎</button>
        <button style={S.tab(tab === 'staff')} onClick={() => setTab('staff')}>👤 スタッフ</button>
        <button style={S.tab(tab === 'bulls')} onClick={() => setTab('bulls')}>🐂 種牛</button>
      </div>

      {tab === 'barns' && <BarnsTab />}
      {tab === 'staff' && <StaffTab />}
      {tab === 'bulls' && <BullsTab />}
    </div>
  )
}
