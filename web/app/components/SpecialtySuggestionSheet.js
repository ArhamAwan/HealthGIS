'use client';
import { motion } from 'framer-motion';
import { Activity, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SpecialtySuggestionSheet({ specialties, onSelect }) {
  const { colors } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass rounded-3xl p-5 w-full border !border-black"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">Recommended Specialties</h3>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Based on your symptoms</p>
        </div>
        <div className="w-11 h-11 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
          <Activity size={22} className="text-[var(--primary)]" />
        </div>
      </div>

      <div className="space-y-2">
        {specialties.map((spec, i) => (
          <motion.button key={spec} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => onSelect(spec)}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--card)]/50 border border-[var(--border)] hover:bg-[var(--primary-light)] hover:border-[var(--primary)]/30 transition-all group">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-light)] flex items-center justify-center">
                <Activity size={16} className="text-[var(--primary)]" />
              </div>
              <span className="text-sm font-semibold text-[var(--text)]">{spec}</span>
            </div>
            <ChevronRight size={18} className="text-[var(--text-tertiary)] group-hover:text-[var(--primary)] transition-colors" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
