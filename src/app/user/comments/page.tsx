'use client';

import { useState, useRef, useEffect } from 'react';

function toBengaliDigits(n: number | string) {
  return String(n).replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[+d]);
}

interface Message {
  sender: string;
  role: string;
  avatar: string;
  type: 'user' | 'manager';
  text: string;
  time: string;
}

interface Thread {
  id: number;
  subject: string;
  status: 'answered' | 'closed' | 'pending';
  date: string;
  messages: Message[];
}

const INITIAL_THREADS: Thread[] = [
  {
    id: 0,
    subject: 'ঋণের আবেদন সম্পর্কে',
    status: 'answered',
    date: '৫ দিন আগে',
    messages: [
      { sender: 'রহিম উদ্দিন', role: 'সাধারণ সদস্য', avatar: 'র.উ', type: 'user', text: 'আমি একটি ঋণের আবেদন করেছিলাম। কখন অনুমোদন হবে জানাবেন। আমার এই মাসে টাকার প্রয়োজন আছে।', time: '৫ দিন আগে, সকাল ১০:৩২' },
      { sender: 'মোঃ সালাউদ্দিন', role: 'ইনতিফাদাহ ম্যানেজার', avatar: 'ম.স', type: 'manager', text: 'আস-সালামু আলাইকুম রহিম ভাই। আপনার আবেদন পর্যালোচনা হচ্ছে। আশা করি ৩ কার্যদিবসের মধ্যে আপনাকে জানানো হবে। কোনো প্রশ্ন থাকলে জানাবেন।', time: '৪ দিন আগে, দুপুর ২:১৫' },
    ],
  },
  {
    id: 1,
    subject: 'সঞ্চয় স্কিম পরিবর্তন',
    status: 'closed',
    date: '২ সপ্তাহ আগে',
    messages: [
      { sender: 'রহিম উদ্দিন', role: 'সাধারণ সদস্য', avatar: 'র.উ', type: 'user', text: 'আমি মাসিক সঞ্চয়ের পরিমাণ ৫০০ টাকা থেকে বাড়িয়ে ১০০০ টাকা করতে চাই। এটা কি সম্ভব? কোনো বিশেষ প্রক্রিয়া আছে কি?', time: '২ সপ্তাহ আগে, সকাল ৯:০৫' },
      { sender: 'মোঃ সালাউদ্দিন', role: 'ইনতিফাদাহ ম্যানেজার', avatar: 'ম.স', type: 'manager', text: 'জি ভাই, আপনার অনুরোধ গ্রহণ করা হয়েছে। আগামী জুলাই মাস থেকে আপনার সঞ্চয় ১০০০ টাকায় কার্যকর হবে। জাযাকাল্লাহু খাইরান।', time: '১২ দিন আগে, বিকাল ৪:৪০' },
    ],
  },
  {
    id: 2,
    subject: 'প্রোফাইল আপডেট',
    status: 'pending',
    date: '১ দিন আগে',
    messages: [
      { sender: 'রহিম উদ্দিন', role: 'সাধারণ সদস্য', avatar: 'র.উ', type: 'user', text: 'আমার ঠিকানা আপডেট করতে হবে। নতুন ঠিকানা: ওয়ার্ড ৫, উত্তর বাড়িয়া, কুমিল্লা সদর। দয়া করে রেকর্ড আপডেট করুন।', time: 'গতকাল, সন্ধ্যা ৭:২০' },
    ],
  },
];

function statusBadgeInfo(status: string) {
  const map: Record<string, { cls: string; label: string; icon: string }> = {
    answered: { cls: 'badge-success', label: 'উত্তর দেওয়া হয়েছে', icon: '✓' },
    closed:   { cls: 'badge-muted',   label: 'বন্ধ',               icon: '×' },
    pending:  { cls: 'badge-warning', label: 'উত্তরের অপেক্ষায়', icon: '⏳' },
  };
  return map[status] || map.pending;
}

