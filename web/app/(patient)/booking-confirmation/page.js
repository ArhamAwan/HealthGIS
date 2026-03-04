'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useApp } from '../../context/AppContext';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { appointments } = useApp();
  const latest = appointments[0];

  useEffect(() => {
    if (!latest) {
      router.replace('/home');
    }
  }, [latest, router]);

  if (!latest) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="lg:ml-20 px-4 lg:px-8 pt-10 pb-24 lg:pb-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg mb-4">
            <CheckCircle2 size={42} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)] mb-1">
            Appointment confirmed
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            We&apos;ve saved this booking for you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-xl rounded-3xl bg-[var(--card)] border border-[var(--border)] p-5 space-y-3 shadow-sm"
        >
          <DetailRow label="Doctor" value={latest.doctorName} />
          <DetailRow label="Specialty" value={latest.specialty} />
          <DetailRow label="Hospital" value={latest.hospitalName} />
          {latest.hospitalAddress && (
            <DetailRow label="Address" value={latest.hospitalAddress} />
          )}
          {latest.date && <DetailRow label="Date" value={latest.date} />}
          {latest.timeSlot && <DetailRow label="Time" value={latest.timeSlot} />}
        </motion.div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-xl">
          <button
            onClick={() => router.replace('/appointments')}
            className="flex-1 h-11 rounded-full bg-[var(--primary)] text-white text-sm font-semibold shadow-sm hover:opacity-90 transition"
          >
            View appointments
          </button>
          <button
            onClick={() => router.replace('/home')}
            className="flex-1 h-11 rounded-full bg-[var(--card)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] hover:bg-[var(--card)]/90 transition"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
        {label}
      </span>
      <span className="text-sm font-semibold text-[var(--text)]">
        {value}
      </span>
    </div>
  );
}

