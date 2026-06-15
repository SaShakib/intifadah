'use client'

import { useState, useCallback } from 'react'

const loansData = [
  { id:'L001', borrower:'রহিমা খাতুন',       bid:'#০০২', phone:'01819-234567', type:'সাধারণ',    purpose:'চিকিৎসা ঋণ',    amount:15000, amountDisplay:'৳১৫,০০০', dateGiven:'১০ মার্চ ২০২৬',   dateDue:'১০ সেপ্টে ২০২৬', paid:3000,  paidDisplay:'৳৩,০০০',  remaining:12000, remainingDisplay:'৳১২,০০০', installment:'মাসিক ৳২,৫০০', status:'সক্রিয়',           pct:20  },
  { id:'L002', borrower:'ইব্রাহিম শেখ',        bid:'#০০৩', phone:'01912-345678', type:'ইনতিফাদাহ', purpose:'ব্যবসায়িক ঋণ', amount:20000, amountDisplay:'৳২০,০০০', dateGiven:'—',                dateDue:'—',               paid:0,     paidDisplay:'—',         remaining:20000, remainingDisplay:'৳২০,০০০', installment:'—',             status:'অনুমোদন প্রয়োজন', pct:0   },
  { id:'L003', borrower:'মো. আমির হোসেন',      bid:'#০০৫', phone:'01711-567890', type:'সাধারণ',    purpose:'জরুরি ঋণ',      amount:15000, amountDisplay:'৳১৫,০০০', dateGiven:'—',                dateDue:'—',               paid:0,     paidDisplay:'—',         remaining:15000, remainingDisplay:'৳১৫,০০০', installment:'—',             status:'অনুমোদন প্রয়োজন', pct:0   },
  { id:'L004', borrower:'জান্নাতুন নিসা',      bid:'#০০৭', phone:'01512-789012', type:'সাধারণ',    purpose:'শিক্ষা ঋণ',     amount:8000,  amountDisplay:'৳৮,০০০',  dateGiven:'০৫ ফেব্রু ২০২৬', dateDue:'০৫ আগস্ট ২০২৬',  paid:4000,  paidDisplay:'৳৪,০০০',  remaining:4000,  remainingDisplay:'৳৪,০০০',  installment:'মাসিক ৳১,৩৩৩', status:'সক্রিয়',           pct:50  },
  { id:'L005', borrower:'সাবরিনা সুলতানা',     bid:'#০০৯', phone:'01712-901234', type:'সাধারণ',    purpose:'ব্যবসায়িক ঋণ', amount:12000, amountDisplay:'৳১২,০০০', dateGiven:'১৫ জানু ২০২৬',   dateDue:'১৫ জুলাই ২০২৬',  paid:2000,  paidDisplay:'৳২,০০০',  remaining:10000, remainingDisplay:'৳১০,০০০', installment:'মাসিক ৳২,০০০', status:'সক্রিয়',           pct:17  },
  { id:'L006', borrower:'মো. করিম উল্লাহ',     bid:'#০১০', phone:'01819-012345', type:'সাধারণ',    purpose:'জরুরি ঋণ',      amount:8000,  amountDisplay:'৳৮,০০০',  dateGiven:'১০ নভে ২০২৫',    dateDue:'১০ মে ২০২৬',     paid:8000,  paidDisplay:'৳৮,০০০',  remaining:0,     remainingDisplay:'—',        installment:'—',             status:'মেয়াদোত্তীর্ণ',   pct:100 },
  { id:'L007', borrower:'ফাতিমা বেগম',          bid:'#০১২', phone:'01711-234567', type:'সাধারণ',    purpose:'চিকিৎসা ঋণ',    amount:10000, amountDisplay:'৳১০,০০০', dateGiven:'২০ ডিসে ২০২৫',   dateDue:'২০ জুন ২০২৬',    paid:3500,  paidDisplay:'৳৩,৫০০',  remaining:6500,  remainingDisplay:'৳৬,৫০০',  installment:'মাসিক ৳১,৭৫০', status:'মেয়াদোত্তীর্ণ',   pct:35  },
  { id:'L008', borrower:'মো. রকিব হাসান',       bid:'#০১৫', phone:'01611-321654', type:'সাধারণ',    purpose:'শিক্ষা ঋণ',     amount:25000, amountDisplay:'৳২৫,০০০', dateGiven:'০১ জানু ২০২৬',   dateDue:'০১ জুলাই ২০২৭',  paid:5000,  paidDisplay:'৳৫,০০০',  remaining:20000, remainingDisplay:'৳২০,০০০', installment:'মাসিক ৳১,৪৭০', status:'সক্রিয়',           pct:20  },
  { id:'L009', borrower:'মো. শাহেদ আলী',        bid:'#০১৮', phone:'01712-654987', type:'সাধারণ',    purpose:'ব্যবসায়িক ঋণ', amount:30000, amountDisplay:'৳৩০,০০০', dateGiven:'১৫ মার্চ ২০২৫',  dateDue:'১৫ মার্চ ২০২৬',  paid:30000, paidDisplay:'৳৩০,০০০', remaining:0,     remainingDisplay:'—',        installment:'—',             status:'সম্পন্ন',           pct:100 },
  { id:'L010', borrower:'রফিক আহমেদ',            bid:'#০১৯', phone:'01819-741258', type:'সাধারণ',    purpose:'জরুরি ঋণ',      amount:5000,  amountDisplay:'৳৫,০০০',  dateGiven:'২৮ এপ্রিল ২০২৫', dateDue:'২৮ অক্টো ২০২৫',  paid:5000,  paidDisplay:'৳৫,০০০',  remaining:0,     remainingDisplay:'—',        installment:'—',             status:'সম্পন্ন',           pct:100 },
]

