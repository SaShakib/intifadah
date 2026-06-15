'use client'

import { useState, useCallback } from 'react'

// ── Data ──
const membersData = [
  { id:'#০০১', name:'আবদুল রহমান',      phone:'01711-123456', type:'ইনতিফাদাহ', joined:'১০ জানু ২০২৩',   savings:'৳৪৫,০০০',   donation:'৳১২,৫০০', loan:'—',        status:'সক্রিয়',    savingsRaw:45000,  loanRaw:0 },
  { id:'#০০২', name:'রহিমা খাতুন',       phone:'01819-234567', type:'সাধারণ',    joined:'২৫ মার্চ ২০২৩',  savings:'৳২২,০০০',   donation:'৳৮,০০০',  loan:'৳১৫,০০০', status:'সক্রিয়',    savingsRaw:22000,  loanRaw:15000 },
  { id:'#০০৩', name:'ইব্রাহিম শেখ',      phone:'01912-345678', type:'ইনতিফাদাহ', joined:'০৫ জুন ২০২২',   savings:'৳৮৮,০০০',   donation:'৳৩৫,০০০', loan:'৳২০,০০০', status:'সক্রিয়',    savingsRaw:88000,  loanRaw:20000 },
  { id:'#০০৪', name:'সালেহা বেগম',        phone:'01611-456789', type:'সাধারণ',    joined:'১২ সেপ্টে ২০২৩', savings:'৳১৮,৫০০',   donation:'৳৫,০০০',  loan:'—',        status:'সক্রিয়',    savingsRaw:18500,  loanRaw:0 },
  { id:'#০০৫', name:'মো. আমির হোসেন',    phone:'01711-567890', type:'সাধারণ',    joined:'০১ নভে ২০২৩',   savings:'৳৩৫,০০০',   donation:'৳৯,৫০০',  loan:'৳১৫,০০০', status:'সক্রিয়',    savingsRaw:35000,  loanRaw:15000 },
  { id:'#০০৬', name:'নাসরিন আক্তার',     phone:'01819-678901', type:'ইনতিফাদাহ', joined:'২০ ডিসে ২০২২',  savings:'৳৬২,০০০',   donation:'৳২৮,০০০', loan:'—',        status:'সক্রিয়',    savingsRaw:62000,  loanRaw:0 },
  { id:'#০০৭', name:'জান্নাতুন নিসা',    phone:'01512-789012', type:'সাধারণ',    joined:'০৩ ফেব্রু ২০২৪', savings:'৳১২,০০০',   donation:'৳৩,৫০০',  loan:'৳৮,০০০',  status:'সক্রিয়',    savingsRaw:12000,  loanRaw:8000 },
  { id:'#০০৮', name:'মো. রফিকুল ইসলাম', phone:'01611-890123', type:'সংগঠন',     joined:'১৫ মার্চ ২০২৩',  savings:'৳১,২৫,০০০', donation:'৳৫০,০০০', loan:'—',        status:'সক্রিয়',    savingsRaw:125000, loanRaw:0 },
  { id:'#০০৯', name:'সাবরিনা সুলতানা',   phone:'01712-901234', type:'সাধারণ',    joined:'২৮ এপ্রিল ২০২৪', savings:'৳৯,০০০',    donation:'—',        loan:'৳১২,০০০', status:'মুলতবি',    savingsRaw:9000,   loanRaw:12000 },
  { id:'#০১০', name:'মো. করিম উল্লাহ',   phone:'01819-012345', type:'সাধারণ',    joined:'০৭ জুলাই ২০২৩',  savings:'৳২৮,০০০',   donation:'৳৭,৫০০',  loan:'৳৮,০০০',  status:'সক্রিয়',    savingsRaw:28000,  loanRaw:8000 },
  { id:'#০১১', name:'আমিনুল ইসলাম',      phone:'01612-123456', type:'ইনতিফাদাহ', joined:'১৪ আগস্ট ২০২২',  savings:'৳৯৫,০০০',   donation:'৳৪২,০০০', loan:'—',        status:'সক্রিয়',    savingsRaw:95000,  loanRaw:0 },
  { id:'#০১২', name:'ফাতিমা বেগম',        phone:'01711-234567', type:'সাধারণ',    joined:'২২ অক্টো ২০২৩',  savings:'৳১৫,০০০',   donation:'৳৪,০০০',  loan:'৳১০,০০০', status:'নিষ্ক্রিয়', savingsRaw:15000,  loanRaw:10000 },
]

