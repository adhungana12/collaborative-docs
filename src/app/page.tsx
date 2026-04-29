'use client';

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';

export type User = { id: string; email: string; name: string };

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth');
      const { user } = await res.json();
      setUser(user ?? null);
    } catch {
      setUser(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => { checkSession(); }, [checkSession]);

  async function login(email: string) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Login failed');
        return;
      }

      setUser(data.user);
      toast.success(`Hey, ${data.user.name.split(' ')[0]}!`);
    } catch {
      toast.error('Something went wrong');
    }
  }

  async function logout() {
    await fetch('/api/auth', { method: 'DELETE' });
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginScreen onLogin={login} />;
  return <Dashboard user={user} onLogout={logout} />;
}
