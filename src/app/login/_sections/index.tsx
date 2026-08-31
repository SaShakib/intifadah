import Image from 'next/image';
import { Eye, EyeOff, Smartphone, UserPlus } from 'lucide-react';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { LOGIN_FEATURES } from './constants';

interface LoginTopSectionProps {
  loading: boolean;
}

interface LoginMiddleSectionProps {
  showPassword: boolean;
  identifier: string;
  password: string;
  loading: boolean;
  error: string | null;
  onIdentifierChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onTogglePassword: () => void;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onRegister: () => void;
  onGoogleLogin: () => void;
  googleEnabled: boolean;
}

export function LoginTopSection({ loading }: LoginTopSectionProps) {
  return (
    <section className="order-2 relative flex min-h-[180px] flex-col justify-center overflow-hidden bg-[linear-gradient(160deg,oklch(10%_0.01_55)_0%,oklch(16%_0.04_354)_55%,oklch(28%_0.14_354)_100%)] p-7 text-white md:order-1 md:min-h-screen md:p-12">
      <div className="relative z-10">
        <Image src="/icons/intifadah.jpeg" alt="ইনতিফাদাহ" width={52} height={52} className="mb-5 h-[52px] w-[52px] rounded-[14px] border border-accent/50 object-cover" priority />
        <div>
          <h1 className="text-[32px] font-extrabold leading-tight">ইনতিফাদাহ</h1>
          <p className="mt-1 text-lg text-white/80">কর্যে হাসানাঃ</p>
        </div>

        <div className="mb-9 mt-7 inline-flex rounded-full border border-brand/50 bg-brand/30 px-4 py-1.5 text-xs font-semibold tracking-normal">
          দান • সঞ্চয় • ঋণ
        </div>

        <ul className="space-y-3.5 text-sm text-white/90">
          {LOGIN_FEATURES.map((feature) => (
            <li key={feature.id} className="flex items-center gap-3">
              <span className="inline-flex h-5 w-5 flex-none items-center justify-center rounded-full border border-white/50 text-xs">✓</span>
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t border-white/15 pt-7">
          <p className="text-xs leading-7 text-white/50">ইনতিফাদাহ একটি সুদমুক্ত সামাজিক<br />আর্থিক সহযোগিতা প্ল্যাটফর্ম।</p>
        </div>

        {loading && <p className="mt-8 text-sm text-white/60">লগইন যাচাই হচ্ছে...</p>}
      </div>
    </section>
  );
}

export function LoginMiddleSection({
  showPassword,
  identifier,
  password,
  loading,
  error,
  onIdentifierChange,
  onPasswordChange,
  onTogglePassword,
  onSubmit,
  onForgotPassword,
  onRegister,
  onGoogleLogin,
  googleEnabled,
}: LoginMiddleSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[400px]">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-fg">স্বাগতম</h2>
        <p className="mt-1 text-sm text-muted">আপনার অ্যাকাউন্টে লগইন করুন</p>
      </div>

      {googleEnabled && (
        <Button
          type="button"
          fullWidth
          size="lg"
          onClick={onGoogleLogin}
          disabled={loading}
          className="border border-[#246fda] bg-[#4285f4] text-white shadow-sm hover:bg-[#2879e8] focus-visible:ring-[#4285f4]/40"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-extrabold text-[#4285f4]" aria-hidden="true">G</span>
          Google দিয়ে চালিয়ে যান
        </Button>
      )}

      <div className="my-6 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">অথবা পাসওয়ার্ড দিয়ে</div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-fg-2">মোবাইল নম্বর বা ইমেইল</span>
          <div className="relative">
            <Smartphone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              type="text"
              value={identifier}
              onChange={(event) => onIdentifierChange(event.target.value)}
              placeholder="01XXXXXXXXX অথবা email@example.com"
              dir="ltr"
              className="pl-10"
            />
          </div>
        </label>

        <label className="block space-y-2">
          <span className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-fg-2">পাসওয়ার্ড</span>
            <button type="button" onClick={onForgotPassword} className="text-xs font-semibold text-brand hover:text-brand-mid">
              পাসওয়ার্ড ভুলে গেছেন?
            </button>
          </span>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="••••••••"
              className="pr-11"
            />
            <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg-2" aria-label={showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth disabled={loading || !identifier.trim() || !password.trim()}>
          {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
        </Button>
      </form>

      <div className="grid gap-2">
        <Button type="button" variant="secondary" fullWidth onClick={onRegister} disabled={loading}>
          <UserPlus className="h-4 w-4" />নতুন অ্যাকাউন্ট তৈরি করুন
        </Button>
        <p className="text-center text-xs leading-6 text-muted">
          নতুন ব্যবহারকারী সাধারণ সদস্য হিসেবে যুক্ত হবে। ইনতিফাদাহ সদস্য করতে অ্যাডমিন অনুমতি বদলাবে।
        </p>
      </div>
    </section>
  );
}

export function LoginBottomSection() {
  return (
    <section className="mx-auto w-full max-w-md text-center text-xs text-muted">
      সহায়তা: <a href="mailto:support@intifadah.org" className="font-semibold text-brand hover:text-brand-mid">support@intifadah.org</a>
    </section>
  );
}
