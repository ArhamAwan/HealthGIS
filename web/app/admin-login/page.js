'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminLogin, isLoading, isAuthenticated, user, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') router.replace('/doctors');
  }, [isAuthenticated, user, router]);

  useEffect(() => () => clearError(), [clearError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() && password.trim()) adminLogin(email.trim(), password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--bg)]">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-[var(--sand)]/15 flex items-center justify-center mx-auto mb-5">
            <ShieldCheck size={40} className="text-[var(--sand)]" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">Admin Portal</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage doctors, hospitals & settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500">
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}

          <div className="flex items-center gap-3 h-14 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <Mail size={18} className="text-[var(--text-tertiary)] shrink-0" />
            <input type="email" placeholder="Admin email" value={email} onChange={(e) => { setEmail(e.target.value); if (error) clearError(); }}
              className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-tertiary)]" />
          </div>

          <div className="flex items-center gap-3 h-14 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <Lock size={18} className="text-[var(--text-tertiary)] shrink-0" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => { setPassword(e.target.value); if (error) clearError(); }}
              className="flex-1 bg-transparent text-[var(--text)] placeholder:text-[var(--text-tertiary)]" />
          </div>

          <button type="submit" disabled={isLoading || !email.trim() || !password.trim()}
            className="w-full h-14 rounded-full bg-[var(--sand)] text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-35 mt-3">
            {isLoading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sign In as Admin'}
          </button>

          <p className="text-center text-sm text-[var(--text-secondary)] pt-6">
            Patient?{' '}
            <Link href="/login" className="text-[var(--primary)] font-bold hover:underline">Sign in here</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
