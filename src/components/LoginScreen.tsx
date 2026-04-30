'use client';

import { useState, useEffect } from 'react';

type User = { id: string; email: string; name: string };

const COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
];

export default function LoginScreen({ onLogin }: { onLogin: (email: string) => void }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      <div className={`w-full max-w-sm mx-4 transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-600 shadow-lg shadow-accent-200/50 mb-5">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <h1 className="text-[1.65rem] font-semibold text-ink-900 tracking-tight" style={{ fontFamily: '"Newsreader", Georgia, serif' }}>CollabDocs</h1>
          <p className="text-ink-400 text-sm mt-1.5">Pick an account to get started</p>
        </div>
        <div className="space-y-2.5">
          {users.length > 0 && users.map((u, i) => (
            <button key={u.id} onClick={() => onLogin(u.email)} className="w-full flex items-center gap-3.5 px-4 py-3.5 bg-white rounded-xl border border-ink-100 hover:border-accent-200 hover:shadow-md transition-all duration-150 active:scale-[0.98] group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0 ${COLORS[i % COLORS.length]}`}>
                {u.name.split(' ').map((w) => w[0]).join('')}
              </div>
              <div className="text-left min-w-0">
                <div className="text-sm font-medium text-ink-800">{u.name}</div>
                <div className="text-xs text-ink-400">{u.email}</div>
              </div>
              <svg className="ml-auto w-4 h-4 text-ink-300 group-hover:text-accent-500 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
        <p className="text-center text-[11px] text-ink-300 mt-8">Demo accounts — no password needed</p>
      </div>
    </div>
  );
}
