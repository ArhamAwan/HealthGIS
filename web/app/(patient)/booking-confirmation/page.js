'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, User, Stethoscope, Building2, Calendar, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BookingConfirmationPage() {
  const router = useRouter();
  const { appointments, resetFlow } = useApp();
  const latest = appointments[0];

  const handleViewAppointments = () => { resetFlow(); router.push('/appointments'); };
  const handleBackHome = () => { resetFlow(); router.push('/home'); };

  if (!latest) return null;

  const details = [
    { icon: <User size={14} />, label: 'Doctor', value: latest.doctorName },
    { icon: <Stethoscope size={14} />, label: 'Specialty', value: latest.specialty },
    { icon: <Building2 size={14} />, label: 'Hospital', value: latest.hospitalName },
    { icon: <Calendar size={14} />, label: 'Date', value: latest.date },
    { icon: <Clock size={14} />, label: 'Time', value: latest.timeSlot },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        className="w-20 h-20 rounded-full bg-[var(--primary)] flex items-center justify-center mb-8">
        <Check size={40} className="text-white" />
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-2xl font-extrabold text-[var(--text)] mb-1">Appointment Booked!</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-sm text-[var(--text-secondary)] mb-8">Your appointment has been confirmed</motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-4 mb-8">
        {details.map((d, i) => (
          <motion.div key={d.label} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.08 }}
            className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] flex items-center justify-center text-[var(--primary)]">{d.icon}</div>
            <div>
              <p className="text-[10px] text-[var(--text-tertiary)]">{d.label}</p>
              <p className="text-sm font-semibold text-[var(--text)]">{d.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="w-full max-w-md space-y-3">
        <button onClick={handleViewAppointments}
          className="w-full h-14 rounded-full bg-[var(--primary)] text-white font-semibold text-lg hover:opacity-90 transition-opacity">
          View Appointments
        </button>
        <button onClick={handleBackHome}
          className="w-full h-14 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--text)] font-semibold text-base hover:bg-[var(--input-bg)] transition-colors">
          Back to Home
        </button>
      </div>
    </div>
  );
}
