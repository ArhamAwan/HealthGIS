'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Briefcase, Banknote, Building2, MapPin } from 'lucide-react';

export default function DoctorDetailSheet({ doctor, hospital, onBook, onBack }) {
  if (!doctor) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass rounded-3xl p-5 w-full flex flex-col max-h-[70vh] border !border-black"
    >
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] flex items-center justify-center hover:bg-[var(--primary-light)] transition-colors">
          <ArrowLeft size={18} className="text-[var(--text)]" />
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-extrabold text-[var(--text)] truncate">{doctor.name}</h3>
          <p className="text-sm text-[var(--text-secondary)]">{doctor.specialty}</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
          <User size={22} className="text-[var(--primary)]" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <StatCard icon={<Briefcase size={16} />} label="Experience" value={`${doctor.experience} yrs`} />
          <StatCard icon={<Banknote size={16} />} label="Fee" value={`Rs ${doctor.fee}`} />
        </div>

        {hospital && (
          <div className="p-3 rounded-2xl bg-[var(--card)]/50 border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-1">
              <Building2 size={14} className="text-[var(--primary)]" />
              <span className="text-sm font-semibold text-[var(--text)]">{hospital.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-[var(--text-tertiary)]" />
              <span className="text-xs text-[var(--text-secondary)]">{hospital.address}</span>
            </div>
          </div>
        )}

        {/* Slot selection is disabled in the simplified booking flow.
            To restore it, re-enable the section below and pass selectedSlot/onSelectSlot props. */}
      </div>

      <button
        onClick={onBook}
        className="w-full h-12 mt-4 rounded-2xl bg-[var(--primary)] text-white font-semibold flex items-center justify-center transition-opacity hover:opacity-90"
      >
        Confirm Appointment
      </button>
    </motion.div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-3 rounded-xl bg-[var(--card)]/50 border border-[var(--border)] text-center">
      <div className="flex items-center justify-center text-[var(--primary)] mb-1">{icon}</div>
      <div className="text-sm font-bold text-[var(--text)]">{value}</div>
      <div className="text-[10px] text-[var(--text-tertiary)]">{label}</div>
    </div>
  );
}
