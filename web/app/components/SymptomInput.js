'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, Sparkles, LocateFixed } from 'lucide-react';
import { SYMPTOM_CHIPS } from '../lib/symptoms';
import { useTheme } from '../context/ThemeContext';

export default function SymptomInput({ onSubmit, onLocate }) {
  const { colors } = useTheme();
  const [text, setText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);

  const handleChipPress = (chipId) => {
    setSelectedChips(prev =>
      prev.includes(chipId) ? prev.filter(c => c !== chipId) : [...prev, chipId]
    );
  };

  const handleSubmit = () => {
    if (selectedChips.length > 0) {
      onSubmit({ type: 'chips', value: selectedChips });
    } else if (text.trim()) {
      onSubmit({ type: 'text', value: text.trim() });
    }
  };

  const hasInput = selectedChips.length > 0 || text.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="glass rounded-3xl p-5 lg:p-6 xl:p-7 w-full border !border-black"
    >
      <div className="flex items-center gap-2 mb-3 lg:mb-4">
        <MessageCircle size={22} className="text-[var(--primary)]" />
        <div>
          <h3 className="text-sm lg:text-base xl:text-lg font-bold text-[var(--text)]">
            What&apos;s bothering you?
          </h3>
          <p className="text-xs lg:text-sm text-[var(--text-secondary)]">
            Select symptoms or describe them
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 lg:gap-2.5 mb-3 lg:mb-4">
        {SYMPTOM_CHIPS.map((chip) => (
          <button
            key={chip.id}
            onClick={() => handleChipPress(chip.id)}
            className={`px-3 lg:px-4 py-1.5 lg:py-2 rounded-full text-xs lg:text-sm font-semibold transition-all ${
              selectedChips.includes(chip.id)
                ? 'bg-[var(--primary)] text-white'
                : 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--primary)]'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 h-10 lg:h-11 xl:h-12 px-3 lg:px-4 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] mb-4 lg:mb-5">
        <Search size={18} className="text-[var(--text-tertiary)]" />
        <input
          type="text"
          placeholder="Or describe your symptoms..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && hasInput && handleSubmit()}
          className="flex-1 bg-transparent text-sm lg:text-base text-[var(--text)] placeholder:text-[var(--text-tertiary)]"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!hasInput}
          className="flex-1 h-12 lg:h-[52px] rounded-2xl bg-[var(--primary)] text-white text-sm lg:text-base font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-35"
        >
          <Sparkles size={20} />
          Start Health Checkup
        </button>
        {onLocate && (
          <button
            onClick={onLocate}
            className="w-12 h-12 lg:w-[52px] lg:h-[52px] rounded-2xl bg-[var(--card)] border border-[var(--border)] flex items-center justify-center hover:bg-[var(--primary-light)] transition-colors"
          >
            <LocateFixed size={20} className="text-[var(--primary)]" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
