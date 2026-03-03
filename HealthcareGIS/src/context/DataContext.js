import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext(null);

function mapDoctor(row) {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    hospitalId: row.hospital_id,
    experience: row.experience,
    fee: row.fee,
    availableSlots: row.available_slots || [],
  };
}

function toRow(doctor) {
  return {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    hospital_id: doctor.hospitalId,
    experience: doctor.experience || 0,
    fee: doctor.fee || 0,
    available_slots: doctor.availableSlots || [],
  };
}

export function DataProvider({ children }) {
  const [doctors, setDoctors] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [docsRes, hospsRes] = await Promise.all([
      supabase.from('doctors').select('*').order('name'),
      supabase.from('hospitals').select('*').order('name'),
    ]);
    setDoctors((docsRes.data || []).map(mapDoctor));
    setHospitals(hospsRes.data || []);
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const addDoctor = useCallback(async (doctor) => {
    const doc = { ...doctor, id: doctor.id || `d_${Date.now()}` };
    const { error } = await supabase.from('doctors').insert(toRow(doc));
    if (error) { console.error('addDoctor:', error.message); return doc; }
    setDoctors((prev) => [...prev, doc]);
    return doc;
  }, []);

  const updateDoctor = useCallback(async (doctor) => {
    const { error } = await supabase.from('doctors').update(toRow(doctor)).eq('id', doctor.id);
    if (error) { console.error('updateDoctor:', error.message); return; }
    setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? { ...d, ...doctor } : d)));
  }, []);

  const deleteDoctor = useCallback(async (id) => {
    const { error } = await supabase.from('doctors').delete().eq('id', id);
    if (error) { console.error('deleteDoctor:', error.message); return; }
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addHospital = useCallback(async (hospital) => {
    const hosp = { ...hospital, id: hospital.id || `h_${Date.now()}` };
    const { error } = await supabase.from('hospitals').insert(hosp);
    if (error) { console.error('addHospital:', error.message); return hosp; }
    setHospitals((prev) => [...prev, hosp]);
    return hosp;
  }, []);

  const updateHospital = useCallback(async (hospital) => {
    const { error } = await supabase.from('hospitals').update(hospital).eq('id', hospital.id);
    if (error) { console.error('updateHospital:', error.message); return; }
    setHospitals((prev) => prev.map((h) => (h.id === hospital.id ? { ...h, ...hospital } : h)));
  }, []);

  const deleteHospital = useCallback(async (id) => {
    const { error } = await supabase.from('hospitals').delete().eq('id', id);
    if (error) { console.error('deleteHospital:', error.message); return; }
    setHospitals((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const resetData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const value = useMemo(
    () => ({
      doctors, hospitals, isLoading,
      addDoctor, updateDoctor, deleteDoctor,
      addHospital, updateHospital, deleteHospital,
      resetData, refreshData: loadData,
    }),
    [doctors, hospitals, isLoading, addDoctor, updateDoctor, deleteDoctor, addHospital, updateHospital, deleteHospital, resetData, loadData]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
