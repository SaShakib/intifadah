'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { API_BASE_URL, getAuthSession, getOrFetchCached, getUserNotifications, invalidateApiCache, queryKeys } from '@/lib/api';

export function useNotificationCount(defaultCount = 0) {
  const [count, setCount] = useState(defaultCount);

  useEffect(() => {
    let active = true;

    const load = async (force = false) => {
      try {
        if (force) {
          invalidateApiCache(queryKeys.user.notifications({ unread: true, limit: 50 }));
        }

        const rows = await getOrFetchCached(
          queryKeys.user.notifications({ unread: true, limit: 50 }),
          () => getUserNotifications({ unread: true, limit: 50 }),
          30_000,
        );
        if (active) {
          setCount(rows.length);
        }
      } catch {
        // Keep previous count if the notification endpoint is temporarily unavailable.
      }
    };

    void load();
    const timer = window.setInterval(() => void load(), 45000);
    const session = getAuthSession();
    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

    let pusher: Pusher | null = null;
    if (session?.user?.id && session.tokens.accessToken && pusherKey && pusherCluster) {
      pusher = new Pusher(pusherKey, {
        cluster: pusherCluster,
        channelAuthorization: {
          endpoint: `${API_BASE_URL}/user/pusher/auth`,
          transport: 'ajax',
          headers: {
            authorization: `Bearer ${session.tokens.accessToken}`,
          },
        },
      });

      const channel = pusher.subscribe(`private-user-${session.user.id}`);
      channel.bind('notification:new', () => {
        setCount((current) => current + 1);
        void load(true);
      });
    }

    return () => {
      active = false;
      window.clearInterval(timer);
      pusher?.disconnect();
    };
  }, []);

  return count;
}
