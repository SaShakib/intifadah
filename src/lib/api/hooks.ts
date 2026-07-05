'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from './error';
import { useApiCacheStore, getCachedData, getOrFetchCached, invalidateApiCache } from './cache-store';
import { runCacheMutation, type CacheMutationConfig } from './mutation';

export interface ApiQueryState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface ApiQueryOptions {
  cacheKey?: string;
  staleTimeMs?: number;
  enabled?: boolean;
}

export function useApiQuery<T>(
  queryFn: () => Promise<T>,
  initialData: T,
  deps: React.DependencyList = [],
  options: ApiQueryOptions = {},
): ApiQueryState<T> {
  const { cacheKey, staleTimeMs = 60_000, enabled = true } = options;

  const [localData, setLocalData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(() => {
    if (!enabled) {
      return false;
    }

    if (cacheKey) {
      const cached = getCachedData<T>(cacheKey);
      return cached === undefined;
    }

    return true;
  });
  const [error, setError] = useState<string | null>(null);

  const cachedData = useApiCacheStore(
    useCallback(
      (state) => (cacheKey ? (state.entries[cacheKey]?.data as T | undefined) : undefined),
      [cacheKey],
    ),
  );

  const run = useCallback(async (force = false) => {
    if (!enabled) {
      return;
    }

    if (force && cacheKey) {
      invalidateApiCache(cacheKey);
    }

    setLoading(true);
    setError(null);

    try {
      const result = cacheKey
        ? await getOrFetchCached<T>(cacheKey, queryFn, staleTimeMs)
        : await queryFn();

      setLocalData(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [enabled, cacheKey, queryFn, staleTimeMs]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, ...deps]);

  const data = cacheKey ? (cachedData ?? localData) : localData;

  return useMemo(
    () => ({
      data,
      loading,
      error,
      refetch: () => run(true),
    }),
    [data, loading, error, run],
  );
}

interface ApiMutationOptions<TInput, TOutput> {
  cache?: CacheMutationConfig<TInput>;
  onSuccess?: (result: TOutput, input: TInput) => void | Promise<void>;
  onError?: (error: unknown, input: TInput) => void | Promise<void>;
}

export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>,
  options: ApiMutationOptions<TInput, TOutput> = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (input: TInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = options.cache
        ? await runCacheMutation(input, mutationFn, options.cache)
        : await mutationFn(input);

      await options.onSuccess?.(result, input);
      return result;
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      await options.onError?.(err, input);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error,
    clearError: () => setError(null),
  };
}
