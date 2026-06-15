'use client'

import { useState, useEffect, useCallback } from 'react'

const repayData = [
  { date:'১৫ জুন ২০২৬', name:'মো. রহিম উদ্দিন',    initial:'র', color:'200', total:'৳৩০,০০০', totalNum:30000, paid:'৳১৫,০০০', paidNum:15000, remaining:'৳১৫,০০০', remainingNum:15000, installment:'৳৫,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'১৪ জুন ২০২৬', name:'নাসরিন আক্তার',      initial:'ন', color:'320', total:'৳৫০,০০০', totalNum:50000, paid:'৳২৭,৫০০', paidNum:27500, remaining:'৳২২,৫০০', remainingNum:22500, installment:'৳৫,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'১৩ জুন ২০২৬', name:'আবদুল করিম',         initial:'আ', color:'50',  total:'৳২০,০০০', totalNum:20000, paid:'৳১২,০০০', paidNum:12000, remaining:'৳৮,০০০',  remainingNum:8000,  installment:'৳৪,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'৩০ মে ২০২৬',  name:'মো. করিম উদ্দিন',   initial:'ম', color:'180', total:'৳২০,০০০', totalNum:20000, paid:'৳১২,০০০', paidNum:12000, remaining:'৳৮,০০০',  remainingNum:8000,  installment:'৳৪,০০০/মাস', status:'মেয়াদোত্তীর্ণ', overdue:true  },
  { date:'২৫ মে ২০২৬',  name:'সালমা বেগম',         initial:'স', color:'280', total:'৳৩০,০০০', totalNum:30000, paid:'৳১৮,০০০', paidNum:18000, remaining:'৳১২,০০০', remainingNum:12000, installment:'৳৬,০০০/মাস', status:'মেয়াদোত্তীর্ণ', overdue:true  },
  { date:'১৩ জুন ২০২৬', name:'ইব্রাহিম শেখ',       initial:'ই', color:'120', total:'৳৪০,০০০', totalNum:40000, paid:'৳১০,০০০', paidNum:10000, remaining:'৳৩০,০০০', remainingNum:30000, installment:'৳৫,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'১২ জুন ২০২৬', name:'জান্নাতুন নিসা',    initial:'জ', color:'230', total:'৳২৫,০০০', totalNum:25000, paid:'৳১৩,০০০', paidNum:13000, remaining:'৳১২,০০০', remainingNum:12000, installment:'৳৩,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'১১ জুন ২০২৬', name:'মো. হাবিবুর রহমান', initial:'হ', color:'100', total:'৳১৫,০০০', totalNum:15000, paid:'৳৯,৫০০',  paidNum:9500,  remaining:'৳৫,৫০০',  remainingNum:5500,  installment:'৳২,৫০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'১০ জুন ২০২৬', name:'ফাতেমা বেগম',        initial:'ফ', color:'350', total:'৳৩৫,০০০', totalNum:35000, paid:'৳১৭,০০০', paidNum:17000, remaining:'৳১৮,০০০', remainingNum:18000, installment:'৳৫,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'০৯ জুন ২০২৬', name:'আমির হোসেন',         initial:'আ', color:'30',  total:'৳২৫,০০০', totalNum:25000, paid:'৳২০,০০০', paidNum:20000, remaining:'৳৫,০০০',  remainingNum:5000,  installment:'৳৫,০০০/মাস', status:'সক্রিয়',          overdue:false },
  { date:'০৮ জুন ২০২৬', name:'রহিমা খাতুন',        initial:'র', color:'170', total:'৳২০,০০০', totalNum:20000, paid:'৳২০,০০০', paidNum:20000, remaining:'৳০',      remainingNum:0,     installment:'সম্পূর্ণ',   status:'সম্পন্ন',         overdue:false },
  { date:'০৭ জুন ২০২৬', name:'মো. আরিফ হোসেন',    initial:'আ', color:'65',  total:'৳১৮,০০০', totalNum:18000, paid:'৳১৮,০০০', paidNum:18000, remaining:'৳০',      remainingNum:0,     installment:'সম্পূর্ণ',   status:'সম্পন্ন',         overdue:false },
]

type Tab = 'all' | 'installment' | 'overdue'
type Row = typeof repayData[0]

export default function LoanRepaymentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [sortCol, setSortCol] = useState<string|null>(null)
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('asc')
  const [newRepaymentOpen, setNewRepaymentOpen] = useState(false)
  const [toast, setToast] = useState<{msg:string,type:string,visible:boolean}>({msg:'',type:'',visible:false})

  // Modal form
  const [modalLoan, setModalLoan] = useState('')
  const [modalAmount, setModalAmount] = useState('')
  const [modalDate, setModalDate] = useState('')
  const [modalReceipt, setModalReceipt] = useState('')
  const [payMethod, setPayMethod] = useState('নগদ')

  useEffect(() => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth()+1).padStart(2,'0')
    const d = String(today.getDate()).padStart(2,'0')
    setModalDate(`${y}-${m}-${d}`)
  }, [])

  const showToast = useCallback((msg: string, type = '') => {
    setToast({msg, type, visible:true})
    setTimeout(() => setToast(t => ({...t, visible:false})), 2600)
  }, [])

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  let tableData = [...repayData]
  if (sortCol) {
    tableData.sort((a, b) => {
      const va = (a as Record<string,unknown>)[sortCol] as string || ''
      const vb = (b as Record<string,unknown>)[sortCol] as string || ''
      return sortDir === 'asc' ? String(va).localeCompare(String(vb), 'bn') : String(vb).localeCompare(String(va), 'bn')
    })
  }

  const submitRepayment = () => {
    if (!modalLoan || !modalAmount || !modalDate) {
      showToast('সব প্রয়োজনীয় তথ্য পূরণ করুন', 'danger')
      return
    }
    setNewRepaymentOpen(false)
    showToast(`✓ ৳${parseInt(modalAmount).toLocaleString('bn-BD')} ${payMethod} — পরিশোধ নিশ্চিত হয়েছে`, 'success')
    setModalLoan(''); setModalAmount(''); setModalReceipt('')
  }

  const StatusBadge = ({row}: {row:Row}) => {
    if (row.status === 'মেয়াদোত্তীর্ণ') return (
      <span className="badge badge-danger" style={{fontSize:'11px'}}>
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><circle cx="4.5" cy="4.5" r="4" stroke="currentColor" strokeWidth="1.1"/><path d="M4.5 2.5v2.5M4.5 6.5v.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
        {row.status}
      </span>
    )
    if (row.status === 'সম্পন্ন') return (
      <span className="badge badge-success" style={{fontSize:'11px'}}>
        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 4.5l1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {row.status}
      </span>
    )
    return <span className="badge badge-info" style={{fontSize:'11px'}}>{row.status}</span>
  }

  const activeLoans = repayData.filter(r => r.status === 'সক্রিয়' || r.status === 'মেয়াদোত্তীর্ণ')

  return (
    <>
      <style>{`
        .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }
        .stat-card { padding: 20px; }
        .stat-icon { width: 40px; height: 40px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
        .stat-label { font-size: 12px; color: var(--muted); font-weight: 600; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.03em; }
        .stat-value { font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; color: var(--fg); }
        .stat-delta { font-size: 12px; margin-top: 6px; color: var(--muted); }
        .progress-wrap-r { height: 6px; background: var(--surface-2); border-radius: 3px; overflow: hidden; margin-top: 4px; }
        .progress-bar-r { height: 100%; border-radius: 3px; transition: width 0.4s ease; }
        .overdue-card { background: var(--danger-bg); border: 1px solid oklch(88% 0.07 25); border-radius: var(--r); padding: 16px 18px; margin-bottom: 18px; }
        .overdue-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .tabs-r { display: flex; gap: 0; border-bottom: 2px solid var(--border); }
        .tab-r { padding: 10px 18px; font-size: 13px; font-weight: 500; color: var(--muted); cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; white-space: nowrap; user-select: none; }
        .tab-r.active { color: var(--brand); border-bottom-color: var(--brand); }
        .tab-r:hover:not(.active) { color: var(--fg-2); }
        .table-sort-asc::after { content: " ↑"; color: var(--brand); }
        .table-sort-desc::after { content: " ↓"; color: var(--brand); }
        .overdue-row td { background: var(--danger-bg) !important; }
        .overdue-row:hover td { background: oklch(94% 0.06 25) !important; }
        .modal-backdrop-r { display: none; position: fixed; inset: 0; background: oklch(10% 0.01 300 / 0.5); z-index: 900; align-items: center; justify-content: center; padding: 16px; backdrop-filter: blur(4px); }
        .modal-backdrop-r.open { display: flex; }
        .modal-r { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.20); width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; animation: modalInR 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes modalInR { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .modal-header-r { padding: 20px 24px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
        .modal-title-r { font-size: 16px; font-weight: 700; color: var(--fg); }
        .modal-close-r { background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px; border-radius: 6px; transition: all 0.12s; display: flex; }
        .modal-close-r:hover { background: var(--surface-2); color: var(--fg); }
        .modal-body-r { padding: 20px 24px; }
        .modal-footer-r { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
        .form-group-r { margin-bottom: 16px; }
        .form-label-r { font-size: 13px; font-weight: 600; color: var(--fg-2); margin-bottom: 6px; display: block; }
        .form-label-r span.req { color: var(--danger); }
        .form-label-r span.opt { color: var(--muted); font-weight: 400; }
        .input-prefix-r { display: flex; }
        .input-prefix-text-r { padding: 10px 12px; background: var(--surface-2); border: 1px solid var(--border); border-right: none; border-radius: var(--r-sm) 0 0 var(--r-sm); color: var(--muted); font-size: 14px; font-weight: 600; white-space: nowrap; display: flex; align-items: center; }
        .input-prefix-r .input { border-radius: 0 var(--r-sm) var(--r-sm) 0; }
        select.input-sel-r { appearance: none; background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .radio-group-r { display: flex; gap: 10px; flex-wrap: wrap; }
        .radio-option-r { display: flex; align-items: center; gap: 8px; padding: 9px 14px; border: 1.5px solid var(--border); border-radius: var(--r-sm); cursor: pointer; transition: all 0.13s; flex: 1; min-width: 80px; }
        .radio-option-r.selected { border-color: var(--brand); background: var(--brand-light); }
        .radio-option-r input { accent-color: var(--brand); }
        .radio-option-r label { cursor: pointer; font-size: 13px; font-weight: 500; }
        .toast-r { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--fg); color: #fff; padding: 12px 22px; border-radius: 10px; font-size: 13px; font-weight: 500; z-index: 9999; pointer-events: none; opacity: 0; transition: opacity 0.2s, transform 0.2s; white-space: nowrap; box-shadow: var(--sh); }
        .toast-r.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .toast-r.success { background: oklch(38% 0.14 145); }
        .toast-r.danger  { background: oklch(42% 0.18 25); }
        @media (max-width: 768px) {
          .stat-grid { grid-template-columns: repeat(2, 1fr); }
          .radio-group-r { flex-direction: column; }
        }
      `}</style>

      {/* Page header */}
      <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:'22px',gap:'12px',flexWrap:'wrap'}}>
        <div>
          <h1 style={{fontSize:'20px',fontWeight:700,color:'var(--fg)'}}>ঋণ ফেরত</h1>
          <p style={{color:'var(--muted)',fontSize:'13px',marginTop:'3px'}}>কিস্তি পরিশোধ ট্র্যাকিং ও ব্যবস্থাপনা</p>
        </div>
        <button className="btn btn-primary" onClick={() => setNewRepaymentOpen(true)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M7.5 2v11M2 7.5h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          নতুন ফেরত এন্ট্রি
        </button>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--warning-bg)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2C5.58 2 2 5.58 2 10s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" stroke="var(--warning)" strokeWidth="1.6"/><path d="M10 6v4.5l3 1.5" stroke="var(--warning)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="stat-label">মোট বকেয়া</div>
          <div className="stat-value money">৳২,৪৫,০০০</div>
          <div className="stat-delta" style={{color:'var(--warning)'}}>পরিশোধ বাকি</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--success-bg)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M17 8H3M12 3l5 5-5 5" stroke="var(--success)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M7 17h9a1 1 0 000-2H7" stroke="var(--success)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="stat-label">এই মাসে ফেরত</div>
          <div className="stat-value money">৳৩৮,৫০০</div>
          <div className="stat-delta" style={{color:'var(--success)'}}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 9V2M2 5l3.5-3 3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            +৮% গত মাসের তুলনায়
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon" style={{background:'var(--info-bg)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="5" width="16" height="12" rx="2" stroke="var(--info)" strokeWidth="1.6"/><path d="M2 10h16" stroke="var(--info)" strokeWidth="1.4"/><path d="M14 3v3M6 3v3" stroke="var(--info)" strokeWidth="1.4" strokeLinecap="round"/></svg>
          </div>
          <div className="stat-label">সক্রিয় ঋণ</div>
          <div className="stat-value">১৮টি</div>
          <div className="stat-delta">চলমান কিস্তি</div>
        </div>
        <div className="card stat-card" style={{background:'linear-gradient(135deg, var(--danger-bg) 0%, oklch(94% 0.06 25) 100%)',borderColor:'oklch(88% 0.07 25)'}}>
          <div className="stat-icon" style={{background:'oklch(91% 0.07 25)'}}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v6M10 14v.5" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round"/><circle cx="10" cy="10" r="8" stroke="var(--danger)" strokeWidth="1.6"/></svg>
          </div>
          <div className="stat-label" style={{color:'var(--danger)'}}>মেয়াদোত্তীর্ণ</div>
          <div className="stat-value" style={{color:'var(--danger)'}}>২টি</div>
          <div className="stat-delta" style={{color:'oklch(52% 0.18 25)'}}>অবিলম্বে ব্যবস্থা নিন</div>
        </div>
      </div>

      {/* Overdue warning card */}
      <div className="overdue-card">
        <div className="overdue-card-header">
          <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'oklch(90% 0.08 25)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 4v5M9 12v.5" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="9" r="7.5" stroke="var(--danger)" strokeWidth="1.5"/></svg>
          </div>
          <div>
            <div style={{fontWeight:700,fontSize:'14px',color:'var(--danger)'}}>মেয়াদোত্তীর্ণ ঋণ — অবিলম্বে যোগাযোগ করুন</div>
            <div style={{fontSize:'12px',color:'oklch(52% 0.18 25)',marginTop:'2px'}}>নিচের ঋণগ্রহীতাদের সাথে যোগাযোগ করা প্রয়োজন</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {[
            {initial:'ম',color:'180',name:'মো. করিম উদ্দিন',due:'৩০ মে ২০২৬',amount:'৳৮,০০০'},
            {initial:'স',color:'280',name:'সালমা বেগম',due:'২৫ মে ২০২৬',amount:'৳১২,০০০'},
          ].map((item, i) => (
            <div key={i} style={{background:'var(--surface)',border:'1px solid oklch(88% 0.07 25)',borderRadius:'var(--r-sm)',padding:'14px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'12px',flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                <div className="avatar" style={{background:`oklch(92% 0.04 ${item.color})`,color:`oklch(40% 0.12 ${item.color})`}}>{item.initial}</div>
                <div>
                  <div style={{fontWeight:600,fontSize:'13px'}}>{item.name}</div>
                  <div style={{fontSize:'11px',color:'var(--muted)'}}>{item.due} মেয়াদোত্তীর্ণ</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="money" style={{fontWeight:700,color:'var(--danger)',fontSize:'15px'}}>{item.amount}</div>
                <div style={{fontSize:'11px',color:'var(--muted)'}}>বাকি আছে</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="card" style={{overflow:'hidden'}}>
        <div style={{padding:'14px 18px 0',borderBottom:'1px solid var(--border)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px',flexWrap:'wrap',gap:'8px'}}>
            <span style={{fontSize:'14px',fontWeight:700,color:'var(--fg)'}}>ঋণ পরিশোধের তালিকা</span>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <span style={{fontSize:'12px',color:'var(--muted)'}}>মোট {repayData.length}টি</span>
              <button className="btn btn-ghost btn-sm" onClick={() => showToast('এক্সেল ডাউনলোড হচ্ছে...')}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9.5 8.5V11H3.5V8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M6.5 1.5v6.5M4 5.5l2.5 2.5 2.5-2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                রপ্তানি
              </button>
            </div>
          </div>
          <div className="tabs-r">
            <span className={`tab-r${activeTab==='all'?' active':''}`} onClick={() => setActiveTab('all')}>সব ফেরত</span>
            <span className={`tab-r${activeTab==='installment'?' active':''}`} onClick={() => setActiveTab('installment')}>কিস্তির তালিকা</span>
            <span className={`tab-r${activeTab==='overdue'?' active':''}`} onClick={() => setActiveTab('overdue')}>মেয়াদোত্তীর্ণ <span className="badge badge-danger" style={{fontSize:'10px',padding:'1px 6px',marginLeft:'4px'}}>২</span></span>
          </div>
        </div>

        {/* Panel: all */}
        {activeTab === 'all' && (
          <div style={{overflowX:'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th className={sortCol==='date'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('date')}>তারিখ</th>
                  <th className={sortCol==='name'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('name')}>ঋণগ্রহীতা</th>
                  <th className={sortCol==='total'?`table-sort-${sortDir}`:''} style={{cursor:'pointer',textAlign:'right'}} onClick={() => handleSort('total')}>মোট ঋণ</th>
                  <th className={sortCol==='paid'?`table-sort-${sortDir}`:''} style={{cursor:'pointer',textAlign:'right'}} onClick={() => handleSort('paid')}>পরিশোধিত</th>
                  <th className={sortCol==='remaining'?`table-sort-${sortDir}`:''} style={{cursor:'pointer',textAlign:'right'}} onClick={() => handleSort('remaining')}>বাকি</th>
                  <th className={sortCol==='installment'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('installment')}>কিস্তি</th>
                  <th className={sortCol==='status'?`table-sort-${sortDir}`:''} style={{cursor:'pointer'}} onClick={() => handleSort('status')}>স্ট্যাটাস</th>
                  <th style={{cursor:'default'}}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((r, i) => {
                  const pct = r.remainingNum === 0 ? 100 : Math.round((r.paidNum / r.totalNum) * 100)
                  return (
                    <tr key={i} className={r.overdue ? 'overdue-row' : ''}>
                      <td style={{color:'var(--muted)',whiteSpace:'nowrap',fontSize:'12px'}}>{r.date}</td>
                      <td>
                        <div style={{display:'flex',alignItems:'center',gap:'9px'}}>
                          <div className="avatar" style={{background:`oklch(92% 0.04 ${r.color})`,color:`oklch(40% 0.12 ${r.color})`,width:'30px',height:'30px',fontSize:'12px'}}>{r.initial}</div>
                          <span style={{fontWeight:500}}>{r.name}</span>
                        </div>
                      </td>
                      <td style={{textAlign:'right'}} className="money">{r.total}</td>
                      <td style={{textAlign:'right'}} className="money">
                        <div>{r.paid}</div>
                        <div className="progress-wrap-r" style={{width:'80px',marginLeft:'auto',marginTop:'3px'}}>
                          <div className="progress-bar-r" style={{width:`${pct}%`,background:r.overdue?'var(--danger)':r.remainingNum===0?'var(--success)':'var(--brand)'}}></div>
                        </div>
                      </td>
                      <td style={{textAlign:'right'}} className="money">
                        <span style={{fontWeight:700,color:r.remainingNum===0?'var(--success)':r.overdue?'var(--danger)':'var(--fg)'}}>{r.remaining}</span>
                      </td>
                      <td style={{color:'var(--muted)',fontSize:'12px'}}>{r.installment}</td>
                      <td><StatusBadge row={r} /></td>
                      <td>
                        <div style={{display:'flex',gap:'5px'}}>
                          <button className="btn btn-ghost btn-xs" onClick={() => showToast('বিস্তারিত দেখা হচ্ছে')}>
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor"/></svg>
                            দেখুন
                          </button>
                          {r.remainingNum !== 0 && (
                            <button className="btn btn-ghost btn-xs" onClick={() => setNewRepaymentOpen(true)}>ফেরত</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Panel: installment cards */}
        {activeTab === 'installment' && (
          <div style={{padding:'20px 18px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:'14px'}}>
              {activeLoans.map((r, i) => {
                const pct = Math.round((r.paidNum / r.totalNum) * 100)
                return (
                  <div key={i} className="card" style={{padding:'16px',borderColor:r.overdue?'oklch(88% 0.07 25)':undefined,background:r.overdue?'var(--danger-bg)':undefined}}>
                    <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'12px'}}>
                      <div className="avatar" style={{background:`oklch(92% 0.04 ${r.color})`,color:`oklch(40% 0.12 ${r.color})`}}>{r.initial}</div>
                      <div>
                        <div style={{fontWeight:600,fontSize:'13px'}}>{r.name}</div>
                        <div style={{fontSize:'11px',color:'var(--muted)'}}>{r.installment}</div>
                      </div>
                      {r.overdue && <span className="badge badge-danger" style={{fontSize:'10px',marginLeft:'auto'}}>মেয়াদোত্তীর্ণ</span>}
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'var(--muted)',marginBottom:'6px'}}>
                      <span>পরিশোধিত {pct}%</span>
                      <span className="money">{r.paid} / {r.total}</span>
                    </div>
                    <div className="progress-wrap-r" style={{height:'8px'}}>
                      <div className="progress-bar-r" style={{width:`${pct}%`,background:r.overdue?'var(--danger)':'var(--brand)'}}></div>
                    </div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'10px'}}>
                      <span style={{fontSize:'12px',color:'var(--muted)'}}>বাকি: <strong className="money" style={{color:r.overdue?'var(--danger)':'var(--fg)'}}>{r.remaining}</strong></span>
                      <button className="btn btn-ghost btn-xs" onClick={() => setNewRepaymentOpen(true)}>কিস্তি নিন</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Panel: overdue */}
        {activeTab === 'overdue' && (
          <div style={{overflowX:'auto'}}>
            <table className="table">
              <thead>
                <tr>
                  <th>ঋণগ্রহীতা</th>
                  <th>মোট ঋণ</th>
                  <th>বাকি</th>
                  <th>মেয়াদোত্তীর্ণ তারিখ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                <tr className="overdue-row">
                  <td><div style={{display:'flex',alignItems:'center',gap:'9px'}}><div className="avatar" style={{background:'oklch(92% 0.04 180)',color:'oklch(40% 0.12 180)',width:'30px',height:'30px',fontSize:'12px'}}>ম</div><span style={{fontWeight:500}}>মো. করিম উদ্দিন</span></div></td>
                  <td className="money" style={{fontWeight:600}}>৳২০,০০০</td>
                  <td className="money" style={{fontWeight:700,color:'var(--danger)'}}>৳৮,০০০</td>
                  <td style={{color:'var(--danger)',fontSize:'12px',fontWeight:600}}>৩০ মে ২০২৬</td>
                  <td><div style={{display:'flex',gap:'5px'}}><button className="btn btn-ghost btn-xs" onClick={() => showToast('SMS পাঠানো হয়েছে')}>SMS</button><button className="btn btn-danger btn-xs" onClick={() => setNewRepaymentOpen(true)}>ফেরত নিন</button></div></td>
                </tr>
                <tr className="overdue-row">
                  <td><div style={{display:'flex',alignItems:'center',gap:'9px'}}><div className="avatar" style={{background:'oklch(92% 0.04 280)',color:'oklch(40% 0.12 280)',width:'30px',height:'30px',fontSize:'12px'}}>স</div><span style={{fontWeight:500}}>সালমা বেগম</span></div></td>
                  <td className="money" style={{fontWeight:600}}>৳৩০,০০০</td>
                  <td className="money" style={{fontWeight:700,color:'var(--danger)'}}>৳১২,০০০</td>
                  <td style={{color:'var(--danger)',fontSize:'12px',fontWeight:600}}>২৫ মে ২০২৬</td>
                  <td><div style={{display:'flex',gap:'5px'}}><button className="btn btn-ghost btn-xs" onClick={() => showToast('SMS পাঠানো হয়েছে')}>SMS</button><button className="btn btn-danger btn-xs" onClick={() => setNewRepaymentOpen(true)}>ফেরত নিন</button></div></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Repayment Modal */}
      <div className={`modal-backdrop-r${newRepaymentOpen?' open':''}`} onClick={e => { if (e.target === e.currentTarget) setNewRepaymentOpen(false) }}>
        <div className="modal-r">
          <div className="modal-header-r">
            <span className="modal-title-r">নতুন ফেরত এন্ট্রি</span>
            <button className="modal-close-r" onClick={() => setNewRepaymentOpen(false)} aria-label="বন্ধ করুন">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </button>
          </div>
          <div className="modal-body-r">
            <div className="form-group-r">
              <label className="form-label-r">ঋণ নির্বাচন <span className="req">*</span></label>
              <select className="input input-sel-r" value={modalLoan} onChange={e => setModalLoan(e.target.value)}>
                <option value="">— ঋণ বেছে নিন —</option>
                <option value="1">মো. রহিম উদ্দিন — বাকি: ৳১৫,০০০</option>
                <option value="2">নাসরিন আক্তার — বাকি: ৳২২,৫০০</option>
                <option value="3">আবদুল করিম — বাকি: ৳৮,০০০</option>
                <option value="4">ইব্রাহিম শেখ — বাকি: ৳৩০,০০০</option>
                <option value="5">জান্নাতুন নিসা — বাকি: ৳১২,০০০</option>
                <option value="overdue1">মো. করিম উদ্দিন — বাকি: ৳৮,০০০ (মেয়াদোত্তীর্ণ)</option>
                <option value="overdue2">সালমা বেগম — বাকি: ৳১২,০০০ (মেয়াদোত্তীর্ণ)</option>
                <option value="7">মো. হাবিবুর রহমান — বাকি: ৳৫,৫০০</option>
                <option value="8">ফাতেমা বেগম — বাকি: ৳১৮,০০০</option>
              </select>
            </div>
            <div className="form-group-r">
              <label className="form-label-r">কিস্তি পরিমাণ <span className="req">*</span></label>
              <div className="input-prefix-r">
                <span className="input-prefix-text-r">৳</span>
                <input type="number" className="input" placeholder="০" min={100} step={100} value={modalAmount} onChange={e => setModalAmount(e.target.value)} />
              </div>
            </div>
            <div className="form-group-r">
              <label className="form-label-r">পেমেন্ট পদ্ধতি <span className="req">*</span></label>
              <div className="radio-group-r">
                {['নগদ','bKash','ব্যাংক'].map(method => (
                  <label key={method} className={`radio-option-r${payMethod===method?' selected':''}`} onClick={() => setPayMethod(method)}>
                    <input type="radio" name="payMethod" value={method} checked={payMethod===method} onChange={() => setPayMethod(method)} />
                    <label style={{cursor:'pointer',fontSize:'13px',fontWeight:500}}>{method}</label>
                  </label>
                ))}
              </div>
            </div>
            <div className="form-group-r">
              <label className="form-label-r">তারিখ <span className="req">*</span></label>
              <input type="date" className="input" value={modalDate} onChange={e => setModalDate(e.target.value)} />
            </div>
            <div className="form-group-r">
              <label className="form-label-r">রসিদ নং <span className="opt">(ঐচ্ছিক)</span></label>
              <input type="text" className="input" placeholder="যেমন: RCP-2026-0123" value={modalReceipt} onChange={e => setModalReceipt(e.target.value)} />
            </div>
          </div>
          <div className="modal-footer-r">
            <button className="btn btn-ghost" onClick={() => setNewRepaymentOpen(false)}>বাতিল</button>
            <button className="btn btn-primary" onClick={submitRepayment}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M12.5 4L6 11 2.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              পরিশোধ নিশ্চিত করুন
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`toast-r${toast.visible?' show':''} ${toast.type}`}>{toast.msg}</div>
    </>
  )
}
