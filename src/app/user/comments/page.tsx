'use client';

import { useCallback } from 'react';
import { PageStack } from '@/components/custom/PageStack';
import { ApiErrorNotice, ApiLoadingNotice } from '@/components/custom/ApiNotice';
import { CommentsBottomSection, CommentsMiddleSection, CommentsTopSection } from './_sections';
import { COMMENT_THREADS } from './_sections/constants';
import { invalidateApiCache, queryKeys, useApiMutation, useApiQuery } from '@/lib/api';
import { createUserCommentThread, getUserCommentThreads, sendUserCommentMessage, toBanglaDate } from '@/lib/api';

const initialData = {
  threads: [] as typeof COMMENT_THREADS,
};

export default function CommentsPage() {
  const loadThreads = useCallback(async () => {
    const rows = await getUserCommentThreads();

    const threads = rows.map((row) => ({
      id: String(row.id),
      subject: row.subject,
      lastMessage: row.message_count ? `${row.message_count}টি বার্তা` : 'এখনও কোনো বার্তা নেই',
      status: row.status === 2 ? 'answered' as const : 'pending' as const,
      date: toBanglaDate(row.last_message_at ?? row.updated_at),
    }));

    return { threads };
  }, []);

  const { data, loading, error, refetch } = useApiQuery(loadThreads, initialData, [], {
    cacheKey: queryKeys.user.commentsThreads(),
    staleTimeMs: 20_000,
  });

  const sendMessageMutation = useApiMutation(
    async (input: { subject: string; message: string }) => {
      const thread = await createUserCommentThread(input.subject);
      await sendUserCommentMessage(thread.id, input.message);
      return thread;
    },
    {
      cache: {
        optimistic: [
          {
            key: queryKeys.user.commentsThreads(),
            updater: (current, input) => {
              const now = toBanglaDate(new Date().toISOString());
              const optimisticThread = {
                id: `temp-${Date.now()}`,
                subject: input.subject,
                lastMessage: input.message,
                status: 'pending',
                date: now,
              };

              const existing = (current as { threads?: unknown[] } | undefined)?.threads;
              return {
                threads: [optimisticThread, ...(Array.isArray(existing) ? existing : [])],
              };
            },
            staleTimeMs: 20_000,
          },
        ],
      },
      onSuccess: (thread) => {
        invalidateApiCache((key) => key === queryKeys.user.commentsMessages(thread.id));
      },
    },
  );

  const handleSendMessage = useCallback(async (subject: string, message: string) => {
    await sendMessageMutation.mutate({ subject, message });
  }, [sendMessageMutation]);

  if (loading) {
    return <PageStack><ApiLoadingNotice /></PageStack>;
  }

  return (
    <PageStack>
      {error && <ApiErrorNotice message={error} onRetry={() => void refetch()} />}
      {sendMessageMutation.error && <ApiErrorNotice message={sendMessageMutation.error} />}

      <CommentsTopSection threads={data.threads} />
      <CommentsMiddleSection threads={data.threads} />
      <CommentsBottomSection onSendMessage={handleSendMessage} />
    </PageStack>
  );
}
