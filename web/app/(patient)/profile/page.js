'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Camera, Pencil, Check, X as XIcon, Moon, Bell, MapPin, Trash2, LogOut, Shield, Settings, User } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../lib/supabase';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateProfile, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { loadAppointments } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) setForm({
      phone: user.phone || '', dob: user.dateOfBirth || '', gender: user.gender || '',
      weight: user.weight || '', height: user.height || '', bloodType: user.bloodType || '',
      allergies: user.allergies || '', emergencyName: user.emergencyContact?.name || '',
      emergencyPhone: user.emergencyContact?.phone || '',
    });
  }, [user]);

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: typeof v === 'object' ? v.target.value : v }));

  const handleSave = useCallback(async () => {
    await updateProfile({
      phone: form.phone, dateOfBirth: form.dob, gender: form.gender,
      weight: form.weight, height: form.height, bloodType: form.bloodType,
      allergies: form.allergies, emergencyContact: { name: form.emergencyName, phone: form.emergencyPhone },
    });
    setEditing(false);
  }, [updateProfile, form]);

  const handleCancel = useCallback(() => {
    if (user) setForm({
      phone: user.phone || '', dob: user.dateOfBirth || '', gender: user.gender || '',
      weight: user.weight || '', height: user.height || '', bloodType: user.bloodType || '',
      allergies: user.allergies || '', emergencyName: user.emergencyContact?.name || '',
      emergencyPhone: user.emergencyContact?.phone || '',
    });
    setEditing(false);
  }, [user]);

  const handleClearAppointments = useCallback(async () => {
    if (!confirm('Delete all appointment history?')) return;
    const session = await supabase.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    if (userId) await supabase.from('appointments').delete().eq('user_id', userId);
    loadAppointments([]);
  }, [loadAppointments]);

  const handleLogout = useCallback(async () => {
    if (!confirm('Are you sure you want to sign out?')) return;
    await logout();
    router.replace('/login');
  }, [logout, router]);

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

  if (authLoading || !user) return null;

  const cardCls = 'rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5';

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="lg:ml-24 px-4 lg:px-10 pt-10 pb-24 lg:pb-10 max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[var(--primary-light)] flex items-center justify-center text-3xl font-bold text-[var(--primary)]">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  initials
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center border-2 border-[var(--bg)]">
                <Camera size={14} className="text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--text)]">{user.name}</h1>
              <p className="text-sm text-[var(--text-secondary)]">{user.email}</p>
              <span className="inline-flex mt-2 px-3 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold tracking-wide">
                PATIENT
              </span>
            </div>
          </div>
        </motion.div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)] items-start">
          {/* Patient info card - left column */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base lg:text-lg font-bold text-[var(--text)]">Patient Information</h2>
                <p className="text-xs text-[var(--text-secondary)]">Your health details</p>
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold hover:opacity-80"
                >
                  <Pencil size={12} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="px-3 py-1.5 rounded-full bg-[var(--input-bg)] text-[var(--text-secondary)] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white text-xs font-semibold"
                  >
                    <Check size={12} /> Save
                  </button>
                </div>
              )}
            </div>
            <div className={`${cardCls} space-y-1`}>
              {editing ? (
                <>
                <EditRow label="Phone" value={form.phone} onChange={set('phone')} placeholder="Phone number" />
                <EditRow label="Date of Birth" value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" />
                <div className="py-2">
                  <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">Gender</label>
                  <div className="flex flex-wrap gap-2">{GENDERS.map(g => (
                    <button key={g} type="button" onClick={() => set('gender')(g)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold ${form.gender === g ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)]'}`}>{g}</button>
                  ))}</div>
                </div>
                <EditRow label="Weight (kg)" value={form.weight} onChange={set('weight')} placeholder="e.g. 70" />
                <EditRow label="Height (cm)" value={form.height} onChange={set('height')} placeholder="e.g. 175" />
                <div className="py-2">
                  <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">Blood Type</label>
                  <div className="flex flex-wrap gap-2">{BLOOD_TYPES.map(bt => (
                    <button key={bt} type="button" onClick={() => set('bloodType')(bt)}
                      className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${form.bloodType === bt ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)]'}`}>{bt}</button>
                  ))}</div>
                </div>
                <EditRow label="Allergies" value={form.allergies} onChange={set('allergies')} placeholder="Comma-separated" />
                <EditRow label="Emergency Name" value={form.emergencyName} onChange={set('emergencyName')} placeholder="Contact name" />
                <EditRow label="Emergency Phone" value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="Contact phone" />
              </>
            ) : (
              <>
                <InfoRow label="Phone" value={user.phone || 'Not set'} />
                <InfoRow label="Date of Birth" value={user.dateOfBirth || 'Not set'} />
                <InfoRow label="Gender" value={user.gender || 'Not set'} />
                <InfoRow label="Weight" value={user.weight ? `${user.weight} kg` : 'Not set'} />
                <InfoRow label="Height" value={user.height ? `${user.height} cm` : 'Not set'} />
                <InfoRow label="Blood Type" value={user.bloodType || 'Not set'} />
                <InfoRow label="Allergies" value={user.allergies || 'None'} />
                <InfoRow
                  label="Emergency Contact"
                  value={
                    user.emergencyContact?.name ? `${user.emergencyContact.name} (${user.emergencyContact.phone})` : 'Not set'
                  }
                />
              </>
            )}
            </div>
          </motion.div>

          {/* Right column: settings + account */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SectionTitle icon={<Settings size={14} />} title="App Settings" subtitle="Preferences" />
              <div className={`${cardCls} space-y-0`}>
                <SettingRow icon={<Moon size={14} />} label="Dark Mode">
                  <Toggle checked={isDark} onChange={toggleTheme} />
                </SettingRow>
                <SettingRow icon={<MapPin size={14} />} label="Map Style">
                  <span className="text-xs text-[var(--text-secondary)] font-semibold">{isDark ? 'Dark' : 'Light'}</span>
                </SettingRow>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <SectionTitle icon={<Shield size={14} />} title="Account" subtitle="Manage your account" />
              <div className={`${cardCls} space-y-0`}>
                <button
                  onClick={handleClearAppointments}
                  className="w-full flex items-center gap-3 py-3 text-[var(--error)] hover:opacity-80 text-sm font-semibold"
                >
                  <Trash2 size={16} /> Clear Appointments
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 py-3 text-[var(--error)] hover:opacity-80 text-sm font-semibold"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        <p className="text-center text-xs text-[var(--text-tertiary)] mt-10">HealthGIS v1.0</p>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center">
        <User size={14} className="text-[var(--primary)]" />
      </div>
      <div>
        <p className="text-[10px] text-[var(--text-tertiary)]">{label}</p>
        <p className="text-sm text-[var(--text)] font-medium">{value}</p>
      </div>
    </div>
  );
}

function EditRow({ label, value, onChange, placeholder }) {
  return (
    <div className="py-2">
      <label className="text-[10px] text-[var(--text-tertiary)] block mb-1">{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder}
        className="w-full h-10 px-3 rounded-xl border border-[var(--border)] bg-[var(--input-bg)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)]" />
    </div>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div><h2 className="text-base font-bold text-[var(--text)]">{title}</h2><p className="text-xs text-[var(--text-secondary)]">{subtitle}</p></div>
      <div className="w-9 h-9 rounded-xl bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">{icon}</div>
    </div>
  );
}

function SettingRow({ icon, label, children }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">{icon}</div>
        <span className="text-sm font-medium text-[var(--text)]">{label}</span>
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
