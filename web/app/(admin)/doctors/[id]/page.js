'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Plus, X as XIcon } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';

const SPECIALTIES = [
  'General Medicine', 'Cardiologist', 'Neurologist', 'Dermatologist',
  'Internal Medicine', 'Orthopedic', 'Pediatrician', 'ENT Specialist',
  'Ophthalmologist', 'Psychiatrist',
];

export default function DoctorFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { doctors, hospitals, addDoctor, updateDoctor } = useData();

  const isNew = params.id === 'new';
  const existing = useMemo(() => doctors.find(d => d.id === params.id), [doctors, params.id]);
  const isEdit = !!existing;

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [experience, setExperience] = useState('');
  const [fee, setFee] = useState('');
  const [slotInput, setSlotInput] = useState('');
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) router.replace('/admin-login');
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (existing) {
      setName(existing.name); setSpecialty(existing.specialty);
      setHospitalId(existing.hospitalId); setExperience(String(existing.experience));
      setFee(String(existing.fee)); setSlots(existing.availableSlots || []);
    }
  }, [existing]);

  const canSave = name.trim() && specialty && hospitalId && fee.trim();

  const handleAddSlot = () => {
    const s = slotInput.trim();
    if (s && !slots.includes(s)) { setSlots(p => [...p, s]); setSlotInput(''); }
  };

  const handleSave = async () => {
    if (!canSave) return;
    const doc = {
      ...(existing || {}), name: name.trim(), specialty, hospitalId,
      experience: parseInt(experience) || 0, fee: parseInt(fee) || 0, availableSlots: slots,
    };
    if (isEdit) await updateDoctor(doc);
    else await addDoctor(doc);
    router.back();
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 lg:px-8 py-6">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] mb-4">
            <ChevronLeft size={18} /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{isEdit ? 'Edit Doctor' : 'Add Doctor'}</h1>
        </motion.div>

        <div className="space-y-5">
          <Section title="Basic Info">
            <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Fee (PKR)" value={fee} onChange={(e) => setFee(e.target.value)} type="number" />
            <Input placeholder="Years of experience" value={experience} onChange={(e) => setExperience(e.target.value)} type="number" />
          </Section>

          <Section title="Specialty">
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button key={s} type="button" onClick={() => setSpecialty(s)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-colors ${specialty === s ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>{s}</button>
              ))}
            </div>
          </Section>

          <Section title="Hospital">
            <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
              {hospitals.map(h => (
                <button key={h.id} type="button" onClick={() => setHospitalId(h.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${hospitalId === h.id ? 'bg-[var(--primary)] text-white border-transparent' : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>{h.name}</button>
              ))}
            </div>
          </Section>

          <Section title="Available Slots">
            <div className="flex gap-2">
              <input placeholder="e.g. 09:00 AM" value={slotInput} onChange={(e) => setSlotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSlot()}
                className="flex-1 h-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)]" />
              <button onClick={handleAddSlot} disabled={!slotInput.trim()}
                className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-35">
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {slots.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-semibold">
                  {s} <button onClick={() => setSlots(p => p.filter(x => x !== s))}><XIcon size={12} /></button>
                </span>
              ))}
            </div>
          </Section>

          <button onClick={handleSave} disabled={!canSave}
            className="w-full h-14 rounded-full bg-[var(--primary)] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-35 transition-opacity">
            {isEdit ? 'Save Changes' : 'Add Doctor'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ ...props }) {
  return <input {...props}
    className="w-full h-13 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)]" />;
}
