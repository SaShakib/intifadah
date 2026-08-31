'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/base/Button';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let updateTimer: number | undefined;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        void registration.update();
        updateTimer = window.setInterval(() => void registration.update(), 60 * 60 * 1000);
      })
      .catch(() => {
        // silent
      });

    return () => {
      if (updateTimer) {
        window.clearInterval(updateTimer);
      }
    };
  }, []);
}

export function PWAInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|opios|mercury/i.test(navigator.userAgent);
    return ios && safari;
  });
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia('(display-mode: standalone)').matches;
  });
  const [installing, setInstalling] = useState(false);

  useServiceWorker();

  useEffect(() => {
    if (isInstalled) {
      return;
    }

    const handlePrompt = (event: Event) => {
      event.preventDefault();
      deferredPrompt.current = event as BeforeInstallPromptEvent;
      const alreadyShown = sessionStorage.getItem('pwa-banner-shown');
      if (!alreadyShown) {
        setTimeout(() => setShowBanner(true), 3000);
      }
    };

    const handleInstalled = () => {
      setShowBanner(false);
      setIsInstalled(true);
      deferredPrompt.current = null;
    };

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);

    if (isIOS && !sessionStorage.getItem('pwa-banner-shown')) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, [isIOS, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt.current) {
      return;
    }

    setInstalling(true);
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    setInstalling(false);

    if (outcome === 'accepted') {
      setShowBanner(false);
      deferredPrompt.current = null;
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pwa-banner-shown', '1');
  };

  if (isInstalled || !showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:left-1/2 sm:max-w-md sm:-translate-x-1/2">
      <div className="relative rounded-3xl border border-white/15 bg-[#1a0a12] p-5 text-white shadow-2xl">
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs text-white/80 transition hover:bg-white/20"
          aria-label="বন্ধ করুন"
        >
          ✕
        </button>

        <div className="mb-4 flex items-center gap-3">
          <Image
            src="/icons/intifadah.jpeg"
            alt="ইনতিফাদাহ"
            width={96}
            height={96}
            className="h-12 w-12 rounded-xl border border-white/15 object-cover"
            priority
          />
          <div>
            <p className="text-base font-bold">ইনতিফাদাহ</p>
            <p className="text-xs text-white/60">কর্যে হাসানাঃ</p>
          </div>
        </div>

        {isIOS ? (
          <>
            <p className="mb-3 text-sm text-white/80">হোম স্ক্রিনে অ্যাপ যুক্ত করতে ধাপগুলো অনুসরণ করুন:</p>
            <ol className="space-y-2 text-sm text-white/85">
              <li>১. নিচের Share বোতাম চাপুন</li>
              <li>২. Add to Home Screen বেছে নিন</li>
              <li>৩. Add চাপুন</li>
            </ol>
            <Button variant="secondary" fullWidth onClick={handleDismiss} className="mt-4 border-white/20 bg-white/10 text-white hover:bg-white/20">
              বুঝেছি
            </Button>
          </>
        ) : (
          <>
            <p className="mb-3 text-sm text-white/80">ইনতিফাদাহ ইনস্টল করলে দ্রুত লোড, অফলাইন সাপোর্ট এবং নেটিভ অভিজ্ঞতা পাবেন।</p>
            <div className="mb-4 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1">⚡ দ্রুত</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1">📴 অফলাইন</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-2 py-1">🔔 নোটিফিকেশন</span>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInstall} disabled={installing} fullWidth>
                {installing ? 'ইনস্টল হচ্ছে...' : 'ইনস্টল করুন'}
              </Button>
              <Button variant="secondary" onClick={handleDismiss} className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                পরে
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
