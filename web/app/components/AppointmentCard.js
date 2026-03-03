'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Building2, Calendar, Clock, MapPin, ChevronDown, ExternalLink } from 'lucide-react';

export default function AppointmentCard({ appointment }) {
  const [expanded, setExpanded] = useState(false);
  const a = appointment;

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.hospitalName + ' ' + a.hospitalAddress)}`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
            <User size={18} className="text-[var(--primary)]" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-[var(--text)] truncate">{a.doctorName}</h4>
            <p className="text-xs text-[var(--text-secondary)]">{a.specialty}</p>
          </div>
          <div className="text-right shrink-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === 'Confirmed' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'bg-[var(--input-bg)] text-[var(--text-tertiary)]'}`}>
              {a.status}
            </span>
          </div>
          <ChevronDown size={16} className={`text-[var(--text-tertiary)] transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-2">
              <Row icon={<Building2 size={14} />} text={a.hospitalName} />
              <Row icon={<MapPin size={14} />} text={a.hospitalAddress} />
              <Row icon={<Calendar size={14} />} text={a.date} />
              <Row icon={<Clock size={14} />} text={a.timeSlot} />
              <button onClick={handleDirections}
                className="mt-2 flex items-center gap-2 text-xs font-semibold text-[var(--primary)] hover:underline">
                <ExternalLink size={14} /> Get Directions
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Row({ icon, text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
      <span className="text-[var(--primary)]">{icon}</span>
      {text}
    </div>
  );
}