const avColorClasses = ['av-0','av-1','av-2','av-3']

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return name.slice(0, 2)
}

export default function MembersPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortSelect, setSortSelect] = useState('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [fileName, setFileName] = useState('')
  const [toast, setToast] = useState<{msg:string,visible:boolean}>({msg:'',visible:false})

  const showToast = useCallback((msg: string) => {
    setToast({msg, visible:true})
    setTimeout(() => setToast(t => ({...t, visible:false})), 2500)
  }, [])

  let filtered = membersData.filter(m => {
    const q = search.toLowerCase()
    const matchSearch = !q || m.name.includes(q) || m.phone.includes(q) || m.id.includes(q)
    const matchType = !typeFilter || m.type === typeFilter
    const matchStatus = !statusFilter || m.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  if (sortSelect === 'name') filtered = [...filtered].sort((a,b) => a.name.localeCompare(b.name, 'bn'))
  else if (sortSelect === 'savings') filtered = [...filtered].sort((a,b) => b.savingsRaw - a.savingsRaw)
  else if (sortSelect === 'loan') filtered = [...filtered].sort((a,b) => b.loanRaw - a.loanRaw)

  const resetFilters = () => {
    setSearch(''); setTypeFilter(''); setStatusFilter(''); setSortSelect('date')
  }

  const submitMember = () => {
    showToast('সদস্য সফলভাবে যোগ করা হয়েছে')
    setModalOpen(false)
  }

  const changePage = (dir: number) => {
    setCurrentPage(p => Math.max(1, Math.min(12, p + dir)))
  }

  const TypeBadge = ({type}: {type:string}) => {
    if (type === 'ইনতিফাদাহ') return <span className="badge badge-info">ইনতিফাদাহ</span>
    if (type === 'সংগঠন') return <span className="badge badge-success">সংগঠন</span>
    return <span className="badge badge-muted">সাধারণ</span>
  }

  const StatusBadge = ({status}: {status:string}) => {
    if (status === 'সক্রিয়') return <span className="badge badge-success">সক্রিয়</span>
    if (status === 'মুলতবি') return <span className="badge badge-warning">মুলতবি</span>
    return <span className="badge badge-danger">নিষ্ক্রিয়</span>
  }

  return (
    <>
      <style>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: var(--fg); line-height: 1.2; }
        .page-header p { font-size: 13px; color: var(--muted); margin-top: 3px; }
        .filter-bar { padding: 14px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
        .search-wrap { position: relative; flex: 1; min-width: 200px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
        .search-input { padding-left: 38px; }
        .filter-select { padding: 10px 32px 10px 12px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; color: var(--fg); background: var(--surface); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; transition: border-color 0.15s; }
        .filter-select:focus { border-color: var(--brand-mid); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.20); }
        .stat-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: var(--r); overflow: hidden; margin-bottom: 20px; box-shadow: var(--sh-sm); }
        .stat-cell { background: var(--surface); padding: 14px 18px; display: flex; flex-direction: column; gap: 3px; }
        .stat-cell-label { font-size: 11px; color: var(--muted); font-weight: 600; }
        .stat-cell-value { font-size: 20px; font-weight: 700; color: var(--fg); font-variant-numeric: tabular-nums; }
        .stat-cell-value.clr-info { color: var(--info); }
        .stat-cell-value.clr-muted { color: var(--muted); }
        .stat-cell-value.clr-success { color: var(--success); }
        .stat-cell-value.clr-warning { color: var(--warning); }
        .table-card { overflow: hidden; }
        .table-wrap { overflow-x: auto; }
        .member-cell { display: flex; align-items: center; gap: 10px; }
        .member-name { font-weight: 600; color: var(--fg); font-size: 13px; }
        .member-id { font-size: 11px; color: var(--muted); }
        .action-btns { display: flex; gap: 4px; align-items: center; }
        .icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.12s; padding: 0; font-family: var(--font); }
        .icon-btn:hover { background: var(--surface-2); color: var(--fg-2); border-color: var(--brand-light); }
        .pagination { display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-top: 1px solid var(--border); }
        .pagination-info { font-size: 13px; color: var(--muted); }
        .pagination-btns { display: flex; gap: 4px; }
        .page-btn { min-width: 34px; height: 34px; padding: 0 8px; border-radius: var(--r-sm); border: 1px solid var(--border); background: var(--surface); color: var(--fg-2); font-size: 13px; font-family: var(--font); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.12s; }
        .page-btn:hover { background: var(--surface-2); }
        .page-btn.active { background: var(--brand); color: #fff; border-color: var(--brand); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .checkbox { width: 16px; height: 16px; border: 2px solid var(--border); border-radius: 4px; cursor: pointer; accent-color: var(--brand); }
        .av-0 { background: var(--brand-light); color: var(--brand); }
        .av-1 { background: oklch(95% 0.04 240); color: oklch(40% 0.15 240); }
        .av-2 { background: oklch(95% 0.04 75); color: oklch(42% 0.15 75); }
        .av-3 { background: oklch(95% 0.04 25); color: oklch(44% 0.16 25); }
        .empty-state { padding: 48px 24px; text-align: center; color: var(--muted); }
        .empty-state p { font-size: 14px; margin-top: 8px; }
        .toast-m { position: fixed; bottom: 88px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; z-index: 9999; box-shadow: var(--sh); white-space: nowrap; opacity: 0; transition: opacity 0.2s, transform 0.2s; pointer-events: none; }
        .toast-m.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .modal-backdrop { position: fixed; inset: 0; background: oklch(0% 0 0 / 0.45); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
        .modal-backdrop.open { opacity: 1; pointer-events: auto; }
        .modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 20px 60px oklch(0% 0 0 / 0.25); width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto; transform: translateY(16px) scale(0.98); transition: transform 0.2s; }
        .modal-backdrop.open .modal { transform: translateY(0) scale(1); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .modal-header h2 { font-size: 17px; font-weight: 700; color: var(--fg); }
        .modal-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.12s; }
        .modal-close:hover { background: var(--danger-bg); color: var(--danger); border-color: oklch(88% 0.04 25); }
        .modal-body { padding: 20px 24px; }
        .modal-footer { padding: 16px 24px 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); margin-top: 4px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group-m { display: flex; flex-direction: column; gap: 5px; }
        .form-group-m.full { grid-column: 1 / -1; }
        .form-label-m { font-size: 12px; font-weight: 600; color: var(--fg-2); }
        .form-label-m .req { color: var(--danger); }
        .radio-group { display: flex; gap: 16px; padding: 10px 0; }
        .radio-label { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--fg); cursor: pointer; }
        .radio-label input { accent-color: var(--brand); width: 15px; height: 15px; }
        .file-input-wrap { border: 2px dashed var(--border); border-radius: var(--r-sm); padding: 16px; text-align: center; cursor: pointer; transition: all 0.15s; display: block; }
        .file-input-wrap:hover { border-color: var(--brand-mid); background: var(--brand-light); }
        .file-input-text { font-size: 12px; color: var(--muted); }
        .file-input-text strong { color: var(--brand); }
        @media (max-width: 640px) {
          .form-grid { grid-template-columns: 1fr; }
          .stat-bar { grid-template-columns: repeat(2, 1fr); }
          .pagination { flex-direction: column; gap: 10px; align-items: flex-start; }
        }
      `}</style>

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>সদস্য তালিকা</h1>
          <p>মোট ১৪২ জন সদস্য নিবন্ধিত</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          নতুন সদস্য যোগ
        </button>
      </div>

      {/* Stat bar */}
      <div className="stat-bar">
        <div className="stat-cell">
          <span className="stat-cell-label">ইনতিফাদাহ সদস্য</span>
          <span className="stat-cell-value clr-info">৩৮</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell-label">সাধারণ সদস্য</span>
          <span className="stat-cell-value clr-muted">৮৬</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell-label">সংগঠন</span>
          <span className="stat-cell-value clr-success">১৮</span>
        </div>
        <div className="stat-cell">
          <span className="stat-cell-label">মুলতবি</span>
          <span className="stat-cell-value clr-warning">৭</span>
        </div>
      </div>

      {/* Filter bar */}
      <div className="card filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            className="input search-input"
            placeholder="নাম, মোবাইল বা আইডি দিয়ে খুঁজুন..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">সকল ইউজার টাইপ</option>
          <option value="ইনতিফাদাহ">ইনতিফাদাহ সদস্য</option>
          <option value="সাধারণ">সাধারণ</option>
          <option value="সংগঠন">সংগঠন</option>
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">সকল অবস্থা</option>
          <option value="সক্রিয়">সক্রিয়</option>
          <option value="নিষ্ক্রিয়">নিষ্ক্রিয়</option>
          <option value="মুলতবি">মুলতবি</option>
        </select>
        <select className="filter-select" value={sortSelect} onChange={e => setSortSelect(e.target.value)}>
          <option value="date">যোগদানের তারিখ</option>
          <option value="name">নাম</option>
          <option value="savings">সঞ্চয়</option>
          <option value="loan">ঋণ</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={resetFilters}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.15"/></svg>
          ফিল্টার রিসেট
        </button>
      </div>

      {/* Members Table */}
      <div className="card table-card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{width:'40px'}}>
                  <input type="checkbox" className="checkbox" checked={selectAll} onChange={e => setSelectAll(e.target.checked)} />
                </th>
                <th>সদস্য</th>
                <th className="hide-mobile">মোবাইল</th>
                <th>টাইপ</th>
                <th className="hide-mobile">যোগদান</th>
                <th className="hide-mobile">মোট সঞ্চয়</th>
                <th className="hide-mobile">মোট দান</th>
                <th className="hide-mobile">সক্রিয় ঋণ</th>
                <th>অবস্থা</th>
                <th style={{textAlign:'right'}}>কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="empty-state">
                      <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{color:'var(--muted)',margin:'0 auto',display:'block'}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      <p>কোনো সদস্য পাওয়া যায়নি</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((m, i) => {
                const av = avColorClasses[i % 4]
                return (
                  <tr key={m.id}>
                    <td><input type="checkbox" className="checkbox" checked={selectAll} readOnly /></td>
                    <td>
                      <div className="member-cell">
                        <div className={`avatar ${av}`}>{getInitials(m.name)}</div>
                        <div>
                          <div className="member-name">{m.name}</div>
                          <div className="member-id">{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile" style={{color:'var(--fg-2)'}}>{m.phone}</td>
                    <td><TypeBadge type={m.type} /></td>
                    <td className="hide-mobile" style={{color:'var(--muted)', fontSize:'12px'}}>{m.joined}</td>
                    <td className="hide-mobile money" style={{fontWeight:600, color:'var(--fg)'}}>{m.savings}</td>
                    <td className="hide-mobile money" style={{color:'var(--fg-2)'}}>{m.donation}</td>
                    <td className="hide-mobile money" style={{color: m.loan === '—' ? 'var(--muted)' : 'var(--warning)'}}>{m.loan}</td>
                    <td><StatusBadge status={m.status} /></td>
                    <td style={{textAlign:'right'}}>
                      <div className="action-btns" style={{justifyContent:'flex-end'}}>
                        <button className="icon-btn" title="বিস্তারিত দেখুন">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button className="icon-btn" title="সম্পাদনা করুন">
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button className="icon-btn" title="আরো বিকল্প">
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span className="pagination-info">
            ১–{Math.min(12, filtered.length)} দেখানো হচ্ছে, মোট {filtered.length} জন
          </span>
          <div className="pagination-btns">
            <button className="page-btn" onClick={() => changePage(-1)} disabled={currentPage === 1}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            {([1,2,3] as const).map((p, idx) => (
              <button key={p} className={`page-btn${currentPage===p?' active':''}`} onClick={() => setCurrentPage(p)}>
                {['১','২','৩'][idx]}
              </button>
            ))}
            <span className="page-btn" style={{border:'none',cursor:'default'}}>…</span>
            <button className={`page-btn${currentPage===12?' active':''}`} onClick={() => setCurrentPage(12)}>১২</button>
            <button className="page-btn" onClick={() => changePage(1)} disabled={currentPage === 12}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      <div className={`modal-backdrop${modalOpen ? ' open' : ''}`} onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }}>
        <div className="modal">
          <div className="modal-header">
            <h2>নতুন সদস্য যোগ করুন</h2>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group-m">
                <label className="form-label-m">পুরো নাম <span className="req">*</span></label>
                <input type="text" className="input" placeholder="যেমন: আবদুল করিম" />
              </div>
              <div className="form-group-m">
                <label className="form-label-m">মোবাইল নম্বর <span className="req">*</span></label>
                <input type="tel" className="input" placeholder="01XXX-XXXXXX" />
              </div>
              <div className="form-group-m">
                <label className="form-label-m">ইমেইল <span style={{color:'var(--muted)', fontWeight:400}}>(ঐচ্ছিক)</span></label>
                <input type="email" className="input" placeholder="example@email.com" />
              </div>
              <div className="form-group-m">
                <label className="form-label-m">লিঙ্গ</label>
                <div className="radio-group">
                  <label className="radio-label"><input type="radio" name="gender" value="male" defaultChecked /> পুরুষ</label>
                  <label className="radio-label"><input type="radio" name="gender" value="female" /> মহিলা</label>
                </div>
              </div>
              <div className="form-group-m">
                <label className="form-label-m">ওয়ার্ড নং</label>
                <input type="text" className="input" placeholder="যেমন: ৫" />
              </div>
              <div className="form-group-m">
                <label className="form-label-m">ইউজার টাইপ <span className="req">*</span></label>
                <select className="input filter-select" style={{backgroundColor:'var(--surface)'}}>
                  <option value="">-- নির্বাচন করুন --</option>
                  <option>ইনতিফাদাহ সদস্য</option>
                  <option>সাধারণ</option>
                  <option>সংগঠন</option>
                </select>
              </div>
              <div className="form-group-m full">
                <label className="form-label-m">ঠিকানা</label>
                <textarea className="input" rows={2} placeholder="বাড়ি নং, রাস্তা, এলাকা..."></textarea>
              </div>
              <div className="form-group-m full">
                <label className="form-label-m">ছবি আপলোড</label>
                <label className="file-input-wrap" htmlFor="photoInput">
                  <input type="file" id="photoInput" accept="image/*" style={{display:'none'}} onChange={e => {
                    if (e.target.files?.[0]) setFileName(e.target.files[0].name)
                  }} />
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{margin:'0 auto 6px', display:'block', color:'var(--muted)'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="file-input-text">
                    {fileName ? <strong>{fileName}</strong> : <><strong>ক্লিক করুন</strong> বা ছবি টেনে আনুন</>}
                  </p>
                  <p className="file-input-text" style={{marginTop:'3px'}}>PNG, JPG — সর্বোচ্চ ২MB</p>
                </label>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>বাতিল</button>
            <button className="btn btn-primary" onClick={submitMember}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              সদস্য যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast-m${toast.visible ? ' show' : ''}`}>{toast.msg}</div>
    </>
  )
}
