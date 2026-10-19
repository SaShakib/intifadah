'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PageStack } from '@/components/custom/PageStack';
import { Button } from '@/components/base/Button';
import MemorizationSection from '../_sections/memorization-section';

export default function UserQuranMemorizationPage() {
  return (
    <PageStack>
      <div className="flex items-center gap-2">
        <Link href="/user/quran">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />Quran ও Namaj
          </Button>
        </Link>
      </div>
      <MemorizationSection />
    </PageStack>
  );
}
