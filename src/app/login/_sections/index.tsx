import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { LOGIN_FEATURES } from './constants';
import type { LoginRole } from './types';

interface LoginTopSectionProps {
  loading: boolean;
  onQuickFill: (role: LoginRole) => void;
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
}

export function LoginTopSection({ loading, onQuickFill }: LoginTopSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-none bg-[linear-gradient(160deg,oklch(10%_0.01_55)_0%,oklch(16%_0.04_354)_55%,oklch(28%_0.14_354)_100%)] p-8 text-white md:rounded-r-[2rem] md:p-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/20 text-2xl font-bold text-accent">ই</div>
        <div>
          <h1 className="text-3xl font-extrabold">ইনতিফাদাহ</h1>
          <p className="text-sm text-white/70">কর্যে হাসানাঃ</p>
        </div>
      </div>

      <div className="mb-8 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold">
        দান • সঞ্চয় • ঋণ
      </div>

      <ul className="space-y-3 text-sm text-white/90">
        {LOGIN_FEATURES.map((feature) => (
          <li key={feature.id} className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/40 text-xs">✓</span>
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 space-y-2">
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onQuickFill('admin')}
          disabled={loading}
          className="justify-center border-white/30 bg-white/10 text-white hover:bg-white/20"
        >
          অ্যাডমিন তথ্য বসান
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={() => onQuickFill('user')}
          disabled={loading}
          className="justify-center border-white/30 bg-white/10 text-white hover:bg-white/20"
        >
          সদস্য তথ্য বসান
        </Button>
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
}: LoginMiddleSectionProps) {
  return (
    <section className="mx-auto w-full max-w-md rounded-3xl border border-border bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-fg">স্বাগতম! 👋</h2>
        <p className="mt-1 text-sm text-muted">আপনার অ্যাকাউন্টে লগইন করুন</p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium text-fg-2">মোবাইল নম্বর বা ইমেইল</span>
          <Input
            type="text"
            value={identifier}
            onChange={(event) => onIdentifierChange(event.target.value)}
            placeholder="01XXXXXXXXX অথবা email@example.com"
            dir="ltr"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-fg-2">পাসওয়ার্ড</span>
          <div className="flex gap-2">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder="••••••••"
              className="flex-1"
            />
            <Button type="button" variant="ghost" size="sm" onClick={onTogglePassword}>
              {showPassword ? 'Hide' : 'Show'}
            </Button>
          </div>
        </label>

        {error && <p className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth disabled={loading || !identifier.trim() || !password.trim()}>
          {loading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
        </Button>
      </form>
    </section>
  );
}

export function LoginBottomSection() {
  return (
    <section className="mx-auto w-full max-w-md text-center text-xs text-muted">
      ব্যাকএন্ড API যুক্ত সংস্করণ। লগইন ব্যর্থ হলে সঠিক ইমেইল/মোবাইল ও পাসওয়ার্ড দিন।
    </section>
  );
}