const avBgs = ['var(--brand-light)','oklch(95% 0.04 240)','oklch(95% 0.04 75)','oklch(95% 0.04 25)']
const avFgs = ['var(--brand)','oklch(40% 0.15 240)','oklch(42% 0.15 75)','oklch(44% 0.16 25)']

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return parts[0][0] + parts[1][0]
  return name.slice(0, 2)
}

type Loan = typeof loansData[0]
type ApprovedMap = Record<string, boolean>
type RejectedSet = Set<string>

export default function LoansPage() {
  const [loanSearch, setLoanSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [statusFilterLoan, setStatusFilterLoan] = useState('')
  const [currentTabFilter, setCurrentTabFilter] = useState('all')
  const [approvedLoans, setApprovedLoans] = useState<ApprovedMap>({})
  const [rejectedLoans, setRejectedLoans] = useState<RejectedSet>(new Set())
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerLoan, setDrawerLoan] = useState<Loan | null>(null)
  const [loanModalOpen, setLoanModalOpen] = useState(false)
  const [toast, setToast] = useState<{msg:string,type:string,visible:boolean}>({msg:'',type:'',visible:false})

  const showToast = useCallback((msg: string, type = 'success') => {
    setToast({msg, type, visible:true})
    setTimeout(() => setToast(t => ({...t, visible:false})), 2500)
  }, [])

  const getEffectiveStatus = (loan: Loan) => {
    if (rejectedLoans.has(loan.id)) return '__rejected__'
    if (approvedLoans[loan.id]) return 'সক্রিয়'
    return loan.status
  }

  const filtered = loansData.filter(l => {
    if (rejectedLoans.has(l.id)) return false
    const effectiveStatus = approvedLoans[l.id] ? 'সক্রিয়' : l.status
    const matchTab = currentTabFilter === 'all' || effectiveStatus === currentTabFilter
    const q = loanSearch.toLowerCase()
    const matchSearch = !q || l.borrower.toLowerCase().includes(q) || l.bid.includes(q)
    const matchCat = !catFilter || l.purpose.includes(catFilter.replace(' ঋণ',''))
    const matchStatus = !statusFilterLoan || effectiveStatus === statusFilterLoan
    return matchTab && matchSearch && matchCat && matchStatus
  })

  const openDrawer = (loan: Loan) => {
    setDrawerLoan(loan)
    setDrawerOpen(true)
  }

  const approveLoan = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setApprovedLoans(prev => ({...prev, [id]: true}))
    showToast('ঋণ সফলভাবে অনুমোদন করা হয়েছে', 'success')
  }

  const rejectLoan = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setRejectedLoans(prev => new Set([...prev, id]))
    showToast('ঋণ প্রত্যাখ্যান করা হয়েছে', 'danger')
  }

  const StatusBadge = ({status}: {status:string}) => {
    const map: Record<string,string> = {
      'সক্রিয়':'badge-success',
      'অনুমোদন প্রয়োজন':'badge-warning',
      'সম্পন্ন':'badge-muted',
      'মেয়াদোত্তীর্ণ':'badge-danger',
    }
    return <span className={`badge ${map[status] || 'badge-muted'}`}>{status}</span>
  }

  const ProgressBar = ({pct, status}: {pct:number, status:string}) => {
    const color = status === 'সম্পন্ন' ? 'var(--success)' : status === 'মেয়াদোত্তীর্ণ' ? 'var(--danger)' : 'var(--brand-mid)'
    return (
      <div style={{display:'flex',flexDirection:'column',gap:'4px',minWidth:'100px'}}>
        <div style={{height:'5px',background:'var(--border)',borderRadius:'99px',overflow:'hidden'}}>
          <div style={{height:'100%',width:`${pct}%`,background:color,borderRadius:'99px'}}></div>
        </div>
        <span style={{fontSize:'11px',color:'var(--muted)',fontVariantNumeric:'tabular-nums'}}>{pct}% পরিশোধিত</span>
      </div>
    )
  }

  const toastColors: Record<string,string> = {success:'var(--success)',danger:'var(--danger)',info:'var(--brand-mid)'}

  return (
    <>
      <style>{`
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
        .page-header h1 { font-size: 22px; font-weight: 700; color: var(--fg); line-height: 1.2; }
        .page-header p { font-size: 13px; color: var(--muted); margin-top: 3px; }
        .stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .stat-mini { padding: 16px 18px; }
        .stat-mini-label { font-size: 11px; color: var(--muted); font-weight: 600; margin-bottom: 4px; }
        .stat-mini-value { font-size: 20px; font-weight: 700; color: var(--fg); font-variant-numeric: tabular-nums; line-height: 1.1; }
        .stat-mini-sub { font-size: 11px; color: var(--muted); margin-top: 3px; }
        .overdue-alert { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 14px 18px; background: var(--warning-bg); border: 1px solid oklch(88% 0.08 80); border-radius: var(--r); margin-bottom: 20px; flex-wrap: wrap; }
        .overdue-alert-text { display: flex; align-items: flex-start; gap: 10px; }
        .overdue-alert p { font-size: 13px; color: oklch(40% 0.15 75); font-weight: 500; }
        .filter-bar { padding: 14px; display: flex; gap: 10px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
        .search-wrap { position: relative; flex: 1; min-width: 180px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
        .search-input { padding-left: 38px; }
        .filter-select { padding: 10px 32px 10px 12px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; color: var(--fg); background: var(--surface); outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
        .date-range { display: flex; gap: 6px; align-items: center; font-size: 12px; color: var(--muted); }
        .date-range input { padding: 9px 10px; border: 1px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 12px; color: var(--fg); background: var(--surface); outline: none; width: 130px; }
        .table-card { overflow: hidden; }
        .tabs-row { padding: 4px 16px 0; overflow-x: auto; }
        .table-wrap { overflow-x: auto; }
        .borrower-cell { display: flex; align-items: center; gap: 10px; }
        .borrower-name { font-weight: 600; color: var(--fg); font-size: 13px; }
        .borrower-id { font-size: 11px; color: var(--muted); }
        .action-btns { display: flex; gap: 4px; align-items: center; }
        .icon-btn { width: 30px; height: 30px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--muted); cursor: pointer; display: inline-flex; align-items: center; justify-content: center; transition: all 0.12s; padding: 0; font-family: var(--font); }
        .icon-btn:hover { background: var(--surface-2); color: var(--fg-2); }
        .btn-success { background: var(--success-bg); color: var(--success); border: 1px solid oklch(88% 0.06 145); cursor:pointer; }
        .btn-success:hover { background: oklch(92% 0.06 145); }
        .cat-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; background: var(--brand-light); color: var(--brand); }
        .drawer-backdrop { position: fixed; inset: 0; background: oklch(0% 0 0 / 0.35); z-index: 400; opacity: 0; pointer-events: none; transition: opacity 0.25s; }
        .drawer-backdrop.open { opacity: 1; pointer-events: auto; }
        .drawer { position: fixed; top: 0; right: 0; width: 420px; max-width: 100vw; height: 100vh; background: var(--surface); box-shadow: -8px 0 32px oklch(0% 0 0 / 0.15); z-index: 410; transform: translateX(100%); transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); display: flex; flex-direction: column; overflow: hidden; }
        .drawer-backdrop.open .drawer { transform: translateX(0); }
        .drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
        .drawer-header h2 { font-size: 16px; font-weight: 700; color: var(--fg); }
        .drawer-close { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; transition: all 0.12s; }
        .drawer-close:hover { background: var(--danger-bg); color: var(--danger); }
        .drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
        .drawer-footer { padding: 16px 20px; border-top: 1px solid var(--border); display: flex; gap: 8px; flex-shrink: 0; }
        .drawer-section { margin-bottom: 20px; }
        .drawer-section-title { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .detail-item { display: flex; flex-direction: column; gap: 2px; }
        .detail-label { font-size: 11px; color: var(--muted); font-weight: 500; }
        .detail-value { font-size: 13px; color: var(--fg); font-weight: 600; }
        .installment-table { width: 100%; border-collapse: collapse; font-size: 12px; }
        .installment-table th { text-align: left; padding: 7px 10px; font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; border-bottom: 2px solid var(--border); background: var(--surface-2); }
        .installment-table td { padding: 9px 10px; border-bottom: 1px solid var(--border); }
        .installment-table tr:last-child td { border-bottom: none; }
        .borrower-profile { display: flex; align-items: center; gap: 12px; padding: 14px; background: var(--surface-2); border-radius: var(--r); border: 1px solid var(--border); margin-bottom: 16px; }
        .borrower-info h3 { font-size: 15px; font-weight: 700; color: var(--fg); }
        .borrower-info p { font-size: 12px; color: var(--muted); margin-top: 2px; }
        .modal-backdrop-l { position: fixed; inset: 0; background: oklch(0% 0 0 / 0.45); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 16px; opacity: 0; pointer-events: none; transition: opacity 0.2s; }
        .modal-backdrop-l.open { opacity: 1; pointer-events: auto; }
        .modal-l { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 20px 60px oklch(0% 0 0 / 0.25); width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; transform: translateY(16px) scale(0.98); transition: transform 0.2s; }
        .modal-backdrop-l.open .modal-l { transform: translateY(0) scale(1); }
        .modal-header-l { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 0; }
        .modal-header-l h2 { font-size: 17px; font-weight: 700; color: var(--fg); }
        .modal-close-l { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .modal-close-l:hover { background: var(--danger-bg); color: var(--danger); }
        .modal-body-l { padding: 20px 24px; }
        .modal-footer-l { padding: 16px 24px 20px; display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--border); }
        .form-grid-l { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group-l { display: flex; flex-direction: column; gap: 5px; }
        .form-group-l.full { grid-column: 1 / -1; }
        .form-label-l { font-size: 12px; font-weight: 600; color: var(--fg-2); }
        .form-label-l .req { color: var(--danger); }
        .toast-l { position: fixed; bottom: 88px; left: 50%; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; z-index: 9999; box-shadow: var(--sh); white-space: nowrap; color:#fff; opacity: 0; transform: translateX(-50%) translateY(20px); transition: opacity 0.2s, transform 0.2s; pointer-events: none; }
        .toast-l.show { opacity: 1; transform: translateX(-50%) translateY(0); }
        .table tbody tr.overdue td { background: var(--danger-bg) !important; }
        .table tbody tr.overdue:hover td { background: oklch(94% 0.055 25) !important; }
        .table tbody tr.completed td { opacity: 0.65; }
        @media (max-width: 640px) {
          .stat-row { grid-template-columns: repeat(2, 1fr); }
          .form-grid-l { grid-template-columns: 1fr; }
          .detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div>
          <h1>ঋণ ব্যবস্থাপনা</h1>
          <p>সক্রিয় ঋণ: ১৮টি &nbsp;•&nbsp; মোট বকেয়া: ৳২,৮৫,০০০</p>
        </div>
        <button className="btn btn-primary" onClick={() => setLoanModalOpen(true)}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          নতুন ঋণ
        </button>
      </div>

      {/* Summary stats */}
      <div className="stat-row">
        <div className="card stat-mini">
          <div className="stat-mini-label">মোট বিতরণ</div>
          <div className="stat-mini-value" style={{color:'var(--brand)'}}>৳৩,৭৫,০০০</div>
          <div className="stat-mini-sub">সর্বকালীন</div>
        </div>
        <div className="card stat-mini">
          <div className="stat-mini-label">আদায় হয়েছে</div>
          <div className="stat-mini-value" style={{color:'var(--success)'}}>৳৯০,০০০</div>
          <div className="stat-mini-sub">মোটের ২৪%</div>
        </div>
        <div className="card stat-mini">
          <div className="stat-mini-label">বাকি আছে</div>
          <div className="stat-mini-value" style={{color:'var(--fg)'}}>৳২,৮৫,০০০</div>
          <div className="stat-mini-sub">১৮টি সক্রিয় ঋণ</div>
        </div>
        <div className="card stat-mini">
          <div className="stat-mini-label">মেয়াদোত্তীর্ণ</div>
          <div className="stat-mini-value" style={{color:'var(--danger)'}}>৳৩২,০০০</div>
          <div className="stat-mini-sub">২টি ঋণ</div>
        </div>
      </div>

      {/* Overdue alert */}
      <div className="overdue-alert">
        <div className="overdue-alert-text">
          <span style={{fontSize:'18px'}}>⚠️</span>
          <p><strong>২টি ঋণ মেয়াদোত্তীর্ণ হয়েছে</strong> — মো. করিম উল্লাহ (৳৮,০০০) ও ফাতিমা বেগম (৳৬,৫০০) এর ঋণ পরিশোধের সময়সীমা অতিক্রান্ত হয়েছে।</p>
        </div>
        <button className="btn btn-sm" style={{background:'oklch(55% 0.14 75)',color:'#fff',border:'none',whiteSpace:'nowrap'}} onClick={() => showToast('নোটিফিকেশন পাঠানো হয়েছে','success')}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.68 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.59 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l.81-.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          নোটিফিকেশন পাঠান
        </button>
      </div>

      {/* Filter bar */}
      <div className="card filter-bar">
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" className="input search-input" placeholder="ঋণগ্রহীতার নাম বা আইডি..." value={loanSearch} onChange={e => setLoanSearch(e.target.value)} />
        </div>
        <div className="date-range hide-mobile">
          <input type="date" placeholder="শুরুর তারিখ" title="শুরুর তারিখ" />
          <span>—</span>
          <input type="date" placeholder="শেষ তারিখ" title="শেষ তারিখ" />
        </div>
        <select className="filter-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">সব খাত</option>
          <option>জরুরি ঋণ</option>
          <option>ব্যবসায়িক ঋণ</option>
          <option>চিকিৎসা ঋণ</option>
          <option>শিক্ষা ঋণ</option>
        </select>
        <select className="filter-select" value={statusFilterLoan} onChange={e => setStatusFilterLoan(e.target.value)}>
          <option value="">সকল অবস্থা</option>
          <option value="সক্রিয়">সক্রিয়</option>
          <option value="অনুমোদন প্রয়োজন">অনুমোদন প্রয়োজন</option>
          <option value="সম্পন্ন">সম্পন্ন</option>
          <option value="মেয়াদোত্তীর্ণ">মেয়াদোত্তীর্ণ</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { setLoanSearch(''); setCatFilter(''); setStatusFilterLoan('') }}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.15"/></svg>
          রিসেট
        </button>
      </div>

      {/* Loans table card */}
      <div className="card table-card">
        <div className="tabs-row">
          <div className="tabs">
            {[
              {key:'all', label:'সব', count:'(২৩)'},
              {key:'অনুমোদন প্রয়োজন', label:'অনুমোদন প্রয়োজন', count:'(৩)'},
              {key:'সক্রিয়', label:'সক্রিয়', count:'(১৮)'},
              {key:'সম্পন্ন', label:'সম্পন্ন', count:'(৪৫)'},
              {key:'মেয়াদোত্তীর্ণ', label:'মেয়াদোত্তীর্ণ', count:'(২)', dangerCount:true},
            ].map(t => (
              <div key={t.key} className={`tab${currentTabFilter===t.key?' active':''}`} onClick={() => setCurrentTabFilter(t.key)}>
                {t.label} <span style={{fontSize:'11px',color:t.dangerCount?'var(--danger)':'var(--muted)'}}>{t.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>ঋণগ্রহীতা</th>
                <th className="hide-mobile">উদ্দেশ্য / খাত</th>
                <th>পরিমাণ</th>
                <th className="hide-mobile">গ্রহণের তারিখ</th>
                <th className="hide-mobile">ফেরতের তারিখ</th>
                <th className="hide-mobile">পরিশোধিত</th>
                <th className="hide-mobile">বাকি</th>
                <th className="hide-mobile">কিস্তি</th>
                <th>অবস্থা</th>
                <th style={{textAlign:'right'}}>কার্যক্রম</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} style={{textAlign:'center',padding:'40px',color:'var(--muted)'}}>কোনো ঋণ পাওয়া যায়নি</td></tr>
              ) : filtered.map((loan, i) => {
                const effectiveStatus = approvedLoans[loan.id] ? 'সক্রিয়' : loan.status
                const isOverdue = effectiveStatus === 'মেয়াদোত্তীর্ণ'
                const isCompleted = effectiveStatus === 'সম্পন্ন'
                const avIdx = i % 4
                return (
                  <tr
                    key={loan.id}
                    className={isOverdue ? 'overdue' : isCompleted ? 'completed' : ''}
                    onClick={() => openDrawer(loan)}
                    style={{cursor:'pointer'}}
                  >
                    <td>
                      <div className="borrower-cell">
                        <div className="avatar" style={{background:avBgs[avIdx],color:avFgs[avIdx]}}>{getInitials(loan.borrower)}</div>
                        <div>
                          <div className="borrower-name">{loan.borrower}</div>
                          <div className="borrower-id">{loan.bid}</div>
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile"><span className="cat-badge">{loan.purpose}</span></td>
                    <td className="money" style={{fontWeight:700,color:'var(--fg)'}}>{loan.amountDisplay}</td>
                    <td className="hide-mobile" style={{fontSize:'12px',color:'var(--muted)'}}>{loan.dateGiven}</td>
                    <td className="hide-mobile" style={{fontSize:'12px',color:'var(--muted)'}}>{loan.dateDue}</td>
                    <td className="hide-mobile">
                      {loan.paid > 0 ? <ProgressBar pct={loan.pct} status={effectiveStatus} /> : <span style={{color:'var(--muted)'}}>—</span>}
                    </td>
                    <td className="hide-mobile money" style={{color:loan.remaining>0?'var(--warning)':'var(--muted)',fontWeight:loan.remaining>0?600:400}}>{loan.remainingDisplay}</td>
                    <td className="hide-mobile" style={{fontSize:'12px',color:'var(--fg-2)'}}>{loan.installment}</td>
                    <td onClick={e => e.stopPropagation()}><StatusBadge status={effectiveStatus} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      {effectiveStatus === 'অনুমোদন প্রয়োজন' ? (
                        <div className="action-btns" style={{justifyContent:'flex-end'}}>
                          <button className="btn btn-success btn-sm" onClick={e => approveLoan(e, loan.id)}>✓ অনুমোদন</button>
                          <button className="btn btn-danger btn-sm" onClick={e => rejectLoan(e, loan.id)}>✕ প্রত্যাখ্যান</button>
                        </div>
                      ) : isOverdue ? (
                        <div className="action-btns" style={{justifyContent:'flex-end'}}>
                          <button className="icon-btn" title="সতর্কতা" style={{color:'var(--danger)',borderColor:'oklch(88% 0.06 25)'}}>⚠</button>
                          <button className="icon-btn" title="বিস্তারিত">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </div>
                      ) : isCompleted ? (
                        <div className="action-btns" style={{justifyContent:'flex-end'}}>
                          <button className="icon-btn" title="সম্পন্ন" style={{color:'var(--success)',borderColor:'oklch(88% 0.06 145)'}}>✓</button>
                        </div>
                      ) : (
                        <div className="action-btns" style={{justifyContent:'flex-end'}}>
                          <button className="icon-btn" title="আরো বিকল্প">
                            <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Detail Drawer */}
      <div className={`drawer-backdrop${drawerOpen?' open':''}`} onClick={e => { if (e.target === e.currentTarget) setDrawerOpen(false) }}>
        <div className="drawer">
          <div className="drawer-header">
            <h2>ঋণের বিস্তারিত</h2>
            <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          <div className="drawer-body">
            {drawerLoan && (() => {
              const loan = drawerLoan
              const effectiveStatus = approvedLoans[loan.id] ? 'সক্রিয়' : loan.status
              const avIdx = loansData.indexOf(loan) % 4
              return (
                <>
                  <div className="borrower-profile">
                    <div className="avatar" style={{width:'44px',height:'44px',fontSize:'17px',background:avBgs[avIdx],color:avFgs[avIdx]}}>{getInitials(loan.borrower)}</div>
                    <div className="borrower-info">
                      <h3>{loan.borrower}</h3>
                      <p>{loan.phone} &nbsp;|&nbsp; {loan.bid}</p>
                      <div style={{marginTop:'5px'}}>
                        {loan.type === 'ইনতিফাদাহ' ? <span className="badge badge-info">ইনতিফাদাহ</span>
                         : loan.type === 'সংগঠন' ? <span className="badge badge-success">সংগঠন</span>
                         : <span className="badge badge-muted">সাধারণ</span>}
                      </div>
                    </div>
                  </div>
                  <div className="drawer-section">
                    <div className="drawer-section-title">ঋণের তথ্য</div>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">মোট পরিমাণ</span>
                        <span className="detail-value" style={{color:'var(--brand)',fontSize:'18px'}}>{loan.amountDisplay}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">অবস্থা</span>
                        <span className="detail-value"><StatusBadge status={effectiveStatus} /></span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">উদ্দেশ্য / খাত</span>
                        <span className="detail-value">{loan.purpose}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">কিস্তি</span>
                        <span className="detail-value">{loan.installment}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">বিতরণের তারিখ</span>
                        <span className="detail-value">{loan.dateGiven}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">ফেরতের তারিখ</span>
                        <span className="detail-value">{loan.dateDue}</span>
                      </div>
                    </div>
                  </div>
                  <div className="drawer-section">
                    <div className="drawer-section-title">পরিশোধের অগ্রগতি</div>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:'12px',color:'var(--muted)',marginBottom:'6px'}}>
                      <span>পরিশোধিত: <strong style={{color:'var(--success)'}}>{loan.paidDisplay}</strong></span>
                      <span>বাকি: <strong style={{color:loan.remaining>0?'var(--warning)':'var(--muted)'}}>{loan.remainingDisplay}</strong></span>
                    </div>
                    <div style={{height:'8px',background:'var(--border)',borderRadius:'99px',marginBottom:'4px',overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${loan.pct}%`,background:effectiveStatus==='সম্পন্ন'?'var(--success)':effectiveStatus==='মেয়াদোত্তীর্ণ'?'var(--danger)':'var(--brand-mid)',borderRadius:'99px'}}></div>
                    </div>
                    <div style={{fontSize:'11px',color:'var(--muted)',textAlign:'right'}}>{loan.pct}% সম্পন্ন</div>
                  </div>
                  <div className="drawer-section">
                    <div className="drawer-section-title">কিস্তির ইতিহাস</div>
                    <table className="installment-table">
                      <thead>
                        <tr><th>কিস্তি</th><th>তারিখ</th><th>পরিমাণ</th><th>অবস্থা</th></tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>১ম কিস্তি</td>
                          <td style={{color:'var(--muted)'}}>১০ এপ্রিল ২০২৬</td>
                          <td className="money" style={{fontWeight:600}}>৳২,৫০০</td>
                          <td><span style={{color:'var(--success)',fontWeight:600}}>✓ পরিশোধিত</span></td>
                        </tr>
                        <tr>
                          <td>২য় কিস্তি</td>
                          <td style={{color:'var(--muted)'}}>১০ মে ২০২৬</td>
                          <td className="money" style={{fontWeight:600}}>৳২,৫০০</td>
                          <td><span style={{color:'var(--success)',fontWeight:600}}>✓ পরিশোধিত</span></td>
                        </tr>
                        <tr style={{background:'var(--brand-light)'}}>
                          <td><strong>৩য় কিস্তি</strong> <span style={{fontSize:'10px',background:'var(--brand)',color:'#fff',padding:'1px 5px',borderRadius:'4px',marginLeft:'4px'}}>সর্বশেষ</span></td>
                          <td style={{color:'var(--muted)'}}>১০ জুন ২০২৬</td>
                          <td className="money" style={{fontWeight:600}}>৳২,৫০০</td>
                          <td><span style={{color:'var(--success)',fontWeight:600}}>✓ পরিশোধিত</span></td>
                        </tr>
                        <tr>
                          <td>৪র্থ কিস্তি</td>
                          <td style={{color:'var(--muted)'}}>১০ জুলাই ২০২৬</td>
                          <td className="money" style={{fontWeight:600}}>৳২,৫০০</td>
                          <td><span style={{color:'var(--warning)',fontWeight:600}}>⏳ বাকি</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )
            })()}
          </div>
          <div className="drawer-footer">
            <button className="btn btn-primary btn-sm" onClick={() => showToast('ফেরত এন্ট্রি যোগ করুন','success')}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ফেরত এন্ট্রি
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('সম্পাদনা মোড','info')}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              সম্পাদনা
            </button>
            <button className="btn btn-sm" style={{background:'var(--danger-bg)',color:'var(--danger)',border:'1px solid oklch(90% 0.05 25)'}} onClick={() => {
              if (confirm('এই ঋণের রেকর্ড মুছে ফেলতে চান?')) {
                setDrawerOpen(false)
                showToast('ঋণের রেকর্ড মুছে ফেলা হয়েছে','danger')
              }
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              মুছুন
            </button>
          </div>
        </div>
      </div>

      {/* New Loan Modal */}
      <div className={`modal-backdrop-l${loanModalOpen?' open':''}`} onClick={e => { if (e.target === e.currentTarget) setLoanModalOpen(false) }}>
        <div className="modal-l">
          <div className="modal-header-l">
            <h2>নতুন ঋণ যোগ করুন</h2>
            <button className="modal-close-l" onClick={() => setLoanModalOpen(false)}>✕</button>
          </div>
          <div className="modal-body-l">
            <div className="form-grid-l">
              <div className="form-group-l full">
                <label className="form-label-l">ঋণগ্রহীতা <span className="req">*</span></label>
                <select className="input filter-select" style={{backgroundColor:'var(--surface)',padding:'10px 32px 10px 12px'}}>
                  <option value="">-- সদস্য নির্বাচন করুন --</option>
                  <option>আবদুল রহমান (#০০১)</option>
                  <option>রহিমা খাতুন (#০০২)</option>
                  <option>ইব্রাহিম শেখ (#০০৩)</option>
                  <option>সালেহা বেগম (#০০৪)</option>
                  <option>মো. আমির হোসেন (#০০৫)</option>
                </select>
              </div>
              <div className="form-group-l">
                <label className="form-label-l">ঋণের পরিমাণ (৳) <span className="req">*</span></label>
                <input type="number" className="input" placeholder="যেমন: ১৫০০০" />
              </div>
              <div className="form-group-l">
                <label className="form-label-l">খাত <span className="req">*</span></label>
                <select className="input filter-select" style={{backgroundColor:'var(--surface)',padding:'10px 32px 10px 12px'}}>
                  <option>জরুরি ঋণ</option>
                  <option>ব্যবসায়িক ঋণ</option>
                  <option>চিকিৎসা ঋণ</option>
                  <option>শিক্ষা ঋণ</option>
                </select>
              </div>
              <div className="form-group-l">
                <label className="form-label-l">বিতরণের তারিখ <span className="req">*</span></label>
                <input type="date" className="input" />
              </div>
              <div className="form-group-l">
                <label className="form-label-l">ফেরতের তারিখ <span className="req">*</span></label>
                <input type="date" className="input" />
              </div>
              <div className="form-group-l">
                <label className="form-label-l">মাসিক কিস্তি (৳)</label>
                <input type="number" className="input" placeholder="স্বয়ংক্রিয় গণনা" />
              </div>
              <div className="form-group-l">
                <label className="form-label-l">কিস্তির সংখ্যা</label>
                <input type="number" className="input" placeholder="যেমন: ৬" />
              </div>
              <div className="form-group-l full">
                <label className="form-label-l">উদ্দেশ্য / বিবরণ</label>
                <textarea className="input" rows={2} placeholder="ঋণের উদ্দেশ্য সংক্ষেপে লিখুন..."></textarea>
              </div>
            </div>
          </div>
          <div className="modal-footer-l">
            <button className="btn btn-ghost" onClick={() => setLoanModalOpen(false)}>বাতিল</button>
            <button className="btn btn-primary" onClick={() => { showToast('ঋণ সফলভাবে যোগ করা হয়েছে','success'); setLoanModalOpen(false) }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              ঋণ যোগ করুন
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`toast-l${toast.visible?' show':''}`}
        style={{background: toastColors[toast.type] || toastColors.success}}
      >
        {toast.msg}
      </div>
    </>
  )
}
