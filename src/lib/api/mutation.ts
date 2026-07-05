import { invalidateApiCache, optimisticUpdateCachedData } from './cache-store';

export interface OptimisticUpdateConfig<TInput = unknown> {
  key: string;
  updater: (current: unknown, input: TInput) => unknown;
  staleTimeMs?: number;
}

export interface CacheMutationConfig<TInput = unknown> {
  optimistic?: Array<OptimisticUpdateConfig<TInput>>;
  invalidate?: string[];
}

export async function runCacheMutation<TInput, TOutput>(
  input: TInput,
  mutation: (input: TInput) => Promise<TOutput>,
  config: CacheMutationConfig<TInput> = {},
): Promise<TOutput> {
  const rollbacks = (config.optimistic ?? []).map((item) =>
    optimisticUpdateCachedData(item.key, (current) => item.updater(current, input), item.staleTimeMs),
  );

  try {
    const output = await mutation(input);

    if (config.invalidate?.length) {
      invalidateApiCache(config.invalidate);
    }

    return output;
  } catch (error) {
    for (const rollback of rollbacks.reverse()) {
      rollback.rollback();
    }
    throw error;
  }
}
