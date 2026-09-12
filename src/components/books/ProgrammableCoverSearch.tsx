'use client';

import { useEffect, useId, useRef, useState } from 'react';

interface SearchElementApi {
  render: (config: Record<string, unknown>) => void;
  getElement: (name: string) => { execute: (query: string) => void } | null;
}

type SearchWindow = Window & { google?: { search?: { cse?: { element?: SearchElementApi } } } };

function searchElementApi() {
  return (window as SearchWindow).google?.search?.cse?.element;
}

const searchEngineId = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || '62084212d3d0c43db';
const scriptId = 'intifadah-programmable-search-script';

export function ProgrammableCoverSearch({ query, onSearchStateChange }: { query: string; onSearchStateChange?: (loading: boolean) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementName = `book-cover-search-${useId().replaceAll(':', '')}`;
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let retryTimer: number | undefined;
    const waitForSearchElement = () => {
      if (searchElementApi()) {
        setReady(true);
        return;
      }
      retryTimer = window.setTimeout(waitForSearchElement, 100);
    };
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      retryTimer = window.setTimeout(waitForSearchElement, 0);
      return () => { if (retryTimer) window.clearTimeout(retryTimer); };
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.async = true;
    script.src = `https://cse.google.com/cse.js?cx=${encodeURIComponent(searchEngineId)}`;
    script.addEventListener('load', waitForSearchElement, { once: true });
    document.head.append(script);
    return () => { if (retryTimer) window.clearTimeout(retryTimer); };
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;
    onSearchStateChange?.(true);
    let attempts = 0;
    let timer: number | undefined;
    let cancelled = false;

    const render = () => {
      if (cancelled || !containerRef.current) return;
      const element = searchElementApi();
      if (!element) {
        attempts += 1;
        if (attempts < 20) timer = window.setTimeout(render, 150);
        else {
          setUnavailable(true);
          onSearchStateChange?.(false);
        }
        return;
      }

      containerRef.current.replaceChildren();
      element.render({
        div: containerRef.current,
        tag: 'search',
        gname: elementName,
        attributes: {
          enableImageSearch: true,
          defaultToImageSearch: true,
          imageSearchLayout: 'column',
          safeSearch: 'strict',
          imageSearchResultSetSize: 8,
        },
      });
      window.setTimeout(() => {
        element.getElement(elementName)?.execute(`${query || 'book'} book cover`);
        onSearchStateChange?.(false);
      }, 0);
    };

    render();
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
    };
  }, [elementName, onSearchStateChange, query, ready]);

  return (
    <section className="rounded-lg border border-border bg-surface-2 p-3">
      <p className="text-sm font-semibold text-fg">Google-এ কভার খুঁজুন</p>
      <div className="mt-3 rounded-lg border border-brand/30 bg-brand-light px-3 py-2 text-xs leading-5 text-fg-2">
        <strong>পছন্দের কভারটি খুলে ছবিটি download করুন।</strong><br />
        তারপর পেজে ফিরে <strong>কভার আপলোড করুন</strong> চাপুন এবং ডাউনলোড করা ছবিটি নির্বাচন করুন।
      </div>
      {!ready && <p className="mt-3 text-xs text-muted">কভার সার্চ লোড হচ্ছে...</p>}
      {unavailable && <p className="mt-3 text-xs text-danger">কভার সার্চ এখন লোড করা যায়নি। নিচের Google Images লিংক ব্যবহার করুন।</p>}
      <div ref={containerRef} className="mt-3 min-h-10 overflow-x-auto" />
    </section>
  );
}
