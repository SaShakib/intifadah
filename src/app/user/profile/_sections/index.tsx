'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { THEMES } from '@/lib/themes';
import { changePasswordApi, getErrorMessage, queryKeys, updateUserProfile as updateUserProfileApi, useApiMutation } from '@/lib/api';
import { Avatar } from '@/components/base/Avatar';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { Card } from '@/components/semibase/Card';
import { MetricCard } from '@/components/semibase/MetricCard';
import { SectionHeader } from '@/components/semibase/SectionHeader';
import { PROFILE_PREFERENCES } from './constants';

const THEME_DOT_CLASS: Record<string, string> = {
  default: 'bg-[oklch(50%_0.26_354)]',
  green: 'bg-[oklch(44%_0.14_145)]',
  blue: 'bg-[oklch(55%_0.20_240)]',
  teal: 'bg-[oklch(52%_0.16_195)]',
};

export function ProfileTopSection() {
  const { user } = useAuth();

  return (
    <section className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <SectionHeader title="প্রোফাইল তথ্য" subtitle="আপনার অ্যাকাউন্টের মূল পরিচিতি" />
        <div className="flex flex-wrap items-center gap-4">
          <Avatar initials={user?.initials ?? 'র'} size="lg" className="bg-brand text-white" />
          <div className="space-y-1">
            <p className="text-lg font-bold text-fg">{user?.name ?? 'ব্যবহারকারী'}</p>
            <p className="text-sm text-fg-2">সদস্য আইডি: {user?.memberId ?? '-'}</p>
            <p className="text-sm text-muted">ফোন: {user?.phone ?? '-'}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 xl:col-span-2">
        <MetricCard label="অ্যাকাউন্ট স্ট্যাটাস" value={user?.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'} hint="বর্তমান অবস্থা" />
        <MetricCard label="ভূমিকা" value={user?.role ?? 'user'} hint="অ্যাক্সেস স্তর" />
      </div>
    </section>
  );
}

export function ProfileMiddleSection() {
  const { user, refreshMe } = useAuth();
  const { theme, setTheme } = useTheme();
  const [fullName, setFullName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [address, setAddress] = useState(user?.address ?? '');
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFullName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setAddress(user?.address ?? '');
  }, [user?.name, user?.email, user?.address]);

  const updateProfileMutation = useApiMutation(updateUserProfileApi, {
    cache: {
      optimistic: [
        {
          key: queryKeys.user.profile(),
          updater: (current, input) => {
            const base = (current as Record<string, unknown> | undefined) ?? {};
            return {
              ...base,
              fullName: input.fullName ?? base.fullName,
              email: input.email ?? base.email,
              addressLine: input.addressLine ?? base.addressLine,
            };
          },
          staleTimeMs: 60_000,
        },
      ],
      invalidate: [queryKeys.user.dashboard(), queryKeys.user.profile()],
    },
    onSuccess: async () => {
      await refreshMe();
    },
  });

  const save = async () => {
    setSaved(false);
    setSaveError(null);

    try {
      await updateProfileMutation.mutate({
        fullName: fullName.trim() || undefined,
        email: email.trim() || undefined,
        addressLine: address.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      setSaveError(updateProfileMutation.error ?? 'প্রোফাইল আপডেট করা যায়নি।');
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <SectionHeader title="ব্যক্তিগত সেটিংস" subtitle="অ্যাকাউন্ট তথ্য আপডেট করুন" />
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="নাম" />
          <Input value={user?.phone ?? ''} placeholder="ফোন নম্বর" readOnly />
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="ইমেইল" />
          <Input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="ঠিকানা" />
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={() => void save()} disabled={updateProfileMutation.loading}>
            {updateProfileMutation.loading ? 'সংরক্ষণ হচ্ছে...' : 'তথ্য সংরক্ষণ'}
          </Button>
        </div>
        {saved && <p className="mt-2 text-sm text-success">তথ্য হালনাগাদ করা হয়েছে।</p>}
        {saveError && <p className="mt-2 text-sm text-danger">{saveError}</p>}
      </Card>

      <Card className="xl:col-span-2">
        <SectionHeader title="থিম" subtitle="প্রিয় রঙ নির্বাচন করুন" />
        <div className="space-y-2">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                theme === themeOption.id
                  ? 'border-brand bg-brand-light text-brand'
                  : 'border-border bg-white text-fg-2'
              }`}
            >
              <span>{themeOption.label}</span>
              <span className={`h-3 w-3 rounded-full ${THEME_DOT_CLASS[themeOption.id] ?? 'bg-brand'}`} />
            </button>
          ))}
        </div>
      </Card>
    </section>
  );
}

export function ProfileBottomSection() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  const changePassword = async () => {
    setPasswordMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('বর্তমান ও নতুন পাসওয়ার্ড দিন।');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage('নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('নতুন পাসওয়ার্ড দুটি এক নয়।');
      return;
    }

    setChangingPassword(true);
    try {
      await changePasswordApi({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('পাসওয়ার্ড পরিবর্তন হয়েছে। অন্য ডিভাইসের সেশন বন্ধ করা হয়েছে।');
    } catch (error) {
      setPasswordMessage(getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section className="grid gap-4 xl:grid-cols-5">
      <Card className="xl:col-span-3">
        <SectionHeader title="নোটিফিকেশন পছন্দ" subtitle="আপনি কোন ধরনের আপডেট পেতে চান" />
        <div className="space-y-3">
          {PROFILE_PREFERENCES.map((preference) => (
            <label key={preference.id} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 accent-brand" />
              <span>
                <span className="block text-sm font-semibold text-fg">{preference.label}</span>
                <span className="block text-xs text-muted">{preference.description}</span>
              </span>
            </label>
          ))}
        </div>
      </Card>
      <Card className="xl:col-span-2">
        <SectionHeader title="পাসওয়ার্ড পরিবর্তন" subtitle="পুরোনো পাসওয়ার্ড যাচাই করে নতুনটি দিন" />
        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">বর্তমান পাসওয়ার্ড</span>
            <Input type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">নতুন পাসওয়ার্ড</span>
            <Input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">নতুন পাসওয়ার্ড আবার দিন</span>
            <Input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </label>
          <div className="flex justify-end pt-1">
            <Button onClick={() => void changePassword()} disabled={changingPassword}>
              {changingPassword ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন'}
            </Button>
          </div>
          {passwordMessage && <p className={`text-sm ${passwordMessage.startsWith('পাসওয়ার্ড পরিবর্তন হয়েছে') ? 'text-success' : 'text-danger'}`}>{passwordMessage}</p>}
        </div>
      </Card>
    </section>
  );
}
