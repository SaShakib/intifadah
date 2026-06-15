'use client'

import { useState, useEffect, useCallback } from 'react'

interface Row {
  date: string; name: string; initial: string; color: string; type: string; amount: string; status: string
}

const initialRows: Row[] = [
  { date:'১৫ জুন ২০২৬', name:'মো. রহিম উদ্দিন',    initial:'র', color:'200', type:'দান',   amount:'৳৫,০০০',  status:'জমা হয়েছে' },
  { date:'১৫ জুন ২০২৬', name:'সালমা বেগম',          initial:'স', color:'280', type:'সঞ্চয়', amount:'৳৩,০০০',  status:'জমা হয়েছে' },
  { date:'১৪ জুন ২০২৬', name:'আবদুল করিম',          initial:'আ', color:'50',  type:'দান',   amount:'৳২,৫০০',  status:'জমা হয়েছে' },
  { date:'১৪ জুন ২০২৬', name:'নাসরিন আক্তার',       initial:'ন', color:'320', type:'সঞ্চয়', amount:'৳৪,০০০',  status:'অপেক্ষমান' },
  { date:'১৩ জুন ২০২৬', name:'ইব্রাহিম শেখ',        initial:'ই', color:'120', type:'দান',   amount:'৳১০,০০০', status:'জমা হয়েছে' },
  { date:'১৩ জুন ২০২৬', name:'রহিমা খাতুন',         initial:'র', color:'170', type:'সঞ্চয়', amount:'৳৫,৫০০',  status:'জমা হয়েছে' },
  { date:'১২ জুন ২০২৬', name:'আমির হোসেন',          initial:'আ', color:'30',  type:'দান',   amount:'৳৩,০০০',  status:'জমা হয়েছে' },
  { date:'১২ জুন ২০২৬', name:'জান্নাতুন নিসা',      initial:'জ', color:'230', type:'সঞ্চয়', amount:'৳৮,০০০',  status:'অপেক্ষমান' },
  { date:'১১ জুন ২০২৬', name:'মো. হাবিবুর রহমান',  initial:'হ', color:'100', type:'দান',   amount:'৳৬,০০০',  status:'জমা হয়েছে' },
  { date:'১১ জুন ২০২৬', name:'ফাতেমা বেগম',         initial:'ফ', color:'350', type:'সঞ্চয়', amount:'৳২,৫০০',  status:'জমা হয়েছে' },
  { date:'১০ জুন ২০২৬', name:'মো. আরিফ হোসেন',     initial:'আ', color:'65',  type:'দান',   amount:'৳৭,৫০০',  status:'জমা হয়েছে' },
  { date:'১০ জুন ২০২৬', name:'সুমাইয়া খানম',       initial:'স', color:'195', type:'সঞ্চয়', amount:'৳৪,২০০',  status:'জমা হয়েছে' },
]

const ROWS_PER_PAGE = 8

