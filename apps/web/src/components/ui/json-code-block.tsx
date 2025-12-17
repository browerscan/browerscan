'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';

interface JsonCodeBlockProps {
  data: unknown;
  title?: string;
  maxHeight?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  showLineNumbers?: boolean;
  className?: string;
}

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChevronIcon({ className, expanded }: { className?: string; expanded: boolean }) {
  return (
    <svg
      className={cn(className, 'transition-transform', expanded && 'rotate-90')}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

// Escape HTML entities to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function syntaxHighlight(json: string): string {
  // First escape HTML entities in the entire JSON string
  const escaped = escapeHtml(json);

  return escaped.replace(
    /(&quot;(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\&])*&quot;(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'text-amber-400'; // number
      if (/^&quot;/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-sky-400'; // key
          match = match.slice(0, -1) + '<span class="text-zinc-500">:</span>';
        } else {
          cls = 'text-emerald-400'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-violet-400'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-rose-400'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export function JsonCodeBlock({
  data,
  title,
  maxHeight = '400px',
  collapsible = true,
  defaultCollapsed = false,
  showLineNumbers = true,
  className,
}: JsonCodeBlockProps) {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [copied, setCopied] = useState(false);

  const jsonString = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const highlightedJson = useMemo(() => syntaxHighlight(jsonString), [jsonString]);
  const lines = useMemo(() => jsonString.split('\n'), [jsonString]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      toast('JSON copied to clipboard');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('Failed to copy', 'error');
    }
  }, [jsonString, toast]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.toLowerCase().replace(/\s+/g, '-') || 'report'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('JSON file downloaded');
  }, [jsonString, title, toast]);

  return (
    <div className={cn('rounded-lg border border-zinc-800 bg-zinc-950', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <div className="flex items-center gap-2">
          {collapsible && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex items-center gap-1.5 text-zinc-400 transition-colors hover:text-zinc-200"
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              <ChevronIcon className="h-4 w-4" expanded={!isCollapsed} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            {title && (
              <span className="text-xs font-medium text-zinc-400">{title}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-[10px] text-zinc-600">{lines.length} lines</span>
          <button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors',
              copied
                ? 'text-emerald-400'
                : 'text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
            )}
            aria-label="Copy JSON"
          >
            {copied ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <CopyIcon className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
            aria-label="Download JSON"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
            Download
          </button>
        </div>
      </div>

      {/* Code Content */}
      {!isCollapsed && (
        <div
          className="overflow-auto p-4"
          style={{ maxHeight }}
        >
          <div className="flex font-mono text-xs leading-relaxed">
            {showLineNumbers && (
              <div className="mr-4 select-none border-r border-zinc-800 pr-4 text-right text-zinc-600">
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            <pre className="flex-1 overflow-x-auto">
              <code dangerouslySetInnerHTML={{ __html: highlightedJson }} />
            </pre>
          </div>
        </div>
      )}

      {/* Collapsed Preview */}
      {isCollapsed && (
        <div className="px-4 py-3">
          <p className="truncate font-mono text-xs text-zinc-600">
            {jsonString.slice(0, 100)}...
          </p>
        </div>
      )}
    </div>
  );
}
