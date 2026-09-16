import { cn } from '@/lib/utils/cn';

interface RichTextPreviewProps {
  html?: string | null;
  className?: string;
}

export function RichTextPreview({ html, className }: RichTextPreviewProps) {
  if (!html) return null;

  return (
    <article
      className={cn(
        'break-words text-sm leading-relaxed text-fg-2',
        '[&_p]:my-1.5 [&_h2]:my-2 [&_h2]:text-base [&_h2]:font-bold [&_h3]:my-2 [&_h3]:text-sm [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-brand/30 [&_blockquote]:pl-3',
        '[&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_strong]:font-bold [&_em]:italic [&_u]:underline [&_s]:line-through',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}