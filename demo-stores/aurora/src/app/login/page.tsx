'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';
import { SEEDED_USERS, isDemoMode } from '../../data/users';

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const demoActive = isDemoMode();

  // If already logged in, redirect to account
  if (currentUser) {
    router.push('/account');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Check if user is known
    const success = loginUser(email.trim());
    if (success) {
      router.push('/account');
    } else {
      setError('Invalid email or password. Please use a seeded demo shopper account.');
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    const success = loginUser(demoEmail);
    if (success) {
      router.push('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-fg tracking-tight">
          Shopper Sign In
        </h1>
        <p className="text-xs text-muted">
          Access your simulated order history and saved preferences.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Email Address</label>
            <input
              type="email"
              required
              id="login-email-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asha@demo.dev"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg placeholder:text-muted text-xs focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-fg mb-1">Password</label>
            <input
              type="password"
              required
              id="login-password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg placeholder:text-muted text-xs focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && (
            <p id="login-error-msg" className="text-[11px] text-red-500 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            id="login-submit-btn"
            className="w-full py-3 rounded-xl bg-accent text-bg font-heading font-bold text-xs hover:opacity-90 transition-opacity"
          >
            Sign In to Atelier
          </button>
        </form>

        {/* 1-Click Demo Accounts */}
        {demoActive && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                Demo Mode Quick Login
              </span>
              <span className="text-[10px] text-accent font-semibold">1-Click</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {SEEDED_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  id={`quick-login-${user.id}`}
                  onClick={() => handleQuickDemoLogin(user.email)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-left hover:border-fg/40 transition-colors flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-fg">{user.name}</span>
                    <span className="text-[10px] text-muted">{user.email}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-accent/10 text-accent font-medium">
                    Use Account
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted text-center">
              Password for all demo accounts: <code className="font-mono">Demo@1234</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