export default function FundCollectionPage() {
  const [allRows, setAllRows] = useState<Row[]>(initialRows)
  const [typeFilter, setTypeFilter] = useState('all')
  const [memberFilter, setMemberFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortCol, setSortCol] = useState<string|null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [newCollectionOpen, setNewCollectionOpen] = useState(false)
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [viewRow, setViewRow] = useState<Row|null>(null)
  const [toast, setToast] = useState<{msg:string,type:string,visible:boolean}>({msg:'',type:'',visible:false})

  // Form state
  const [modalMember, setModalMember] = useState('')
  const [modalType, setModalType] = useState('')
  const [modalAmount, setModalAmount] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalNote, setModalNote] = useState('')

  useEffect(() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth()+1).padStart(2,'0')
    const d = String(today.getDate()).padStart(2,'0')
    setModalDate(`${y}-${m}-${d}`)
  }, [])

  const showToast = useCallback((msg: string, type = '') => {
    setToast({msg, type, visible:true})
    setTimeout(() => setToast(t => ({...t, visible:false})), 2400)
  }, [])

  let filteredRows = allRows.filter(r => {
    const typeMatch = typeFilter === 'all' || r.type === typeFilter
    const nameMatch = memberFilter === '' || r.name.includes(memberFilter)
    return typeMatch && nameMatch
  })

  if (sortCol) {
    const col = sortCol
    filteredRows = [...filteredRows].sort((a, b) => {
      const va = (a as unknown as Record<string,string>)[col] || ''
      const vb = (b as unknown as Record<string,string>)[col] || ''
      return sortDir === 'asc' ? va.localeCompare(vb, 'bn') : vb.localeCompare(va, 'bn')
    })
  }

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / ROWS_PER_PAGE))
  const pageRows = filteredRows.slice((currentPage-1)*ROWS_PER_PAGE, currentPage*ROWS_PER_PAGE)

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  const changePage = (dir: number) => {
    setCurrentPage(p => Math.max(1, Math.min(totalPages, p + dir)))
  }

  const submitCollection = () => {
    if (!modalMember || !modalType || !modalAmount || !modalDate) {
      showToast('সব প্রয়োজনীয় তথ্য পূরণ করুন', 'danger')
      return
    }
    const bnAmount = '৳' + parseInt(modalAmount).toLocaleString('bn-BD')
    const newRow: Row = { date:'আজ', name:modalMember, initial:modalMember.charAt(0), color:'354', type:modalType, amount:bnAmount, status:'অপেক্ষমান' }
    setAllRows(prev => [newRow, ...prev])
    setCurrentPage(1)
    setNewCollectionOpen(false)
    showToast('✓ কালেকশন সফলভাবে যোগ করা হয়েছে', 'success')
    setModalMember(''); setModalType(''); setModalAmount(''); setModalNote('')
  }

  const openViewRow = (row: Row) => {
    setViewRow(row)
    setViewModalOpen(true)
  }

  const thClass = (col: string) => {
    if (sortCol !== col) return ''
    return sortDir === 'asc' ? 'sort-asc' : 'sort-desc'
  }

  return (
    <>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card { padding: 20px; }
        .stat-icon { width: 40px; height: 40px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.03em; }
        .stat-value { font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; color: var(--fg); }
        .stat-delta { font-size: 12px; margin-top: 6px; color: var(--muted); }
        .stat-delta.up { color: var(--success); }
        .filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 0; flex-wrap: wrap; }
        .filter-btn { padding: 7px 14px; border-radius: 99px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: var(--surface); color: var(--muted); transition: all 0.13s; font-family: var(--font); }
        .filter-btn:hover { border-color: var(--brand); color: var(--brand); }
        .filter-btn.active { background: var(--brand); border-color: var(--brand); color: #fff; }
        .search-wrap-f { position: relative; flex: 1; min-width: 180px; max-width: 280px; }
        .search-wrap-f svg { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
        .search-wrap-f .input { padding-left: 32px; }
        .table-sort-asc::after { content: " ↑"; color: var(--brand); }
        .table-sort-desc::after { content: " ↓"; color: var(--brand); }
        .pagination { display: flex; align-items: center; gap: 4px; padding: 16px 18px; border-top: 1px solid var(--border); justify-content: flex-end; }
        .page-btn-f { padding: 6px 11px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--fg-2); font-size: 13px; cursor: pointer; font-family: var(--font); transition: all 0.12s; }
        .page-btn-f:hover { border-color: var(--brand); color: var(--brand); }
        .page-btn-f.active { background: var(--brand); border-color: var(--brand); color: #fff; }
        .page-btn-f:disabled { opacity: 0.4; cursor: not-allowed; }
        .modal-backdrop-f { display: none; position: fixed; inset: 0; background: oklch(10% 0.01 300 / 0.5); z-index: 900; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .modal-backdrop-f.open { display: flex; }
        .modal-f { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.20); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: modalIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes modalIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-header-f { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .modal-title-f { font-size: 16px; font-weight: 700; color: var(--fg); }
        .modal-close-f { background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px; border-radius: 6px; transition: all 0.12s; display: flex; }
        .modal-close-f:hover { background: var(--surface-2); color: var(--fg); }
        .modal-body-f { padding: 20px 24px; }
        .modal-footer-f { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
        .form-group-f { margin-bottom: 16px; }
        .form-label-f { font-size: 13px; font-weight: 600; color: var(--fg-2); margin-bottom: 6px; display: block; }
        .form-label-f span { color: var(--danger); }
        .input-prefix { display: flex; }
        .input-prefix-text { padding: 10px 12px; background: var(--surface-2); border: 1px solid var(--border); border-right: none; border-radius: var(--r-sm) 0 0 var(--r-sm); color: var(--muted); font-size: 14px; font-weight: 600; white-space: nowrap; display: flex; align-items: center; }
        .input-prefix .input { border-radius: 0 var(--r-sm) var(--r-sm) 0; }
        .toast-f { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.2s, transform 0.2s; white-space: nowrap; box-shadow: var(--sh); }
        .toast-f.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .toast-f.success { background: oklch(38% 0.14 145); }
        .toast-f.danger  { background: oklch(42% 0.18 25); }
        select.input-sel { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          #mainGrid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Page header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'22px',gap:'12px',flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:700,color:'var(--fg)'}}>ফান্ড / কালেকশন</h1>
          <p style={{color:'var(--muted)',fontSize:'13px',marginTop:'3px'}}>সমস্ত আর্থিক সংগ্রহের রেকর্ড ও ব্যবস্থাপনা</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewCollectionOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          নতুন কালেকশন এন্ট্রি
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'oklch(94% 0.05 354)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5.5" width="16" height="11" rx="2" stroke="oklch(50% 0.26 354)" strokeWidth="1.6"/><path d="M6.5 5.5V4a3.5 3.5 0 017 0v1.5" stroke="oklch(50% 0.26 354)" strokeWidth="1.5" strokeLinecap="round"/><path d="M6 11h8" stroke="oklch(50% 0.26 354)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="stat-label">মোট কালেকশন</div>
          <div className="stat-value money">৳১২,৩০,০০০</div>
          <div className="stat-delta up">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            সর্বমোট জমা
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--info-bg)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="var(--info)" strokeWidth="1.6"/><path d="M10 6v5l3 2" stroke="var(--info)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="stat-label">এই মাসে কালেকশন</div>
          <div className="stat-value money">৳৪৫,৫০০</div>
          <div className="stat-delta up">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +১২% গত মাসের তুলনায়
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--success-bg)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="var(--success)" strokeWidth="1.6"/><path d="M2 8h16" stroke="var(--success)" strokeWidth="1.5"/><path d="M6 12.5h4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div className="stat-label">এই সপ্তাহে</div>
          <div className="stat-value money">৳১২,২০০</div>
          <div className="stat-delta up">
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +৫% গত সপ্তাহের চেয়ে
          </div>
        </div>
        <div className="card stat-card" style={{background:'linear-gradient(135deg, var(--brand) 0%, var(--brand-mid) 100%)',border:'none',boxShadow:'0 4px 16px oklch(50% 0.26 354 / 0.3)'}}>
          <div className="stat-icon" style={{background:'oklch(100% 0 0 / 0.18)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="4" stroke="rgba(255,255,255,0.9)" strokeWidth="1.6"/><path d="M2 17c0-3.314 2.686-6 6-6" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round"/><circle cx="15" cy="7" r="3" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5"/><path d="M18 17a3.5 3.5 0 00-3.5-3.5" stroke="rgba(255,255,255,0.9)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="stat-label" style={{color:'rgba(255,255,255,0.75)'}}>মোট জমাকারী সদস্য</div>
          <div className="stat-value" style={{color:'#fff'}}>১৩৮</div>
          <div className="stat-delta" style={{color:'rgba(255,255,255,0.7)'}}>সক্রিয় অবদানকারী</div>
        </div>
      </div>

      {/* Two column grid */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:'18px',alignItems:'start'}} id="mainGrid">

        {/* Left: Filter + Table */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Filter row */}
          <div className="card" style={{padding:'14px 16px'}}>
            <div className="filter-row">
              <span style={{fontSize:'13px',fontWeight:600,color:'var(--fg-2)',whiteSpace:'nowrap'}}>খাত:</span>
              {['all','দান','সঞ্চয়'].map(v => (
                <button key={v} className={`filter-btn${typeFilter===v?' active':''}`} onClick={() => { setTypeFilter(v); setCurrentPage(1) }}>
                  {v === 'all' ? 'সব' : v}
                </button>
              ))}
              <div style={{flex:1}}></div>
              <div style={{position:'relative'}} className="hide-mobile">
                <input type="date" className="input" style={{width:'160px',fontSize:'13px'}} title="তারিখ ফিল্টার" />
              </div>
              <div className="search-wrap-f">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4"/><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                <input type="search" className="input" placeholder="সদস্য সার্চ..." style={{fontSize:'13px'}} value={memberFilter} onChange={e => { setMemberFilter(e.target.value); setCurrentPage(1) }} />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card" style={{overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <span style={{fontSize:'14px',fontWeight:700,color:'var(--fg)'}}>কালেকশন তালিকা</span>
              <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                <span style={{fontSize:'12px',color:'var(--muted)'}}>মোট {filteredRows.length}টি</span>
                <button className="btn btn-ghost btn-sm" onClick={() => showToast('এক্সেল ডাউনলোড হচ্ছে...')}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 8.5V11H3.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 1.5v6.5M4 5.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  রপ্তানি
                </button>
              </div>
            </div>

            <div style={{overflowX:'auto'}}>
              <table className="table">
                <thead>
                  <tr>
                    <th className={sortCol==='date'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('date')}>তারিখ</th>
                    <th className={sortCol==='name'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('name')}>সদস্যের নাম</th>
                    <th className={sortCol==='type'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('type')}>খাত</th>
                    <th className={sortCol==='amount'?`table-sort-${sortDir}`:''} style={{cursor:'pointer',textAlign:'right'}} onClick={() => handleSort('amount')}>পরিমাণ</th>
                    <th className={sortCol==='status'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('status')}>স্ট্যাটাস</th>
                    <th style={{cursor:'default'}}>অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign:'center',padding:'32px',color:'var(--muted)'}}>কোনো ডেটা পাওয়া যায়নি</td></tr>
                  ) : pageRows.map((r, i) => (
                    <tr key={i}>
                      <td style={{color:'var(--muted)',whiteSpace:'nowrap',fontSize:'12px'}}>{r.date}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
                          <div className="avatar" style={{background:`oklch(92% 0.04 ${r.color})`,color:`oklch(40% 0.12 ${r.color})`,width:'30px',height:'30px',fontSize:'12px'}}>{r.initial}</div>
                          <span style={{fontWeight:500}}>{r.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${r.type === 'দান' ? 'badge-success' : 'badge-info'}`} style={{fontSize:'11px'}}>{r.type}</span>
                      </td>
                      <td style={{textAlign:'right',fontWeight:700}} className="money">{r.amount}</td>
                      <td>
                        {r.status === 'জমা হয়েছে' ? (
                          <span className="badge badge-success" style={{fontSize:'11px'}}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5.5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            {r.status}
                          </span>
                        ) : (
                          <span className="badge badge-warning" style={{fontSize:'11px'}}>
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2"/><path d="M5 3v2.2l1.2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                            {r.status}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{display:'flex',gap:'5px'}}>
                          <button className="btn btn-ghost btn-xs" onClick={() => openViewRow(r)} title="দেখুন">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                            দেখুন
                          </button>
                          <button className="btn btn-ghost btn-xs" onClick={() => showToast('সম্পাদনা মোড চালু হয়েছে')} title="সম্পাদন">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2L4.5 10.5l-2.5.5.5-2.5L9 2z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            সম্পাদন
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span style={{fontSize:'12px',color:'var(--muted)',marginRight:'8px'}}>পৃষ্ঠা {currentPage} / {totalPages}</span>
              <button className="page-btn-f" disabled={currentPage<=1} onClick={() => changePage(-1)}>‹</button>
              {Array.from({length: Math.min(totalPages, 2)}, (_, idx) => idx+1).map(p => (
                <button key={p} className={`page-btn-f${currentPage===p?' active':''}`} onClick={() => setCurrentPage(p)}>
                  {['১','২'][p-1]}
                </button>
              ))}
              <button className="page-btn-f" disabled={currentPage>=totalPages} onClick={() => changePage(1)}>›</button>
            </div>
          </div>
        </div>

        {/* Right: Chart + Summary */}
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div className="card" style={{padding:'18px'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'18px'}}>
              <div>
                <div style={{fontSize:'14px',fontWeight:700,color:'var(--fg)'}}>মাসিক কালেকশন</div>
                <div style={{fontSize:'12px',color:'var(--muted)',marginTop:'2px'}}>জানুয়ারি–জুন ২০২৬</div>
              </div>
              <span style={{fontSize:'11px',color:'var(--muted)',background:'var(--surface-2)',padding:'3px 8px',borderRadius:'6px',border:'1px solid var(--border)'}}>হাজার ৳</span>
            </div>
            <div style={{position:'relative'}}>
              {/* Grid lines */}
              <div style={{position:'absolute',left:0,right:0,top:0,bottom:'28px',display:'flex',flexDirection:'column',justifyContent:'space-between',pointerEvents:'none'}}>
                {[0,1,2,3].map(i => <div key={i} style={{borderTop:'1px dashed var(--border)',width:'100%'}}></div>)}
              </div>
              <div style={{display:'flex',alignItems:'flex-end',gap:'8px',height:'160px',paddingBottom:'28px',position:'relative'}}>
                {[
                  {val:81, label:'জানু', h:'81%', bg:'var(--brand-light)', border:'1px solid oklch(90% 0.07 354)', labelColor:'var(--muted)', valColor:'var(--muted)', num:'৮৫'},
                  {val:69, label:'ফেব্রু', h:'69%', bg:'var(--brand-light)', border:'1px solid oklch(90% 0.07 354)', labelColor:'var(--muted)', valColor:'var(--muted)', num:'৭২'},
                  {val:93, label:'মার্চ', h:'93%', bg:'var(--brand-light)', border:'1px solid oklch(90% 0.07 354)', labelColor:'var(--muted)', valColor:'var(--muted)', num:'৯৮'},
                  {val:87, label:'এপ্রিল', h:'87%', bg:'var(--brand-light)', border:'1px solid oklch(90% 0.07 354)', labelColor:'var(--muted)', valColor:'var(--muted)', num:'৯১'},
                  {val:100, label:'মে', h:'100%', bg:'var(--brand)', border:'none', labelColor:'var(--brand)', valColor:'var(--brand)', num:'১০৫'},
                  {val:43, label:'জুন', h:'43%', bg:'repeating-linear-gradient(45deg, var(--accent-light), var(--accent-light) 3px, oklch(92% 0.08 55) 3px, oklch(92% 0.08 55) 6px)', border:'1.5px solid var(--accent)', labelColor:'var(--accent)', valColor:'var(--accent)', num:'৪৫'},
                ].map((bar, i) => (
                  <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',height:'100%',justifyContent:'flex-end'}}>
                    <span style={{fontSize:'10px',color:bar.valColor,fontWeight:i===4?700:600}}>{bar.num}</span>
                    <div style={{width:'100%',height:bar.h,background:bar.bg,borderRadius:'5px 5px 0 0',border:bar.border,transition:'opacity 0.15s',boxShadow:i===4?'0 2px 8px oklch(50% 0.26 354 / 0.3)':undefined}}></div>
                    <span style={{position:'absolute',bottom:'6px',fontSize:'10px',color:bar.labelColor,fontWeight:i===4?600:400}}>{bar.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:'14px',marginTop:'12px',justifyContent:'center'}}>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'var(--muted)'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'3px',background:'var(--brand)'}}></div>
                সম্পন্ন
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'5px',fontSize:'11px',color:'var(--muted)'}}>
                <div style={{width:'10px',height:'10px',borderRadius:'3px',background:'repeating-linear-gradient(45deg, var(--accent-light), var(--accent-light) 3px, oklch(92% 0.08 55) 3px, oklch(92% 0.08 55) 6px)',border:'1px solid var(--accent)'}}></div>
                চলমান
              </div>
            </div>
          </div>

          {/* Quick summary */}
          <div className="card" style={{padding:'16px 18px'}}>
            <div style={{fontSize:'13px',fontWeight:700,color:'var(--fg)',marginBottom:'12px'}}>দ্রুত সারসংক্ষেপ</div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px'}}>
                <span style={{color:'var(--fg-2)'}}>দান কালেকশন</span>
                <span className="money" style={{fontWeight:600,color:'var(--success)'}}>৳৭,৮০,০০০</span>
              </div>
              <div style={{height:'6px',background:'var(--surface-2)',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:'63%',background:'var(--success)',borderRadius:'3px'}}></div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',fontSize:'13px'}}>
                <span style={{color:'var(--fg-2)'}}>সঞ্চয় কালেকশন</span>
                <span className="money" style={{fontWeight:600,color:'var(--brand)'}}>৳৪,৫০,০০০</span>
              </div>
              <div style={{height:'6px',background:'var(--surface-2)',borderRadius:'3px',overflow:'hidden'}}>
                <div style={{height:'100%',width:'37%',background:'var(--brand)',borderRadius:'3px'}}></div>
              </div>
              <div style={{borderTop:'1px solid var(--border)',paddingTop:'10px',display:'flex',justifyContent:'space-between',fontSize:'13px'}}>
                <span style={{color:'var(--muted)'}}>মোট</span>
                <span className="money" style={{fontWeight:700,color:'var(--fg)'}}>৳১২,৩০,০০০</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Collection Modal */}
      <div className={`modal-backdrop-f${newCollectionOpen?' open':''}`} onClick={e => { if (e.target === e.currentTarget) setNewCollectionOpen(false) }}>
        <div className="modal-f">
          <div className="modal-header-f">
            <span className="modal-title-f">নতুন কালেকশন এন্ট্রি</span>
            <button className="modal-close-f" onClick={() => setNewCollectionOpen(false)} aria-label="বন্ধ করুন">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="modal-body-f">
            <div className="form-group-f">
              <label className="form-label-f">সদস্য নির্বাচন <span>*</span></label>
              <select className="input input-sel" value={modalMember} onChange={e => setModalMember(e.target.value)}>
                <option value="">— সদস্য বেছে নিন —</option>
                {['মো. রহিম উদ্দিন','সালমা বেগম','আবদুল করিম','নাসরিন আক্তার','ইব্রাহিম শেখ','রহিমা খাতুন','আমির হোসেন','জান্নাতুন নিসা','মো. হাবিবুর রহমান','ফাতেমা বেগম','মো. আরিফ হোসেন','সুমাইয়া খানম'].map(n => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="form-group-f">
              <label className="form-label-f">খাত নির্বাচন <span>*</span></label>
              <select className="input input-sel" value={modalType} onChange={e => setModalType(e.target.value)}>
                <option value="">— খাত বেছে নিন —</option>
                <option value="দান">দান</option>
                <option value="সঞ্চয়">সঞ্চয়</option>
              </select>
            </div>
            <div className="form-group-f">
              <label className="form-label-f">পরিমাণ <span>*</span></label>
              <div className="input-prefix">
                <span className="input-prefix-text">৳</span>
                <input type="number" className="input" placeholder="০" min={1} step={100} value={modalAmount} onChange={e => setModalAmount(e.target.value)} />
              </div>
            </div>
            <div className="form-group-f">
              <label className="form-label-f">তারিখ <span>*</span></label>
              <input type="date" className="input" value={modalDate} onChange={e => setModalDate(e.target.value)} />
            </div>
            <div className="form-group-f">
              <label className="form-label-f">নোট <span style={{color:'var(--muted)',fontWeight:400}}>(ঐচ্ছিক)</span></label>
              <textarea className="input" rows={3} placeholder="অতিরিক্ত তথ্য লিখুন..." style={{resize:'vertical'}} value={modalNote} onChange={e => setModalNote(e.target.value)}></textarea>
            </div>
          </div>
          <div className="modal-footer-f">
            <button className="btn btn-ghost" onClick={() => setNewCollectionOpen(false)}>বাতিল</button>
            <button className="btn btn-primary" onClick={submitCollection}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M12.5 4L6 11 2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              জমা দিন
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      <div className={`modal-backdrop-f${viewModalOpen?' open':''}`} onClick={e => { if (e.target === e.currentTarget) setViewModalOpen(false) }}>
        <div className="modal-f">
          <div className="modal-header-f">
            <span className="modal-title-f">কালেকশন বিস্তারিত</span>
            <button className="modal-close-f" onClick={() => setViewModalOpen(false)}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          {viewRow && (
            <div className="modal-body-f" style={{fontSize:'14px',lineHeight:2}}>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid var(--border)'}}>
                <div className="avatar" style={{background:`oklch(92% 0.04 ${viewRow.color})`,color:`oklch(40% 0.12 ${viewRow.color})`,width:'48px',height:'48px',fontSize:'18px'}}>{viewRow.initial}</div>
                <div>
                  <div style={{fontWeight:700,fontSize:'15px'}}>{viewRow.name}</div>
                  <div style={{fontSize:'12px',color:'var(--muted)'}}>{viewRow.date}</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div style={{background:'var(--surface-2)',borderRadius:'var(--r-sm)',padding:'12px'}}>
                  <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'4px'}}>খাত</div>
                  <div style={{fontWeight:600}}>{viewRow.type}</div>
                </div>
                <div style={{background:'var(--surface-2)',borderRadius:'var(--r-sm)',padding:'12px'}}>
                  <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'4px'}}>পরিমাণ</div>
                  <div style={{fontWeight:700,fontSize:'16px'}} className="money">{viewRow.amount}</div>
                </div>
                <div style={{background:'var(--surface-2)',borderRadius:'var(--r-sm)',padding:'12px',gridColumn:'1/-1'}}>
                  <div style={{fontSize:'11px',color:'var(--muted)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:'4px'}}>স্ট্যাটাস</div>
                  <span className={`badge ${viewRow.status === 'জমা হয়েছে' ? 'badge-success' : 'badge-warning'}`}>{viewRow.status}</span>
                </div>
              </div>
            </div>
          )}
          <div className="modal-footer-f">
            <button className="btn btn-ghost" onClick={() => setViewModalOpen(false)}>বন্ধ করুন</button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast-f${toast.visible?' show':''} ${toast.type}`}>{toast.msg}</div>
    </>
  )
}
