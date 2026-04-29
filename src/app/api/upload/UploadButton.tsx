'use client';

import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function UploadButton({ onUploaded }: { onUploaded: (doc: any) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !['txt', 'md', 'docx'].includes(ext)) {
      toast.error('Supported: .txt, .md, .docx');
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);

      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onUploaded(data.document);
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = '';
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept=".txt,.md,.docx" onChange={handle} className="hidden" />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        title="Import .txt, .md, or .docx"
        className="flex items-center justify-center px-3 py-2 border border-ink-200 text-ink-500 text-[13px] rounded-lg hover:bg-ink-50 hover:border-ink-300 active:scale-[0.97] transition-all disabled:opacity-40"
      >
        {busy ? (
          <div className="w-3.5 h-3.5 border-2 border-ink-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        )}
      </button>
    </>
  );
}
