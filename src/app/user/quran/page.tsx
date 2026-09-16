'use client';

import { useState } from 'react';
import { CalendarCheck2, Target } from 'lucide-react';
import { PageStack } from '@/components/custom/PageStack';
import { cn } from '@/lib/utils/cn';
import TrackSection from './_sections/track-section';
import PlansSection from './_sections/plans-section';

type View = 'track' | 'plan';

const VIEWS: Array<{ value: View; label: string; icon: typeof CalendarCheck2 }> = [
  { value: 'track', label: 'ট্র্যাক', icon: CalendarCheck2 },
  { value: 'plan', label: 'প্ল্যান', icon: Target },
];

export default function UserQuranPage() {
  const [view, setView] = useState<View>('track');

  return (
    <PageStack>
      <div className="flex gap-1 rounded-xl border border-border bg-white p-1 shadow-sm" role="tablist" aria-label="Quran ও Namaj ভিউ">
        {VIEWS.map((item) => {
          const Icon = item.icon;
          const active = view === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setView(item.value)}
              className={cn(
                'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-bold transition',
                active ? 'bg-brand text-white shadow-sm' : 'text-fg-2 hover:bg-surface-2',
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {view === 'track' ? <TrackSection /> : <PlansSection />}
    </PageStack>
  );
}