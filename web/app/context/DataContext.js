'use client';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

function mapDoctor(row) {
  return {
    id: row.id, name: row.name, specialty: row.specialty,
    hospitalId: row.hospital_id, experience: row.experience,
    fee: row.fee, availableSlots: row.available_slots || [],
  };
}
function toRow(d) {
  return {
    id: d.id, name: d.name, specialty: d.specialty,
    hospital_id: d.hospitalId, experience: d.experience || 0,
    fee: d.fee || 0, available_slots: d.availableSlots || [],
  };
}

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [d, h] = await Promise.all([
      supabase.from('doctors').select('*').order('name'),
      supabase.from('hospitals').select('*').order('name'),
    ]);
    setDoctors((d.data || []).map(mapDoctor));
    setHospitals(h.data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addDoctor = useCallback(async (doctor) => {
    const doc = { ...doctor, id: doctor.id || `d_${Date.now()}` };
    await supabase.from('doctors').insert(toRow(doc));
    setDoctors(p => [...p, doc]);
    return doc;
  }, []);
  const updateDoctor = useCallback(async (doctor) => {
    await supabase.from('doctors').update(toRow(doctor)).eq('id', doctor.id);
    setDoctors(p => p.map(d => d.id === doctor.id ? { ...d, ...doctor } : d));
  }, []);
  const deleteDoctor = useCallback(async (id) => {
    await supabase.from('doctors').delete().eq('id', id);
    setDoctors(p => p.filter(d => d.id !== id));
  }, []);
  const addHospital = useCallback(async (hospital) => {
    const h = { ...hospital, id: hospital.id || `h_${Date.now()}` };
    await supabase.from('hospitals').insert(h);
    setHospitals(p => [...p, h]);
    return h;
  }, []);
  const updateHospital = useCallback(async (hospital) => {
    await supabase.from('hospitals').update(hospital).eq('id', hospital.id);
    setHospitals(p => p.map(h => h.id === hospital.id ? { ...h, ...hospital } : h));
  }, []);
  const deleteHospital = useCallback(async (id) => {
    await supabase.from('hospitals').delete().eq('id', id);
    setHospitals(p => p.filter(h => h.id !== id));
  }, []);
  const resetData = useCallback(async () => { await loadData(); }, [loadData]);

  const value = useMemo(() => ({
    doctors, hospitals, isLoading,
    addDoctor, updateDoctor, deleteDoctor,
    addHospital, updateHospital, deleteHospital,
    resetData, refreshData: loadData,
  }), [doctors, hospitals, isLoading, addDoctor, updateDoctor, deleteDoctor, addHospital, updateHospital, deleteHospital, resetData, loadData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