export default function CommentsPage() {
  const [threads, setThreads] = useState<Thread[]>(INITIAL_THREADS);
  const [activeThreadIdx, setActiveThreadIdx] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReplyText, setModalReplyText] = useState('');
  const [msgCategory, setMsgCategory] = useState('');
  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [fileLabel, setFileLabel] = useState('ফাইল নির্বাচন করুন');
  const [composeSuccess, setComposeSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<{ id: number; icon: string; message: string }[]>([]);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  const showToast = (icon: string, message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, icon, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
  };

  const openThread = (idx: number) => {
    setActiveThreadIdx(idx);
    setModalReplyText('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setActiveThreadIdx(null);
    setModalReplyText('');
  };

  useEffect(() => {
    if (modalOpen && modalBodyRef.current) {
      modalBodyRef.current.scrollTop = modalBodyRef.current.scrollHeight;
    }
  }, [modalOpen, activeThreadIdx, threads]);

  const sendModalReply = () => {
    if (activeThreadIdx === null) return;
    const text = modalReplyText.trim();
    if (!text) { showToast('⚠️', 'উত্তর লিখুন'); return; }

    setThreads(prev => {
      const updated = [...prev];
      const t = { ...updated[activeThreadIdx] };
      t.messages = [...t.messages, { sender: 'রহিম উদ্দিন', role: 'সাধারণ সদস্য', avatar: 'র.উ', type: 'user', text, time: 'এইমাত্র' }];
      if (t.status === 'answered') t.status = 'pending';
      updated[activeThreadIdx] = t;
      return updated;
    });
    setModalReplyText('');
    showToast('✅', 'আপনার উত্তর পাঠানো হয়েছে');
  };

  const handleMsgBodyChange = (v: string) => {
    if (v.length <= 500) {
      setMsgBody(v);
      setCharCount(v.length);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setFileLabel('ফাইল নির্বাচন করুন'); return; }
    if (file.size > 2 * 1024 * 1024) {
      showToast('⚠️', 'ফাইলের আকার ২MB এর বেশি হতে পারবে না');
      e.target.value = '';
      return;
    }
    setFileLabel(file.name);
    showToast('📎', `"${file.name}" যোগ হয়েছে`);
  };

  const handleComposeSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!msgCategory) errors.msgCategory = true;
    if (!msgSubject.trim()) errors.msgSubject = true;
    if (!msgBody.trim()) errors.msgBody = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('⚠️', 'সব প্রয়োজনীয় তথ্য পূরণ করুন');
      return;
    }
    setFormErrors({});

    const newThread: Thread = {
      id: threads.length,
      subject: msgSubject.trim(),
      status: 'pending',
      date: 'এইমাত্র',
      messages: [{ sender: 'রহিম উদ্দিন', role: 'সাধারণ সদস্য', avatar: 'র.উ', type: 'user', text: msgBody.trim(), time: 'এইমাত্র' }],
    };
    setThreads(prev => [newThread, ...prev]);
    setComposeSuccess(true);
    showToast('✅', 'বার্তা সফলভাবে পাঠানো হয়েছে');
  };

  const resetComposeForm = () => {
    setMsgCategory(''); setMsgSubject(''); setMsgBody(''); setCharCount(0);
    setFileLabel('ফাইল নির্বাচন করুন'); setFormErrors({}); setComposeSuccess(false);
  };

  const activeThread = activeThreadIdx !== null ? threads[activeThreadIdx] : null;

  return (
    <>
      <style>{`
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); box-shadow: var(--sh-sm); }
        .glass-card {
          background: oklch(100% 0 0 / 0.75); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid oklch(100% 0 0 / 0.35); border-radius: var(--r-lg);
          box-shadow: 0 8px 32px oklch(50% 0.26 354 / 0.12), inset 0 1px 0 oklch(100% 0 0 / 0.5);
        }

        .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 11.5px; font-weight: 600; white-space: nowrap; flex-shrink: 0; }
        .badge-success  { background: var(--success-bg); color: var(--success); }
        .badge-warning  { background: var(--warning-bg); color: var(--warning); }
        .badge-muted    { background: oklch(95% 0.003 300); color: var(--muted); }

        .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 0 18px; height: 40px; border-radius: var(--r-sm); border: none; cursor: pointer; font-family: var(--font); font-size: 13.5px; font-weight: 600; transition: all 150ms cubic-bezier(0, 0, 0.2, 1); white-space: nowrap; }
        .btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .btn-primary { background: var(--brand); color: #fff; box-shadow: 0 2px 8px oklch(50% 0.26 354 / 0.30); }
        .btn-primary:hover { background: var(--brand-mid); transform: translateY(-1px); box-shadow: 0 4px 14px oklch(50% 0.26 354 / 0.40); }
        .btn-primary:active { transform: translateY(0); box-shadow: none; }
        .btn-ghost { background: transparent; color: var(--fg-2); border: 1px solid var(--border); }
        .btn-ghost:hover { background: var(--surface-2); border-color: oklch(82% 0.008 354); }
        .btn-sm { height: 34px; padding: 0 14px; font-size: 13px; }

        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 600; color: var(--fg-2); }
        .form-label span.req { color: var(--brand); margin-left: 2px; }
        .form-hint { font-size: 11.5px; color: var(--muted); margin-top: 2px; }

        .form-control {
          width: 100%; padding: 10px 13px; background: var(--surface); border: 1.5px solid var(--border);
          border-radius: var(--r-sm); font-family: var(--font); font-size: 13.5px; color: var(--fg);
          transition: border-color 150ms, box-shadow 150ms; appearance: none; -webkit-appearance: none;
        }
        .form-control:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .form-control::placeholder { color: oklch(68% 0.005 300); }
        .form-control.error { border-color: var(--danger); }
        .form-control.error:focus { box-shadow: 0 0 0 3px oklch(52% 0.18 25 / 0.12); }
        select.form-control { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; padding-right: 34px; cursor: pointer; }
        textarea.form-control { resize: vertical; line-height: 1.6; }

        .char-counter { font-size: 11.5px; color: var(--muted); text-align: right; margin-top: 4px; }
        .char-counter.near-limit { color: var(--warning); }
        .char-counter.at-limit   { color: var(--danger); }

        .file-input-wrapper { position: relative; }
        .file-input-label { display: flex; align-items: center; gap: 8px; padding: 10px 13px; background: var(--surface); border: 1.5px dashed var(--border); border-radius: var(--r-sm); cursor: pointer; transition: all 150ms; color: var(--muted); font-size: 13px; }
        .file-input-label:hover { border-color: var(--brand); background: var(--brand-light); color: var(--brand); }
        .file-input-label .file-icon { font-size: 16px; }
        input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; }

        .info-banner { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: var(--info-bg); border: 1px solid oklch(75% 0.1 240 / 0.3); border-radius: var(--r-sm); color: var(--info); font-size: 13px; font-weight: 500; margin-bottom: 24px; }

        .page-header { margin-bottom: 24px; }
        .page-header-title { font-size: 22px; font-weight: 800; color: var(--fg); letter-spacing: -0.03em; line-height: 1.2; margin-bottom: 4px; }
        .page-header-sub { font-size: 13.5px; color: var(--muted); font-weight: 400; }

        .comments-layout { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }

        .threads-panel { display: flex; flex-direction: column; gap: 0; }
        .threads-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .threads-title { font-size: 15px; font-weight: 700; color: var(--fg); display: flex; align-items: center; gap: 8px; }
        .threads-count { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: var(--brand-light); color: var(--brand); border-radius: 50%; font-size: 11px; font-weight: 700; }

        .thread-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r); padding: 16px 18px; cursor: pointer; transition: all 150ms cubic-bezier(0, 0, 0.2, 1); position: relative; overflow: hidden; margin-bottom: 10px; }
        .thread-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--border); transition: background 150ms; }
        .thread-card:hover { border-color: oklch(83% 0.06 354); box-shadow: var(--sh); transform: translateY(-1px); }
        .thread-card:hover::before { background: var(--brand); }
        .thread-card:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
        .thread-card.status-pending::before  { background: var(--warning); }
        .thread-card.status-answered::before { background: var(--success); }
        .thread-card.status-closed::before   { background: var(--muted); }

        .thread-card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .thread-subject { flex: 1; font-size: 14px; font-weight: 700; color: var(--fg); line-height: 1.3; }
        .thread-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap; }
        .thread-date { font-size: 11.5px; color: var(--muted); display: flex; align-items: center; gap: 4px; }
        .thread-preview { font-size: 13px; color: var(--fg-2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .thread-reply-preview { margin-top: 10px; padding: 10px 12px; background: oklch(97% 0.015 145 / 0.6); border: 1px solid oklch(80% 0.08 145 / 0.3); border-radius: var(--r-sm); display: flex; gap: 8px; }
        .thread-reply-preview.pending-reply { background: var(--warning-bg); border-color: oklch(80% 0.1 80 / 0.3); }
        .thread-reply-icon { font-size: 13px; flex-shrink: 0; margin-top: 1px; }
        .thread-reply-text { font-size: 12.5px; color: var(--fg-2); line-height: 1.4; }
        .thread-reply-author { font-size: 11px; color: var(--muted); margin-top: 3px; }
        .thread-expand-hint { font-size: 11.5px; color: var(--brand); margin-top: 10px; display: flex; align-items: center; gap: 4px; font-weight: 500; transition: gap 150ms; }
        .thread-card:hover .thread-expand-hint { gap: 7px; }

        .compose-panel { position: sticky; top: calc(var(--topbar-h, 60px) + 16px); }
        .compose-card { padding: 22px; }
        .compose-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
        .compose-icon { width: 38px; height: 38px; border-radius: 10px; background: linear-gradient(135deg, oklch(94% 0.08 354), var(--brand-light)); display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; box-shadow: inset 0 1px 0 oklch(100% 0 0 / 0.5); }
        .compose-title { font-size: 15px; font-weight: 700; color: var(--fg); }
        .compose-subtitle { font-size: 12px; color: var(--muted); margin-top: 1px; }
        .compose-form { display: flex; flex-direction: column; gap: 16px; }

        .compose-success { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 32px 20px; text-align: center; }
        .compose-success-icon { width: 60px; height: 60px; border-radius: 50%; background: var(--success-bg); display: flex; align-items: center; justify-content: center; font-size: 28px; animation: successPop 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes successPop { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .compose-success-title { font-size: 15px; font-weight: 700; color: var(--success); }
        .compose-success-body { font-size: 13px; color: var(--fg-2); line-height: 1.6; }

        .modal-backdrop {
          display: none; position: fixed; inset: 0;
          background: oklch(0% 0 0 / 0.45); z-index: 300;
          backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
          align-items: center; justify-content: center; padding: 24px;
        }
        .modal-backdrop.open { display: flex; animation: fadeIn 150ms cubic-bezier(0, 0, 0.2, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal { background: var(--surface); border-radius: var(--r-lg); box-shadow: 0 24px 64px oklch(0% 0 0 / 0.25), 0 8px 24px oklch(50% 0.26 354 / 0.15); width: 100%; max-width: 640px; max-height: 88vh; display: flex; flex-direction: column; overflow: hidden; animation: slideUp 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

        .modal-header { padding: 20px 22px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: flex-start; gap: 12px; flex-shrink: 0; }
        .modal-header-main { flex: 1; }
        .modal-subject { font-size: 16px; font-weight: 800; color: var(--fg); letter-spacing: -0.02em; line-height: 1.2; margin-bottom: 6px; }
        .modal-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .modal-close { width: 34px; height: 34px; border-radius: 50%; border: none; background: var(--surface-2); cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all 150ms; font-size: 18px; flex-shrink: 0; }
        .modal-close:hover { background: var(--danger-bg); color: var(--danger); }
        .modal-close:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

        .modal-body { flex: 1; overflow-y: auto; padding: 20px 22px; scrollbar-width: thin; scrollbar-color: var(--border) transparent; display: flex; flex-direction: column; gap: 16px; }

        .message-item { display: flex; gap: 12px; }
        .message-avatar { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
        .message-avatar.user-msg { background: linear-gradient(135deg, var(--brand), oklch(60% 0.20 354)); color: #fff; }
        .message-avatar.manager-msg { background: linear-gradient(135deg, oklch(60% 0.16 240), oklch(45% 0.18 260)); color: #fff; }
        .message-bubble-wrap { flex: 1; }
        .message-sender-line { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; }
        .message-sender-name { font-size: 13px; font-weight: 700; color: var(--fg); }
        .message-sender-role { font-size: 11px; color: var(--muted); }
        .message-sender-time { font-size: 11px; color: var(--muted); margin-left: auto; }
        .message-bubble { padding: 12px 14px; border-radius: 0 var(--r) var(--r) var(--r); font-size: 13.5px; line-height: 1.6; color: var(--fg); }
        .message-bubble.user-bubble { background: var(--brand-light); border: 1px solid oklch(88% 0.07 354); }
        .message-bubble.manager-bubble { background: oklch(97% 0.015 240); border: 1px solid oklch(88% 0.05 240); }
        .message-bubble.pending-bubble { background: var(--warning-bg); border: 1px solid oklch(88% 0.08 80 / 0.4); color: var(--warning); font-style: italic; display: flex; align-items: center; gap: 8px; }

        .modal-divider { display: flex; align-items: center; gap: 10px; color: var(--muted); font-size: 11.5px; }
        .modal-divider::before, .modal-divider::after { content: ''; flex: 1; height: 1px; background: var(--border); }

        .modal-footer { padding: 16px 22px 20px; border-top: 1px solid var(--border); flex-shrink: 0; background: var(--surface-2); }
        .modal-reply-label { font-size: 12.5px; font-weight: 600; color: var(--fg-2); margin-bottom: 8px; }
        .modal-reply-row { display: flex; gap: 8px; align-items: flex-end; }
        .modal-reply-textarea { flex: 1; padding: 10px 12px; background: var(--surface); border: 1.5px solid var(--border); border-radius: var(--r-sm); font-family: var(--font); font-size: 13px; color: var(--fg); resize: none; min-height: 70px; transition: border-color 150ms, box-shadow 150ms; line-height: 1.5; }
        .modal-reply-textarea:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px oklch(50% 0.26 354 / 0.12); }
        .modal-send-btn { width: 44px; height: 44px; border-radius: var(--r-sm); border: none; background: var(--brand); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 150ms; flex-shrink: 0; align-self: flex-end; }
        .modal-send-btn:hover { background: var(--brand-mid); transform: scale(1.05); }
        .modal-send-btn:active { transform: scale(0.97); }
        .modal-send-btn:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }

        .toast-container { position: fixed; bottom: 24px; right: 24px; z-index: 500; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
        .toast { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: oklch(15% 0.01 300); color: #fff; border-radius: var(--r); box-shadow: 0 8px 24px oklch(0% 0 0 / 0.25); font-size: 13px; font-weight: 500; max-width: 320px; pointer-events: all; animation: toastIn 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes toastIn { from { transform: translateY(10px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .toast-icon { font-size: 16px; flex-shrink: 0; }

        .empty-state { text-align: center; padding: 40px 20px; color: var(--muted); }
        .empty-state-icon { font-size: 40px; margin-bottom: 10px; opacity: 0.5; }
        .empty-state-text { font-size: 13.5px; }

        @media (max-width: 1023px) {
          .comments-layout { grid-template-columns: 1fr; }
          .compose-panel { position: static; order: -1; }
        }
        @media (max-width: 767px) {
          .page-content { padding: 20px 16px calc(68px + 20px); }
          .modal-backdrop { padding: 0; align-items: flex-end; }
          .modal { border-radius: var(--r-lg) var(--r-lg) 0 0; max-height: 92vh; animation: slideUpMobile 250ms cubic-bezier(0.34, 1.56, 0.64, 1); }
          @keyframes slideUpMobile { from { transform: translateY(100%); } to { transform: translateY(0); } }
          .page-header-title { font-size: 18px; }
        }
      `}</style>

      {/* Page header */}
      <div className="page-header">
        <h1 className="page-header-title">মন্তব্য ও বার্তা</h1>
        <p className="page-header-sub">ইনতিফাদাহ ম্যানেজারদের সাথে যোগাযোগ করুন</p>
      </div>

      {/* Info banner */}
      <div className="info-banner" role="note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>আপনার বার্তা শুধু ইনতিফাদাহর ম্যানেজাররা দেখতে পাবেন</span>
      </div>

      {/* Two-column layout */}
      <div className="comments-layout">

        {/* LEFT: Thread list */}
        <div className="threads-panel">
          <div className="threads-header">
            <div className="threads-title">
              আপনার বার্তাসমূহ
              <span className="threads-count">{toBengaliDigits(threads.length)}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => showToast('🔍', 'ফিল্টার বিকল্প শীঘ্রই আসছে')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              ফিল্টার
            </button>
          </div>

          <div>
            {threads.map((t, idx) => {
              const badge = statusBadgeInfo(t.status);
              const lastMsg = t.messages[t.messages.length - 1];
              const prevMsg = t.messages.length >= 2 ? t.messages[t.messages.length - 1] : null;
              return (
                <article
                  key={t.id}
                  className={`thread-card status-${t.status}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${t.subject} বার্তাটি দেখুন`}
                  onClick={() => openThread(idx)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') openThread(idx); }}
                >
                  <div className="thread-card-header">
                    <div className="thread-subject">{t.subject}</div>
                    <span className={`badge ${badge.cls}`}>{badge.icon} {badge.label}</span>
                  </div>
                  <div className="thread-meta">
                    <span className="thread-date">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {t.date}
                    </span>
                  </div>
                  <p className="thread-preview">{t.messages[0].text}</p>
                  {prevMsg ? (
                    <div className={`thread-reply-preview${t.status === 'pending' ? ' pending-reply' : ''}`}>
                      <span className="thread-reply-icon">{t.status === 'pending' ? '⏳' : '↩'}</span>
                      <div>
                        <div className="thread-reply-text">
                          {t.status === 'pending' ? 'উত্তরের অপেক্ষায়...' : `${prevMsg.text.slice(0, 80)}${prevMsg.text.length > 80 ? '...' : ''}`}
                        </div>
                        <div className="thread-reply-author">
                          {t.status === 'pending' ? 'ম্যানেজাররা শীঘ্রই উত্তর দেবেন' : `${prevMsg.sender} · ${prevMsg.time}`}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="thread-reply-preview pending-reply">
                      <span className="thread-reply-icon">⏳</span>
                      <div>
                        <div className="thread-reply-text">উত্তরের অপেক্ষায়...</div>
                        <div className="thread-reply-author">ম্যানেজাররা শীঘ্রই উত্তর দেবেন</div>
                      </div>
                    </div>
                  )}
                  <div className="thread-expand-hint">বিস্তারিত দেখুন →</div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Compose form */}
        <div className="compose-panel">
          <div className="glass-card compose-card">
            <div className="compose-header">
              <div className="compose-icon" aria-hidden="true">✍️</div>
              <div>
                <div className="compose-title">নতুন বার্তা পাঠান</div>
                <div className="compose-subtitle">ম্যানেজারদের কাছে আপনার প্রশ্ন বা অনুরোধ পাঠান</div>
              </div>
            </div>

            {!composeSuccess ? (
              <form className="compose-form" onSubmit={handleComposeSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label" htmlFor="msgCategory">বিষয়<span className="req">*</span></label>
                  <select
                    className={`form-control${formErrors.msgCategory ? ' error' : ''}`}
                    id="msgCategory"
                    required
                    value={msgCategory}
                    onChange={e => { setMsgCategory(e.target.value); if (e.target.value) setFormErrors(p => ({ ...p, msgCategory: false })); }}
                  >
                    <option value="">— বিষয় নির্বাচন করুন —</option>
                    <option value="loan">ঋণের আবেদন</option>
                    <option value="savings">সঞ্চয় সম্পর্কে</option>
                    <option value="donation">দান সম্পর্কে</option>
                    <option value="profile">প্রোফাইল আপডেট</option>
                    <option value="complaint">অভিযোগ</option>
                    <option value="suggestion">পরামর্শ</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="msgSubject">বিষয়ের শিরোনাম<span className="req">*</span></label>
                  <input
                    type="text"
                    className={`form-control${formErrors.msgSubject ? ' error' : ''}`}
                    id="msgSubject"
                    placeholder="যেমন: ঋণ অনুমোদনের বিষয়ে"
                    required
                    maxLength={120}
                    value={msgSubject}
                    onChange={e => { setMsgSubject(e.target.value); if (e.target.value.trim()) setFormErrors(p => ({ ...p, msgSubject: false })); }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="msgBody">বার্তা<span className="req">*</span></label>
                  <textarea
                    className={`form-control${formErrors.msgBody ? ' error' : ''}`}
                    id="msgBody"
                    rows={5}
                    placeholder="আপনার বার্তা এখানে লিখুন..."
                    required
                    maxLength={500}
                    value={msgBody}
                    onChange={e => { handleMsgBodyChange(e.target.value); if (e.target.value.trim()) setFormErrors(p => ({ ...p, msgBody: false })); }}
                  />
                  <div className={`char-counter${charCount >= 500 ? ' at-limit' : charCount >= 425 ? ' near-limit' : ''}`} aria-live="polite">
                    {toBengaliDigits(charCount)} / {toBengaliDigits(500)}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="msgAttachment">সংযুক্তি <span style={{ fontWeight: 400, color: 'var(--muted)' }}>(ঐচ্ছিক)</span></label>
                  <div className="file-input-wrapper">
                    <label className="file-input-label">
                      <span className="file-icon">📎</span>
                      <span>{fileLabel}</span>
                      <input
                        type="file"
                        id="msgAttachment"
                        accept="image/*,.pdf,.doc,.docx"
                        onChange={handleFileSelect}
                      />
                    </label>
                  </div>
                  <div className="form-hint">সর্বোচ্চ ২MB · ছবি, PDF বা Word ডকুমেন্ট</div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', fontSize: '14px' }}>
                  বার্তা পাঠান
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </form>
            ) : (
              <div className="compose-success" aria-live="polite" role="status">
                <div className="compose-success-icon">✅</div>
                <div className="compose-success-title">বার্তা পাঠানো হয়েছে!</div>
                <p className="compose-success-body">আপনার বার্তা পাঠানো হয়েছে। ম্যানেজাররা শীঘ্রই উত্তর দেবেন।</p>
                <button className="btn btn-ghost btn-sm" onClick={resetComposeForm} style={{ marginTop: '4px' }}>
                  নতুন বার্তা পাঠান
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* THREAD MODAL */}
      <div
        className={`modal-backdrop${modalOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalSubject"
        onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
      >
        <div className="modal">
          <div className="modal-header">
            <div className="modal-header-main">
              <h2 className="modal-subject" id="modalSubject">{activeThread?.subject}</h2>
              <div className="modal-meta">
                {activeThread && (() => {
                  const bm = { answered: { cls: 'badge-success', label: 'উত্তর দেওয়া হয়েছে' }, closed: { cls: 'badge-muted', label: 'বন্ধ' }, pending: { cls: 'badge-warning', label: 'উত্তরের অপেক্ষায়' } };
                  const b = bm[activeThread.status] || bm.pending;
                  return <span className={`badge ${b.cls}`}>{b.label}</span>;
                })()}
                <span className="thread-date">{activeThread?.date}</span>
              </div>
            </div>
            <button className="modal-close" onClick={closeModal} aria-label="বন্ধ করুন">×</button>
          </div>

          <div className="modal-body" ref={modalBodyRef} aria-live="polite">
            {activeThread?.messages.map((msg, i) => (
              <div key={i}>
                {i > 0 && <div className="modal-divider" aria-hidden="true">↓</div>}
                <div className="message-item">
                  <div className={`message-avatar ${msg.type === 'user' ? 'user-msg' : 'manager-msg'}`} aria-hidden="true">{msg.avatar}</div>
                  <div className="message-bubble-wrap">
                    <div className="message-sender-line">
                      <span className="message-sender-name">{msg.sender}</span>
                      <span className="message-sender-role">{msg.role}</span>
                      <span className="message-sender-time">{msg.time}</span>
                    </div>
                    <div className={`message-bubble ${msg.type === 'user' ? 'user-bubble' : 'manager-bubble'}`}>{msg.text}</div>
                  </div>
                </div>
              </div>
            ))}
            {activeThread?.status === 'pending' && (
              <div className="message-item">
                <div className="message-avatar manager-msg" aria-hidden="true" style={{ opacity: 0.35 }}>ম</div>
                <div className="message-bubble-wrap">
                  <div className="message-bubble pending-bubble">⏳ ম্যানেজাররা উত্তর দেননি এখনও...</div>
                </div>
              </div>
            )}
          </div>

          {activeThread?.status !== 'closed' && (
            <div className="modal-footer">
              <div className="modal-reply-label">উত্তর দিন</div>
              <div className="modal-reply-row">
                <textarea
                  className="modal-reply-textarea"
                  value={modalReplyText}
                  onChange={e => setModalReplyText(e.target.value)}
                  placeholder="আপনার উত্তর লিখুন..."
                  rows={2}
                  maxLength={500}
                  aria-label="উত্তর"
                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); sendModalReply(); } }}
                />
                <button className="modal-send-btn" onClick={sendModalReply} aria-label="পাঠান">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOAST CONTAINER */}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <span className="toast-icon" aria-hidden="true">{t.icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}
