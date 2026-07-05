import { create } from 'zustand';

export interface ApiCacheEntry<T = unknown> {
  data?: T;
  updatedAt?: number;
  staleTimeMs: number;
  inFlight?: Promise<T>;
}

interface ApiCacheState {
  entries: Record<string, ApiCacheEntry>;
  setEntry: (key: string, entry: ApiCacheEntry) => void;
  removeEntry: (key: string) => void;
  clear: () => void;
}

const DEFAULT_STALE_MS = 60_000;

export const useApiCacheStore = create<ApiCacheState>((set) => ({
  entries: {},
  setEntry: (key, entry) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [key]: entry,
      },
    })),
  removeEntry: (key) =>
    set((state) => {
      if (!(key in state.entries)) {
        return state;
      }

      const next = { ...state.entries };
      delete next[key];
      return { entries: next };
    }),
  clear: () => set({ entries: {} }),
}));

function getEntry<T = unknown>(key: string) {
  return useApiCacheStore.getState().entries[key] as ApiCacheEntry<T> | undefined;
}

function setEntry<T = unknown>(key: string, entry: ApiCacheEntry<T>) {
  useApiCacheStore.getState().setEntry(key, entry);
}

function isFresh(entry: ApiCacheEntry | undefined) {
  if (!entry || entry.updatedAt === undefined || entry.data === undefined) {
    return false;
  }

  const staleTimeMs = entry.staleTimeMs ?? DEFAULT_STALE_MS;
  return Date.now() - entry.updatedAt < staleTimeMs;
}

export function getCachedData<T = unknown>(key: string): T | undefined {
  const entry = getEntry<T>(key);
  if (!isFresh(entry)) {
    return undefined;
  }

  return entry?.data;
}

export function setCachedData<T = unknown>(key: string, data: T, staleTimeMs = DEFAULT_STALE_MS) {
  const previous = getEntry<T>(key);
  setEntry(key, {
    ...previous,
    data,
    updatedAt: Date.now(),
    staleTimeMs,
    inFlight: undefined,
  });
}

export function setInFlight<T = unknown>(key: string, inFlight: Promise<T>, staleTimeMs = DEFAULT_STALE_MS) {
  const previous = getEntry<T>(key);
  setEntry(key, {
    ...previous,
    staleTimeMs,
    inFlight,
  });
}

export function getInFlight<T = unknown>(key: string): Promise<T> | undefined {
  const entry = getEntry<T>(key);
  return entry?.inFlight;
}

export function clearInFlight(key: string) {
  const previous = getEntry(key);
  if (!previous) {
    return;
  }

  setEntry(key, {
    ...previous,
    inFlight: undefined,
  });
}

export function invalidateApiCache(matcher: string | string[] | ((key: string) => boolean)) {
  const keys = Object.keys(useApiCacheStore.getState().entries);

  let shouldInvalidate: (key: string) => boolean;

  if (typeof matcher === 'string') {
    shouldInvalidate = (key) => key === matcher;
  } else if (Array.isArray(matcher)) {
    const keySet = new Set(matcher);
    shouldInvalidate = (key) => keySet.has(key);
  } else {
    shouldInvalidate = matcher;
  }

  for (const key of keys) {
    if (shouldInvalidate(key)) {
      useApiCacheStore.getState().removeEntry(key);
    }
  }
}

export function clearApiCache() {
  useApiCacheStore.getState().clear();
}

export function updateCachedData<T = unknown>(
  key: string,
  updater: (current: T | undefined) => T,
  staleTimeMs = DEFAULT_STALE_MS,
) {
  const current = getEntry<T>(key);
  const nextData = updater(current?.data);

  setEntry(key, {
    ...current,
    data: nextData,
    updatedAt: Date.now(),
    staleTimeMs,
  });

  return nextData;
}

export function optimisticUpdateCachedData<T = unknown>(
  key: string,
  updater: (current: T | undefined) => T,
  staleTimeMs = DEFAULT_STALE_MS,
) {
  const snapshot = getEntry<T>(key);

  updateCachedData(key, updater, staleTimeMs);

  return {
    rollback: () => {
      if (snapshot) {
        setEntry(key, snapshot);
      } else {
        useApiCacheStore.getState().removeEntry(key);
      }
    },
  };
}

export async function getOrFetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  staleTimeMs = DEFAULT_STALE_MS,
): Promise<T> {
  const cached = getCachedData<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  const inFlight = getInFlight<T>(key);
  if (inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    const result = await fetcher();
    setCachedData<T>(key, result, staleTimeMs);
    return result;
  })();

  setInFlight<T>(key, promise, staleTimeMs);

  try {
    return await promise;
  } finally {
    clearInFlight(key);
  }
}
