'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
  const { signup, isLoading, isAuthenticated, error, clearError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', dob: '',
    gender: '', weight: '', height: '', bloodType: '',
    allergies: '', emergencyName: '', emergencyPhone: '',
  });

  useEffect(() => { if (isAuthenticated) router.replace('/home'); }, [isAuthenticated, router]);
  useEffect(() => () => clearError(), [clearError]);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: typeof e === 'string' ? e : e.target.value }));
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setLocalError('Name is required'); return; }
    if (!EMAIL_RE.test(form.email.trim())) { setLocalError('Enter a valid email'); return; }
    if (form.password.length < 6) { setLocalError('Password must be at least 6 characters'); return; }
    signup({
      name: form.name.trim(), email: form.email.trim(), password: form.password,
      phone: form.phone.trim(), dateOfBirth: form.dob.trim(), gender: form.gender,
      weight: form.weight.trim(), height: form.height.trim(), bloodType: form.bloodType,
      allergies: form.allergies.trim(),
      emergencyContact: { name: form.emergencyName.trim(), phone: form.emergencyPhone.trim() },
    });
  };

  const displayError = error || localError;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 py-8">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/login" className="inline-flex items-center gap-1 text-[var(--text-secondary)] hover:text-[var(--text)] mb-6 text-sm">
            <ChevronLeft size={18} /> Back to Login
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text)]">Create Account</h1>
          <p className="text-[var(--text-secondary)] mt-1 mb-8">Fill in your details to get started</p>
        </motion.div>

        {displayError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-500 mb-4">
            <AlertCircle size={16} /> {displayError}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Account">
            <Input placeholder="Full name" value={form.name} onChange={set('name')} />
            <Input type="email" placeholder="Email address" value={form.email} onChange={set('email')} />
            <Input type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={set('password')} />
            <Input placeholder="Phone number" value={form.phone} onChange={set('phone')} />
          </Section>

          <Section title="Personal">
            <Input placeholder="Date of birth (DD/MM/YYYY)" value={form.dob} onChange={set('dob')} />
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Gender</label>
            <div className="flex flex-wrap gap-2">
              {GENDERS.map((g) => (
                <button key={g} type="button" onClick={() => set('gender')(g)}
                  className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${form.gender === g ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>
                  {g}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Weight (kg)" value={form.weight} onChange={set('weight')} />
              <Input placeholder="Height (cm)" value={form.height} onChange={set('height')} />
            </div>
          </Section>

          <Section title="Medical">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Blood Type</label>
            <div className="flex flex-wrap gap-2">
              {BLOOD_TYPES.map((bt) => (
                <button key={bt} type="button" onClick={() => set('bloodType')(bt)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors ${form.bloodType === bt ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>
                  {bt}
                </button>
              ))}
            </div>
            <Input placeholder="Allergies (comma-separated)" value={form.allergies} onChange={set('allergies')} />
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Emergency Contact</label>
            <Input placeholder="Contact name" value={form.emergencyName} onChange={set('emergencyName')} />
            <Input placeholder="Contact phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
          </Section>

          <button type="submit" disabled={isLoading || !form.name.trim() || !form.email.trim() || !form.password.trim()}
            className="w-full h-14 rounded-full bg-[var(--primary)] text-white font-semibold text-lg transition-opacity hover:opacity-90 disabled:opacity-35">
            {isLoading ? <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)]">{title}</h2>
      {children}
    </div>
  );
}

function Input({ type = 'text', ...props }) {
  return (
    <input type={type} {...props}
      className="w-full h-13 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--text)] placeholder:text-[var(--text-tertiary)] text-sm" />
  );
}
