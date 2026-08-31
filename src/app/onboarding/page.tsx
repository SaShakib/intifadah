'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { useAuth } from '@/contexts/AuthContext';
import { completeUserProfile, getErrorMessage, isAdminRoleKey } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, roleKey, isReady, isAuthenticated, needsProfileCompletion, refreshMe } = useAuth();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [mobile, setMobile] = useState(user?.phone?.startsWith('g-') ? '' : user?.phone ?? '');
  const [addressLine, setAddressLine] = useState(user?.address ?? '');
  const [gender, setGender] = useState('0');
  const [wardNo, setWardNo] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isReady) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (!needsProfileCompletion) {
      router.replace(roleKey && isAdminRoleKey(roleKey) ? '/admin/dashboard' : '/user/dashboard');
    }
  }, [isAuthenticated, isReady, needsProfileCompletion, roleKey, router]);

  const save = async () => {
    if (!fullName.trim() || !mobile.trim() || !addressLine.trim()) {
      setError('নাম, মোবাইল নম্বর ও ঠিকানা দিন।');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await completeUserProfile({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        addressLine: addressLine.trim(),
        gender: Number(gender),
        wardNo: wardNo.trim() ? Number(wardNo) : undefined,
      });
      await refreshMe();
      router.replace(roleKey && isAdminRoleKey(roleKey) ? '/admin/dashboard' : '/user/dashboard');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || !isAuthenticated || !needsProfileCompletion) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-2 px-4 py-8">
      <section className="w-full max-w-lg rounded-lg border border-border bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-bold text-brand">Google account</p>
        <h1 className="mt-1 text-2xl font-bold text-fg">প্রোফাইল সম্পূর্ণ করুন</h1>
        <p className="mt-2 text-sm leading-6 text-muted">অ্যাকাউন্ট চালু করার আগে আপনার পরিচিতির তথ্য দিন।</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">পূর্ণ নাম</span>
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="আপনার নাম" autoComplete="name" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">মোবাইল নম্বর</span>
            <Input value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="tel" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">লিঙ্গ</span>
            <select value={gender} onChange={(event) => setGender(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-white px-3 text-sm text-fg outline-none focus:border-brand focus:ring-2 focus:ring-brand-light">
              <option value="0">বলতে চাই না</option>
              <option value="1">পুরুষ</option>
              <option value="2">নারী</option>
              <option value="3">অন্যান্য</option>
            </select>
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">ঠিকানা</span>
            <Input value={addressLine} onChange={(event) => setAddressLine(event.target.value)} placeholder="আপনার ঠিকানা" autoComplete="street-address" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold text-fg-2">ওয়ার্ড নম্বর</span>
            <Input value={wardNo} onChange={(event) => setWardNo(event.target.value)} placeholder="ঐচ্ছিক" inputMode="numeric" />
          </label>
          {user?.email && <p className="self-end pb-2 text-xs text-muted">Google ইমেইল: {user.email}</p>}
        </div>

        {error && <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button fullWidth size="lg" className="mt-6" onClick={() => void save()} disabled={saving}>
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'অ্যাকাউন্ট চালু করুন'}
        </Button>
      </section>
    </main>
  );
}
