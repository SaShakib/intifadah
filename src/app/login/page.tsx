'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/Button';
import { Input } from '@/components/base/Input';
import { AppModal } from '@/components/semibase/AppModal';
import { useAuth } from '@/contexts/AuthContext';
import { forgotPasswordApi, getAuthSession, getErrorMessage, isAdminRoleKey, resetPasswordApi } from '@/lib/api';
import { LoginBottomSection, LoginMiddleSection, LoginTopSection } from './_sections';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerMessage, setRegisterMessage] = useState<string | null>(null);
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    addressLine: '',
  });
  const [googleReady, setGoogleReady] = useState(false);
  const { isAuthenticated, isReady, login, loginWithGoogle, register, roleKey, needsProfileCompletion } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    router.replace(needsProfileCompletion ? '/onboarding' : roleKey && isAdminRoleKey(roleKey) ? '/admin/dashboard' : '/user/dashboard');
  }, [isAuthenticated, isReady, needsProfileCompletion, roleKey, router]);

  const routeAfterAuth = () => {
    const nextUser = getAuthSession()?.user;
    router.push(nextUser?.needsProfileCompletion ? '/onboarding' : nextUser?.roleKey && isAdminRoleKey(nextUser.roleKey) ? '/admin/dashboard' : '/user/dashboard');
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      setError('ইমেইল/মোবাইল এবং পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await login({ identifier: identifier.trim(), password });
      routeAfterAuth();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const initializeGoogle = () => {
    if (!googleClientId || !window.google?.accounts?.id) {
      return;
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: (response) => {
        if (!response.credential) {
          setError('Google লগইন ব্যর্থ হয়েছে।');
          return;
        }

        setLoading(true);
        setError(null);
        loginWithGoogle({ idToken: response.credential })
          .then(routeAfterAuth)
          .catch((err) => setError(getErrorMessage(err)))
          .finally(() => setLoading(false));
      },
    });
    setGoogleReady(true);
  };

  const handleGoogleLogin = () => {
    if (!googleReady || !window.google?.accounts?.id) {
      setError('Google লগইন এখন প্রস্তুত নয়।');
      return;
    }

    window.google.accounts.id.prompt();
  };

  const submitRegister = async () => {
    if (!registerForm.fullName.trim() || !registerForm.mobile.trim() || !registerForm.addressLine.trim()) {
      setRegisterMessage('নাম, মোবাইল ও ঠিকানা দিন।');
      return;
    }
    if (!registerForm.email.trim() && !registerForm.password.trim()) {
      setRegisterMessage('ইমেইল অথবা পাসওয়ার্ড দিন।');
      return;
    }
    if (registerForm.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) {
      setRegisterMessage('সঠিক ইমেইল ঠিকানা দিন।');
      return;
    }
    if (registerForm.password.trim() && registerForm.password.length < 8) {
      setRegisterMessage('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    setRegisterLoading(true);
    setRegisterMessage(null);
    try {
      await register({
        fullName: registerForm.fullName.trim(),
        mobile: registerForm.mobile.trim(),
        email: registerForm.email.trim() || undefined,
        password: registerForm.password || undefined,
        addressLine: registerForm.addressLine.trim(),
      });
      setRegisterOpen(false);
      routeAfterAuth();
    } catch (err) {
      setRegisterMessage(getErrorMessage(err));
    } finally {
      setRegisterLoading(false);
    }
  };

  const openReset = () => {
    setResetIdentifier(identifier);
    setResetOtp('');
    setResetPassword('');
    setResetMessage(null);
    setResetStep('request');
    setResetOpen(true);
  };

  const requestResetOtp = async () => {
    if (!resetIdentifier.trim()) {
      setResetMessage('ইমেইল বা মোবাইল দিন।');
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      await forgotPasswordApi(resetIdentifier.trim());
      setResetStep('verify');
      setResetMessage('OTP ইমেইলে পাঠানো হয়েছে।');
    } catch (err) {
      setResetMessage(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  const submitResetPassword = async () => {
    if (!resetIdentifier.trim() || !resetOtp.trim() || !resetPassword.trim()) {
      setResetMessage('সব তথ্য দিন।');
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      await resetPasswordApi({
        identifier: resetIdentifier.trim(),
        otp: resetOtp.trim(),
        password: resetPassword,
      });
      setPassword(resetPassword);
      setResetOpen(false);
      setError('পাসওয়ার্ড রিসেট হয়েছে। এখন লগইন করুন।');
    } catch (err) {
      setResetMessage(getErrorMessage(err));
    } finally {
      setResetLoading(false);
    }
  };

  if (!isReady || isAuthenticated) {
    return <div className="flex min-h-screen items-center justify-center bg-bg text-sm text-muted">লোড হচ্ছে...</div>;
  }

  return (
    <div className="grid min-h-screen grid-cols-1 bg-bg md:grid-cols-2">
      {googleClientId && <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onLoad={initializeGoogle} />}
      <LoginTopSection loading={loading} />

      <div className="order-1 flex flex-col justify-center gap-6 p-4 md:order-2 md:p-8">
        <LoginMiddleSection
          showPassword={showPassword}
          identifier={identifier}
          password={password}
          loading={loading}
          error={error}
          onIdentifierChange={setIdentifier}
          onPasswordChange={setPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          onSubmit={handleLogin}
          onForgotPassword={openReset}
          onRegister={() => {
            setRegisterMessage(null);
            setRegisterOpen(true);
          }}
          onGoogleLogin={handleGoogleLogin}
          googleEnabled={Boolean(googleClientId)}
        />
        <LoginBottomSection />
      </div>

      <AppModal
        open={resetOpen}
        title={resetStep === 'request' ? 'পাসওয়ার্ড রিসেট' : 'OTP যাচাই'}
        onClose={() => setResetOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)} disabled={resetLoading}>বাতিল</Button>
            {resetStep === 'request' ? (
              <Button onClick={() => void requestResetOtp()} disabled={resetLoading}>{resetLoading ? 'পাঠানো হচ্ছে...' : 'OTP পাঠান'}</Button>
            ) : (
              <Button onClick={() => void submitResetPassword()} disabled={resetLoading}>{resetLoading ? 'রিসেট হচ্ছে...' : 'পাসওয়ার্ড রিসেট'}</Button>
            )}
          </>
        )}
      >
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">ইমেইল বা মোবাইল</span>
            <Input value={resetIdentifier} onChange={(event) => setResetIdentifier(event.target.value)} placeholder="email@example.com অথবা 01XXXXXXXXX" />
          </label>
          {resetStep === 'verify' && (
            <>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-fg-2">OTP</span>
                <Input value={resetOtp} onChange={(event) => setResetOtp(event.target.value)} placeholder="৬ সংখ্যার OTP" />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-fg-2">নতুন পাসওয়ার্ড</span>
                <Input type="password" value={resetPassword} onChange={(event) => setResetPassword(event.target.value)} placeholder="নতুন পাসওয়ার্ড" />
              </label>
            </>
          )}
          {resetMessage && <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg-2">{resetMessage}</p>}
        </div>
      </AppModal>

      <AppModal
        open={registerOpen}
        title="নতুন অ্যাকাউন্ট"
        onClose={() => setRegisterOpen(false)}
        footer={(
          <>
            <Button variant="secondary" onClick={() => setRegisterOpen(false)} disabled={registerLoading}>বাতিল</Button>
            <Button onClick={() => void submitRegister()} disabled={registerLoading}>{registerLoading ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি'}</Button>
          </>
        )}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">পূর্ণ নাম</span>
            <Input value={registerForm.fullName} onChange={(event) => setRegisterForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="আপনার নাম" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">মোবাইল</span>
            <Input value={registerForm.mobile} onChange={(event) => setRegisterForm((current) => ({ ...current, mobile: event.target.value }))} placeholder="01XXXXXXXXX" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">ইমেইল</span>
            <Input type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} placeholder="ঐচ্ছিক" />
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-semibold text-fg-2">পাসওয়ার্ড</span>
            <Input type="password" minLength={8} value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} placeholder="ইমেইল না দিলে প্রয়োজন" />
          </label>
          <label className="block space-y-1 sm:col-span-2">
            <span className="text-xs font-semibold text-fg-2">ঠিকানা</span>
            <Input value={registerForm.addressLine} onChange={(event) => setRegisterForm((current) => ({ ...current, addressLine: event.target.value }))} placeholder="আপনার ঠিকানা" />
          </label>
          <p className="text-xs leading-5 text-muted sm:col-span-2">ইমেইল দিলে পাসওয়ার্ড ফাঁকা রাখা যায়; নিরাপদ অস্থায়ী পাসওয়ার্ড ইমেইলে পাঠানো হবে। ইমেইল না দিলে আপনার নিজের পাসওয়ার্ড দিন।</p>
          {registerMessage && <p className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg-2 sm:col-span-2">{registerMessage}</p>}
        </div>
      </AppModal>
    </div>
  );
}
