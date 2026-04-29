'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

type Share = { user: { id: string; name: string; email: string }; permission: string };

export default function ShareDialog({ docId, docTitle, shares, onClose }: {
  docId: string; docTitle: string; shares: Share[]; onClose: () => void;
}) {
  const [email, setEmail] = useState('');
  const [perm, setPerm] = useState<'view' | 'edit'>('view');
  const [busy, setBusy] = useState(false);
  const [list, setList] = useState<Share[]>(shares);

  async function handleShare(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setBusy(true);
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, email: email.trim(), permission: perm }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // update local list — replace if already there, otherwise append
      setList((prev) => [
        ...prev.filter((s) => s.user.email !== email.trim()),
        { user: data.share.user, permission: data.share.permission },
      ]);
      setEmail('');
      toast.success(`Shared with ${data.share.user.name}`);
    } catch (err: any) {
      toast.error(err.message || 'Could not share');
    } finally {
      setBusy(false);
    }
  }

  async function revoke(userId: string) {
    try {
      await fetch('/api/share', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: docId, userId }),
      });
      setList((prev) => prev.filter((s) => s.user.id !== userId));
      toast.success('Access removed');
    } catch {
      toast.error('Failed to remove access');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* header */}
        <div className="px-6 pt-5 pb-4 border-b border-ink-50">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-800">Share</h2>
            <button onClick={onClose} className="p-1 text-ink-300 hover:text-ink-600 transition-colors rounded-lg hover:bg-ink-50">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-xs text-ink-400 mt-0.5 truncate">{docTitle}</p>
        </div>

        {/* invite form */}
        <div className="px-6 py-4">
          <form onSubmit={handleShare} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 px-3 py-2 text-sm border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400 placeholder:text-ink-300"
              required
            />
            <select
              value={perm}
              onChange={(e) => setPerm(e.target.value as 'view' | 'edit')}
              className="px-2 py-2 text-sm border border-ink-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-accent-200 text-ink-600"
            >
              <option value="view">View</option>
              <option value="edit">Edit</option>
            </select>
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="px-4 py-2 bg-accent-600 text-white text-sm font-medium rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-40"
            >
              {busy ? '...' : 'Invite'}
            </button>
          </form>
          <p className="text-[11px] text-ink-300 mt-2">
            Try alice@ajaia.com, bob@ajaia.com, or carol@ajaia.com
          </p>
        </div>

        {/* current shares */}
        {list.length > 0 && (
          <div className="px-6 pb-5">
            <div className="text-[11px] font-medium text-ink-400 mb-2.5 uppercase tracking-wide">People with access</div>
            <div className="space-y-1.5">
              {list.map((s) => (
                <div key={s.user.id} className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-ink-50/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-500 flex items-center justify-center text-[11px] font-semibold shrink-0">
                    {s.user.name.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-ink-700 truncate">{s.user.name}</div>
                    <div className="text-[11px] text-ink-300 truncate">{s.user.email}</div>
                  </div>
                  <span className="text-[11px] text-ink-400 bg-ink-50 px-2 py-0.5 rounded-full">
                    {s.permission === 'edit' ? 'Can edit' : 'Can view'}
                  </span>
                  <button onClick={() => revoke(s.user.id)} className="text-ink-300 hover:text-red-400 transition-colors p-1" title="Remove">
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
