'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';

const MapView = dynamic(() => import('../../../components/MapView'), { ssr: false });

export default function HospitalFormPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const { hospitals, addHospital, updateHospital } = useData();

  const isNew = params.id === 'new';
  const existing = useMemo(() => hospitals.find(h => h.id === params.id), [hospitals, params.id]);
  const isEdit = !!existing;

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) router.replace('/admin-login');
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (existing) {
      setName(existing.name); setAddress(existing.address);
      setLatitude(String(existing.latitude)); setLongitude(String(existing.longitude));
    }
  }, [existing]);

  const canSave = name.trim() && address.trim() && latitude.trim() && longitude.trim();

  const handleSave = async () => {
    if (!canSave) return;
    const hosp = {
      ...(existing || {}), name: name.trim(), address: address.trim(),
      latitude: parseFloat(latitude), longitude: parseFloat(longitude),
    };
    if (isEdit) await updateHospital(hosp);
    else await addHospital(hosp);
    router.back();
  };

  const mapCenter = latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : [33.6938, 73.0489];

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)] px-4 lg:px-8 py-6">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text)] mb-4">
            <ChevronLeft size={18} /> Back
          </button>
          <h1 className="text-2xl font-extrabold text-[var(--text)] mb-6">{isEdit ? 'Edit Hospital' : 'Add Hospital'}</h1>
        </motion.div>

        <div className="space-y-5">
          <Section title="Details">
            <Input placeholder="Hospital name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} type="number" step="any" />
              <Input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} type="number" step="any" />
            </div>
          </Section>

          <Section title="Pick on Map">
            <p className="text-xs text-[var(--text-secondary)] mb-2">Click the map to set location</p>
            <div className="h-56 rounded-2xl overflow-hidden border border-[var(--border)]">
              <MapView center={mapCenter} zoom={12}
                hospitals={latitude && longitude ? [{ id: 'preview', name, address, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }] : []} />
            </div>
          </Section>

          <button onClick={handleSave} disabled={!canSave}
            className="w-full h-14 rounded-full bg-[var(--primary)] text-white font-semibold text-lg hover:opacity-90 disabled:opacity-35 transition-opacity">
            {isEdit ? 'Save Changes' : 'Add Hospital'}
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
