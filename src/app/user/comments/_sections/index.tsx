'use client';

import { useState } from 'react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Badge } from '@/components/base/Badge';
import { Card } from '@/components/semibase/Card';
import { DataTable } from '@/components/semibase/DataTable';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { COMMENT_FAQ_ROWS, COMMENT_THREADS } from './constants';
import type { CommentThread } from './types';

interface CommentsTopSectionProps {
  threads?: CommentThread[];
}

interface CommentsMiddleSectionProps {
  threads?: CommentThread[];
}

interface CommentsBottomSectionProps {
  onSendMessage?: (subject: string, message: string) => Promise<void>;
}

export function CommentsTopSection({ threads = COMMENT_THREADS }: CommentsTopSectionProps) {
  const pending = threads.filter((thread) => thread.status === 'pending').length;

  return (
    <section>
      <SectionHeader title="মন্তব্য ও যোগাযোগ" subtitle="ম্যানেজারদের সাথে আপনার যোগাযোগ" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="মোট থ্রেড" value={String(threads.length)} hint="সকল যোগাযোগ" />
        <MetricCard label="অপেক্ষমাণ উত্তর" value={String(pending)} hint="ম্যানেজারদের রিভিউতে" />
        <MetricCard label="উত্তরপ্রাপ্ত" value={String(threads.length - pending)} hint="সম্পন্ন থ্রেড" />
        <MetricCard label="গড় রেসপন্স" value="২৪ ঘন্টা" hint="প্রত্যাশিত সময়" />
      </div>
    </section>
  );
}

export function CommentsMiddleSection({ threads = COMMENT_THREADS }: CommentsMiddleSectionProps) {
  const rows = threads.map((thread) => ({
    id: thread.id,
    tabValue: thread.status,
    searchText: `${thread.subject} ${thread.lastMessage} ${thread.date}`,
    sortValues: [thread.subject, thread.lastMessage, thread.date, thread.status],
    cells: [
      thread.subject,
      thread.lastMessage,
      thread.date,
      <Badge key={thread.id} variant={thread.status === 'pending' ? 'warning' : 'success'}>
        {thread.status === 'pending' ? 'অপেক্ষমাণ' : 'উত্তরপ্রাপ্ত'}
      </Badge>,
    ],
  }));

  return (
    <section>
      <Card>
        <SectionHeader title="থ্রেড তালিকা" subtitle="সর্বশেষ বার্তাগুলো" />
        <DataTable
          headers={['বিষয়', 'শেষ বার্তা', 'তারিখ', 'অবস্থা']}
          rows={rows}
          tabs={[
            { value: 'all', label: 'সব' },
            { value: 'pending', label: 'অপেক্ষমাণ' },
            { value: 'answered', label: 'উত্তরপ্রাপ্ত' },
          ]}
          searchPlaceholder="বিষয়, বার্তা বা তারিখ..."
        />
      </Card>
    </section>
  );
}

export function CommentsBottomSection({ onSendMessage }: CommentsBottomSectionProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    try {
      setSending(true);
      if (onSendMessage) {
        await onSendMessage(subject.trim(), message.trim());
      }
      setSent(true);
      setSubject('');
      setMessage('');
      setTimeout(() => setSent(false), 2000);
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <SectionHeader title="নতুন বার্তা পাঠান" subtitle="একটি নতুন বিষয় খুলুন" />
        <div className="space-y-3">
          <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="বিষয় লিখুন" />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="বিস্তারিত বার্তা লিখুন"
            className="h-28 w-full rounded-xl border border-border px-3 py-2 text-sm text-fg outline-none transition placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand-light"
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted">সাপোর্ট টিম সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দেয়</span>
            <Button onClick={() => void submit()} disabled={sending}>
              {sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
            </Button>
          </div>
          {sent && <p className="text-sm font-medium text-success">বার্তা পাঠানো হয়েছে।</p>}
        </div>
      </Card>

      <Card className="xl:col-span-2">
        <SectionHeader title="দ্রুত সহায়তা" subtitle="সাধারণ প্রশ্ন" />
        <DataTable headers={['প্রশ্ন', 'উত্তর']} rows={COMMENT_FAQ_ROWS} />
      </Card>
    </section>
  );
}
