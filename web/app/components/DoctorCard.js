'use client';
import { motion } from 'framer-motion';
import { User, MapPin, Clock, Banknote } from 'lucide-react';

export default function DoctorCard({ doctor, hospital, distance, eta, onSelect, isHighlighted }) {
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(doctor)}
      className={`w-full text-left p-4 rounded-2xl border transition-all ${
        isHighlighted
          ? 'bg-[var(--primary-light)] border-[var(--primary)]/30'
          : 'bg-[var(--card)]/50 border-[var(--border)] hover:border-[var(--primary)]/30'
      }`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
          <User size={18} className="text-[var(--primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-[var(--text)] truncate">{doctor.name}</h4>
          <p className="text-xs text-[var(--text-secondary)]">{doctor.specialty}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-[var(--text-tertiary)]">
            {hospital && <span className="flex items-center gap-1"><MapPin size={12} />{hospital.name}</span>}
            {distance && <span className="flex items-center gap-1"><MapPin size={12} />{distance}</span>}
            {eta && <span className="flex items-center gap-1"><Clock size={12} />{eta}</span>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <span className="text-sm font-bold text-[var(--primary)]">Rs {doctor.fee}</span>
        </div>
      </div>
    </motion.button>
  );
}
