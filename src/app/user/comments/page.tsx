'use client';

import { useState, useRef, useEffect } from 'react';
import { CURRENT_USER } from '@/lib/data/members';

interface Message {
  id: string;
  text: string;
  time: string;
  isFromAdmin: boolean;
  senderName: string;
  senderInitials: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1', isFromAdmin: true, senderName: 'অ্যাডমিন', senderInitials: 'অ',
    text: 'আস-সালামু আলাইকুম! আপনার মাসিক সঞ্চয় জমা দেওয়ার জন্য ধন্যবাদ। আপনার হিসাব আপডেট করা হয়েছে।',
    time: '০৯:৩০',
  },
  {
    id: 'm2', isFromAdmin: false, senderName: CURRENT_USER.name, senderInitials: CURRENT_USER.initials,
    text: 'ওয়ালাইকুমুস সালাম। আলহামদুলিল্লাহ। এই মাসে কি কোনো বিশেষ জমা দেওয়ার সুযোগ আছে?',
    time: '০৯:৪৫',
  },
  {
    id: 'm3', isFromAdmin: true, senderName: 'অ্যাডমিন', senderInitials: 'অ',
    text: 'হ্যাঁ, আপনি যেকোনো সময় সঞ্চয় জমা দিতে পারবেন। পেমেন্ট বিভাগে গিয়ে "সঞ্চয় জমা দিন" বোতামটি ব্যবহার করুন।',
    time: '১০:০০',
  },
  {
    id: 'm4', isFromAdmin: false, senderName: CURRENT_USER.name, senderInitials: CURRENT_USER.initials,
    text: 'ঠিক আছে। আমার ঋণের আবেদনের বিষয়ে কোনো আপডেট আছে কি?',
    time: '১০:১৫',
  },
  {
    id: 'm5', isFromAdmin: true, senderName: 'অ্যাডমিন', senderInitials: 'অ',
    text: 'আপনার ঋণের আবেদনটি বর্তমানে পর্যালোচনাধীন আছে। আগামী ২-৩ কার্যদিবসের মধ্যে জানানো হবে ইনশাআল্লাহ।',
    time: '১০:৩০',
  },
];

function Avatar({ initials, isAdmin }: { initials: string; isAdmin: boolean }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: 12, fontWeight: 700,
      background: isAdmin ? 'var(--brand)' : 'var(--info)',
      color: '#fff',
    }}>
      {initials}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = !msg.isFromAdmin;
  return (
    <div style={{ display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row', gap: 8, alignItems: 'flex-end', marginBottom: 16 }}>
      <Avatar initials={msg.senderInitials} isAdmin={msg.isFromAdmin} />
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>
          {msg.senderName} · {msg.time}
        </div>
        <div style={{
          padding: '10px 14px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser ? 'var(--brand)' : 'var(--surface)',
          color: isUser ? '#fff' : 'var(--fg)',
          fontSize: 13, lineHeight: 1.6,
          border: isUser ? 'none' : '1px solid var(--border)',
          boxShadow: 'var(--sh-sm)',
        }}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function CommentsPage() {
  const [messages, setMessages]   = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const bottomRef                 = useRef<HTMLDivElement>(null);
  const textareaRef               = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setSending(true);

    const newMsg: Message = {
      id: `m${Date.now()}`,
      isFromAdmin: false,
      senderName: CURRENT_USER.name,
      senderInitials: CURRENT_USER.initials,
      text,
      time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setSending(false);

    // Simulate admin reply
    setTimeout(() => {
      const reply: Message = {
        id: `m${Date.now() + 1}`,
        isFromAdmin: true,
        senderName: 'অ্যাডমিন',
        senderInitials: 'অ',
        text: 'ধন্যবাদ আপনার বার্তার জন্য। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব ইনশাআল্লাহ।',
        time: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', minHeight: 400 }}>
      {/* Header info */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--brand), var(--brand-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>অ</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>ইনতিফাদাহ অ্যাডমিন</div>
          <div style={{ fontSize: 11, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
            অনলাইন
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span className="badge badge-muted">{messages.length} বার্তা</span>
        </div>
      </div>

      {/* Messages area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0', scrollbarWidth: 'thin' }}>
        {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Compose area */}
      <div className="card" style={{ padding: '12px', marginTop: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            className="input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="বার্তা লিখুন..."
            rows={2}
            style={{ resize: 'none', flex: 1, fontSize: 13 }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0, height: 42, paddingLeft: 16, paddingRight: 16, opacity: !input.trim() ? 0.5 : 1 }}
          >
            পাঠান
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          Enter চেপে পাঠান · Shift+Enter নতুন লাইন
        </div>
      </div>
    </div>
  );
}
