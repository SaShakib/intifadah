import { Button } from '@/components/base/Button';

export function ApiLoadingNotice({ label = 'ডেটা লোড হচ্ছে...' }: { label?: string }) {
  return <div className="rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted">{label}</div>;
}

export function ApiErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      <p>{message}</p>
      {onRetry && (
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            আবার চেষ্টা করুন
          </Button>
        </div>
      )}
    </div>
  );
}
