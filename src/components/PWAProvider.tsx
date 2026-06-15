'use client';

import { useEffect, useRef, useState } from 'react';

/* ── Types ─────────────────────────────────────────────────── */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

/* ── Service Worker Registration ────────────────────────────── */
function useServiceWorker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('[PWA] Service worker registered, scope:', reg.scope);

        /* Check for updates every 60 minutes */
        setInterval(() => reg.update(), 60 * 60 * 1000);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              /* A new version is waiting — you could show an "Update available" toast here */
              console.log('[PWA] New version available');
            }
          });
        });
      })
      .catch(err => console.warn('[PWA] Service worker registration failed:', err));
  }, []);
}

/* ── Install Prompt ─────────────────────────────────────────── */
export function PWAInstallPrompt() {
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner]       = useState(false);
  const [isIOS, setIsIOS]                 = useState(false);
  const [isInstalled, setIsInstalled]     = useState(false);
  const [installing, setInstalling]       = useState(false);

  /* Register SW */
  useServiceWorker();

  useEffect(() => {
    /* Already running in standalone (installed) */
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }
    /* iOS Safari detection */
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream;
    const safari = /safari/i.test(navigator.userAgent) && !/crios|fxios|opios|mercury/i.test(navigator.userAgent);
    setIsIOS(ios && safari);

    /* Android / Chrome desktop — capture beforeinstallprompt */
    const handlePrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      /* Show our banner after 4 seconds (don't be too eager) */
      const already = sessionStorage.getItem('pwa-banner-shown');
      if (!already) {
        setTimeout(() => setShowBanner(true), 4000);
      }
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);

    /* Detect successful install */
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setIsInstalled(true);
      deferredPrompt.current = null;
    });

    /* iOS: show instruction banner once per session */
    if (ios && safari && !sessionStorage.getItem('pwa-banner-shown')) {
      setTimeout(() => setShowBanner(true), 4000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt.current) return;
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

  if (isInstalled || !showBanner) return null;

  return (
    <>
      <style>{`
        .pwa-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          padding: 0 16px 16px;
          animation: pwa-slide-up 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        @media (min-width: 480px) {
          .pwa-banner { max-width: 420px; left: 50%; transform: translateX(-50%); right: auto; }
        }
        @keyframes pwa-slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @media (min-width: 480px) {
          @keyframes pwa-slide-up {
            from { transform: translateX(-50%) translateY(100%); opacity: 0; }
            to   { transform: translateX(-50%) translateY(0);    opacity: 1; }
          }
        }
        .pwa-card {
          background: #1a0a12;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px;
          padding: 20px;
          box-shadow: 0 -4px 32px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3);
          color: #fff;
          font-family: 'Noto Sans Bengali', system-ui, sans-serif;
        }
        .pwa-top {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 14px;
        }
        .pwa-app-icon {
          width: 52px; height: 52px;
          background: linear-gradient(145deg, #c01155, #8b0840);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 800;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(192,17,85,0.5);
        }
        .pwa-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 2px; }
        .pwa-subtitle { font-size: 12px; color: rgba(255,255,255,0.55); }
        .pwa-desc {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .pwa-features {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .pwa-feature {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 99px;
          padding: 4px 10px;
          font-size: 11px;
          color: rgba(255,255,255,0.7);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pwa-actions { display: flex; gap: 10px; }
        .pwa-btn-install {
          flex: 1;
          background: oklch(50% 0.26 354);
          color: #fff;
          border: none;
          border-radius: 12px;
          padding: 13px 20px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pwa-btn-install:hover { background: oklch(42% 0.24 354); }
        .pwa-btn-install:disabled { opacity: 0.7; cursor: wait; }
        .pwa-btn-dismiss {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 16px;
          font-size: 13px;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }
        .pwa-btn-dismiss:hover { background: rgba(255,255,255,0.14); }

        /* iOS step indicator */
        .pwa-ios-step {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          line-height: 1.5;
        }
        .pwa-ios-num {
          width: 22px; height: 22px;
          border-radius: 50%;
          background: oklch(50% 0.26 354);
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .pwa-close {
          position: absolute;
          top: 14px; right: 14px;
          background: rgba(255,255,255,0.08);
          border: none;
          border-radius: 50%;
          width: 28px; height: 28px;
          color: rgba(255,255,255,0.5);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-family: inherit;
        }
        .pwa-close:hover { background: rgba(255,255,255,0.15); color: #fff; }
      `}</style>

      <div className="pwa-banner" role="dialog" aria-label="অ্যাপ ইনস্টল করুন">
        <div className="pwa-card" style={{ position: 'relative' }}>
          <button className="pwa-close" onClick={handleDismiss} aria-label="বন্ধ করুন">✕</button>

          <div className="pwa-top">
            <div className="pwa-app-icon">ই</div>
            <div>
              <div className="pwa-title">ইনতিফাদাহ</div>
              <div className="pwa-subtitle">কর্যে হাসানাঃ</div>
            </div>
          </div>

          {isIOS ? (
            /* iOS Safari instructions */
            <>
              <p className="pwa-desc">
                হোম স্ক্রিনে অ্যাপ হিসেবে ইনস্টল করতে নিচের ধাপগুলো অনুসরণ করুন:
              </p>
              <div className="pwa-ios-step">
                <div className="pwa-ios-num">১</div>
                <span>নিচের মেনু বার থেকে <strong style={{ color: '#fff' }}>Share</strong> বোতাম (□↑) চাপুন</span>
              </div>
              <div className="pwa-ios-step">
                <div className="pwa-ios-num">২</div>
                <span>স্ক্রোল করে <strong style={{ color: '#fff' }}>"Add to Home Screen"</strong> বেছে নিন</span>
              </div>
              <div className="pwa-ios-step">
                <div className="pwa-ios-num">৩</div>
                <span>উপরে <strong style={{ color: '#fff' }}>"Add"</strong> বোতাম চাপুন</span>
              </div>
              <div className="pwa-actions" style={{ marginTop: 16 }}>
                <button className="pwa-btn-dismiss" style={{ flex: 1 }} onClick={handleDismiss}>
                  বুঝেছি
                </button>
              </div>
            </>
          ) : (
            /* Android / Chrome desktop */
            <>
              <p className="pwa-desc">
                ইনতিফাদাহ আপনার ডিভাইসে ইনস্টল করুন — ব্রাউজার ছাড়াই সরাসরি খুলবে, অফলাইনেও কাজ করবে।
              </p>
              <div className="pwa-features">
                <span className="pwa-feature">⚡ দ্রুত লোড</span>
                <span className="pwa-feature">📴 অফলাইন সাপোর্ট</span>
                <span className="pwa-feature">🔔 নোটিফিকেশন</span>
                <span className="pwa-feature">📱 নেটিভ অভিজ্ঞতা</span>
              </div>
              <div className="pwa-actions">
                <button
                  className="pwa-btn-install"
                  onClick={handleInstall}
                  disabled={installing}
                >
                  {installing ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: 'spin 0.7s linear infinite' }}>
                        <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
                        <path d="M8 2a6 6 0 016 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      ইনস্টল হচ্ছে...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path d="M9 2v10M5 8l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 14h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      ইনস্টল করুন
                    </>
                  )}
                </button>
                <button className="pwa-btn-dismiss" onClick={handleDismiss}>
                  পরে
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
