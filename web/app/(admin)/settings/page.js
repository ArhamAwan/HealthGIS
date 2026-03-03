'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Building2, Moon, Bell, RefreshCw, LogOut } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { doctors, hospitals, resetData } = useData();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) router.replace('/admin-login');
  }, [authLoading, isAuthenticated, user, router]);

  const handleResetData = useCallback(async () => {
    if (!confirm('Reset all doctors and hospitals to defaults?')) return;
    await resetData();
  }, [resetData]);

  const handleLogout = useCallback(async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    await logout();
    router.replace('/admin-login');
  }, [logout, router]);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="lg:ml-20 px-4 lg:px-8 pt-6 pb-24 lg:pb-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-[var(--sand)]/15 flex items-center justify-center">
            <ShieldCheck size={32} className="text-[var(--sand)]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-[var(--text)]">{user.name || 'Admin'}</h1>
            <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-[var(--sand)] text-white text-[10px] font-bold">ADMIN</span>
          </div>
        </motion.div>

        <Section title="Overview">
          <Card>
            <StatRow icon={<Users size={18} />} label="Total Doctors" value={String(doctors.length)} />
            <hr className="border-[var(--border)]" />
            <StatRow icon={<Building2 size={18} />} label="Total Hospitals" value={String(hospitals.length)} />
          </Card>
        </Section>

        <Section title="App Settings">
          <Card>
            <SettingRow icon={<Moon size={18} />} label="Dark Mode">
              <Toggle checked={isDark} onChange={toggleTheme} />
            </SettingRow>
            <hr className="border-[var(--border)]" />
            <SettingRow icon={<Bell size={18} />} label="Notifications">
              <Toggle checked={notifications} onChange={() => setNotifications(!notifications)} />
            </SettingRow>
          </Card>
        </Section>

        <Section title="Data Management">
          <Card>
            <button onClick={handleResetData}
              className="w-full flex items-center gap-3 py-3 text-[var(--sand)] hover:opacity-80 text-sm font-semibold">
              <RefreshCw size={18} /> Reset Doctors & Hospitals to Defaults
            </button>
          </Card>
        </Section>

        <Section title="Account">
          <Card>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3 text-red-500 hover:opacity-80 text-sm font-semibold">
              <LogOut size={18} /> Sign Out
            </button>
          </Card>
        </Section>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-8">HealthGIS Admin v1.0.0</p>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">{title}</h2>
      {children}
    </motion.div>
  );
}

function Card({ children }) {
  return <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-1 divide-y divide-[var(--border)]">{children}</div>;
}

function StatRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 text-[var(--text)]">
        <span className="text-[var(--primary)]">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-base font-bold text-[var(--primary)]">{value}</span>
    </div>
  );
}

function SettingRow({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3 text-[var(--text)]">
        <span className="text-[var(--primary)]">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}
