'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/api';

type BackgroundNotificationStatus = 'unsupported' | 'unconfigured' | 'default' | 'enabled' | 'blocked' | 'error';

interface PushSubscriptionPayload {
  endpoint: string;
  expirationTime: number | null;
  keys: { auth: string; p256dh: string };
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = window.atob(base64);
  return Uint8Array.from(bytes, (character) => character.charCodeAt(0));
}

function toPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON();
  const auth = json.keys?.auth;
  const p256dh = json.keys?.p256dh;
  if (!subscription.endpoint || !auth || !p256dh) {
    throw new Error('Invalid browser push subscription');
  }

  return {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime,
    keys: { auth, p256dh },
  };
}

function browserSupported() {
  return typeof window !== 'undefined'
    && window.isSecureContext
    && 'serviceWorker' in navigator
    && 'PushManager' in window
    && 'Notification' in window;
}

export function useBackgroundNotifications() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const [status, setStatus] = useState<BackgroundNotificationStatus>(() => {
    if (!browserSupported()) return 'unsupported';
    if (!vapidPublicKey) return 'unconfigured';
    if (Notification.permission === 'denied') return 'blocked';
    return Notification.permission === 'granted' ? 'enabled' : 'default';
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const syncExistingSubscription = useCallback(async () => {
    if (!browserSupported() || !vapidPublicKey || Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await apiRequest('/user/push-subscriptions', {
        method: 'POST',
        body: JSON.stringify(toPayload(subscription)),
      });
    }
  }, [vapidPublicKey]);

  useEffect(() => {
    void syncExistingSubscription().catch(() => {
      // The existing subscription will be retried during the next browser session.
    });
  }, [syncExistingSubscription]);

  const enable = useCallback(async () => {
    if (!browserSupported()) {
      setStatus('unsupported');
      return;
    }
    if (!vapidPublicKey) {
      setStatus('unconfigured');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'blocked' : 'default');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      await apiRequest('/user/push-subscriptions', {
        method: 'POST',
        body: JSON.stringify(toPayload(subscription)),
      });
      setStatus('enabled');
    } catch {
      setStatus('error');
      setError('ব্যাকগ্রাউন্ড বিজ্ঞপ্তি চালু করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }, [vapidPublicKey]);

  const disable = useCallback(async () => {
    if (!browserSupported()) return;

    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await apiRequest('/user/push-subscriptions', {
          method: 'DELETE',
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setStatus(Notification.permission === 'denied' ? 'blocked' : 'default');
    } catch {
      setError('ব্যাকগ্রাউন্ড বিজ্ঞপ্তি বন্ধ করা যায়নি।');
    } finally {
      setBusy(false);
    }
  }, []);

  return { status, busy, error, enable, disable };
}
