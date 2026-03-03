'use client';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Plus, Trash2, Building2, X as XIcon } from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminHospitalsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { hospitals, doctors, deleteHospital } = useData();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) router.replace('/admin-login');
  }, [authLoading, isAuthenticated, user, router]);

  const doctorCountMap = useMemo(() => {
    const map = {};
    doctors.forEach(d => { map[d.hospitalId] = (map[d.hospitalId] || 0) + 1; });
    return map;
  }, [doctors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return hospitals;
    const q = search.toLowerCase();
    return hospitals.filter(h => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q));
  }, [hospitals, search]);

  const handleDelete = useCallback((hosp) => {
    const count = doctorCountMap[hosp.id] || 0;
    const msg = count > 0 ? `Remove ${hosp.name}? (${count} doctor(s) linked)` : `Remove ${hosp.name}?`;
    if (confirm(msg)) deleteHospital(hosp.id);
  }, [deleteHospital, doctorCountMap]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="lg:ml-20 px-4 lg:px-8 pt-6 pb-24 lg:pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">Hospitals</h1>
            <p className="text-sm text-[var(--text-secondary)]">{hospitals.length} total</p>
          </div>
          <button onClick={() => router.push('/hospitals/new')}
            className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center hover:opacity-90">
            <Plus size={22} />
          </button>
        </div>

        <div className="flex items-center gap-2 h-12 px-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] mb-4">
          <Search size={18} className="text-[var(--text-tertiary)]" />
          <input placeholder="Search hospitals..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)]" />
          {search && <button onClick={() => setSearch('')}><XIcon size={16} className="text-[var(--text-tertiary)]" /></button>}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Building2 size={48} className="text-[var(--text-tertiary)] mx-auto mb-3" />
              <p className="text-sm text-[var(--text-tertiary)]">{search ? 'No matches found' : 'No hospitals yet'}</p>
            </div>
          ) : filtered.map((hosp, i) => (
            <motion.div key={hosp.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <div onClick={() => router.push(`/hospitals/${hosp.id}`)} role="button" tabIndex={0}
                className="w-full text-left flex items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/30 transition-colors cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center shrink-0">
                  <Building2 size={18} className="text-[var(--primary)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[var(--text)] truncate">{hosp.name}</p>
                  <p className="text-xs text-[var(--text-secondary)] truncate">{hosp.address}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{doctorCountMap[hosp.id] || 0} doctor(s)</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(hosp); }}>
                  <Trash2 size={16} className="text-red-500 hover:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
