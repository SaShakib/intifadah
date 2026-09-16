'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Bold, Heading2, Italic, Link2, List, ListOrdered, Strikethrough, Type, Underline } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

interface EditorCommand {
  icon: typeof Bold;
  command: string;
  title: string;
  queryCommand: string;
  arg?: string;
}

const COMMANDS: EditorCommand[] = [
  { icon: Bold, command: 'bold', title: 'বোল্ড', queryCommand: 'bold' },
  { icon: Italic, command: 'italic', title: 'ইটালিক', queryCommand: 'italic' },
  { icon: Underline, command: 'underline', title: 'আন্ডারলাইন', queryCommand: 'underline' },
  { icon: Strikethrough, command: 'strikeThrough', title: 'স্ট্রাইক থ্রু', queryCommand: 'strikeThrough' },
  { icon: List, command: 'insertUnorderedList', title: 'তালিকা', queryCommand: 'insertUnorderedList' },
  { icon: ListOrdered, command: 'insertOrderedList', title: 'ক্রমিক তালিকা', queryCommand: 'insertOrderedList' },
  { icon: Heading2, command: 'formatBlock', arg: 'h3', title: 'শিরোনাম', queryCommand: 'h3' },
  { icon: Type, command: 'formatBlock', arg: 'p', title: 'সাধারণ', queryCommand: 'p' },
];

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [activeCommands, setActiveCommands] = useState<Set<string>>(new Set());

  const notify = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    onChange(element.innerHTML);
  }, [onChange]);

  const syncActiveCommands = useCallback(() => {
    const next = new Set<string>();
    for (const item of COMMANDS) {
      try {
        if (item.queryCommand === 'h3' || item.queryCommand === 'p') {
          const block = document.queryCommandValue('formatBlock');
          if (block.toLowerCase() === item.queryCommand) {
            next.add(item.queryCommand);
          }
        } else if (document.queryCommandState(item.queryCommand)) {
          next.add(item.queryCommand);
        }
      } catch {
        // Ignore queryCommandState errors
      }
    }
    setActiveCommands(next);
  }, []);

  useEffect(() => {
    const element = ref.current;
    if (!element || element.innerHTML === value) return;
    element.innerHTML = value || '';
  }, [value]);

  const runCommand = useCallback((command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    syncActiveCommands();
    notify();
  }, [syncActiveCommands, notify]);

  const handleInsertLink = useCallback(() => {
    const url = window.prompt('লিংকের ঠিকানা দিন (https://...)');
    if (url) {
      document.execCommand('createLink', false, url);
      ref.current?.focus();
      notify();
    }
  }, [notify]);

  return (
    <div className={cn('overflow-hidden rounded-lg border border-border', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-surface-2 px-2 py-1.5">
        {COMMANDS.map((item) => {
          const Icon = item.icon;
          const isActive = activeCommands.has(item.queryCommand);
          return (
            <button
              key={item.command + (item.arg ?? '')}
              type="button"
              title={item.title}
              onMouseDown={(event) => {
                event.preventDefault();
                if (item.command === 'formatBlock') {
                  runCommand(item.command, item.arg);
                } else {
                  runCommand(item.command);
                }
              }}
              className={cn(
                'grid h-8 w-8 place-items-center rounded transition',
                isActive ? 'bg-brand/10 text-brand' : 'text-fg-2 hover:bg-surface-2',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
        <button
          type="button"
          title="লিংক যোগ করুন"
          onMouseDown={(event) => {
            event.preventDefault();
            handleInsertLink();
          }}
          className="grid h-8 w-8 place-items-center rounded text-fg-2 transition hover:bg-surface-2"
        >
          <Link2 className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => notify()}
        onKeyUp={syncActiveCommands}
        onMouseUp={syncActiveCommands}
        className={cn(
          'min-h-[7rem] px-3 py-2 text-sm leading-relaxed text-fg outline-none',
          '[&_p]:my-1.5 [&_h3]:my-2 [&_h3]:text-base [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_blockquote]:border-l-2 [&_blockquote]:border-brand/30 [&_blockquote]:pl-3',
          '[&_a]:font-semibold [&_a]:text-brand [&_a]:underline',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted',
        )}
      />
    </div>
  );
}