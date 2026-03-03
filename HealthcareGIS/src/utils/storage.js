import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const KEYS = {
  APPOINTMENTS: '@healthcare_gis_appointments',
  SETTINGS: '@healthgis_settings',
};

// ─── Doctors (Supabase) ───

export async function getDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name');
  if (error) { console.error('getDoctors:', error.message); return []; }
  return data.map(mapDoctor);
}

export async function getDoctorById(id) {
  const { data } = await supabase.from('doctors').select('*').eq('id', id).single();
  return data ? mapDoctor(data) : null;
}

export async function saveDoctor(doctor) {
  const row = {
    id: doctor.id,
    name: doctor.name,
    specialty: doctor.specialty,
    hospital_id: doctor.hospitalId,
    experience: doctor.experience || 0,
    fee: doctor.fee || 0,
    available_slots: doctor.availableSlots || [],
  };
  const { error } = await supabase.from('doctors').upsert(row);
  if (error) console.error('saveDoctor:', error.message);
  return doctor;
}

export async function removeDoctor(id) {
  const { error } = await supabase.from('doctors').delete().eq('id', id);
  if (error) console.error('removeDoctor:', error.message);
}

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

// ─── Hospitals (Supabase) ───

export async function getHospitals() {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('name');
  if (error) { console.error('getHospitals:', error.message); return []; }
  return data;
}

export async function getHospitalById(id) {
  const { data } = await supabase.from('hospitals').select('*').eq('id', id).single();
  return data || null;
}

export async function saveHospital(hospital) {
  const { error } = await supabase.from('hospitals').upsert(hospital);
  if (error) console.error('saveHospital:', error.message);
  return hospital;
}

export async function removeHospital(id) {
  const { error } = await supabase.from('hospitals').delete().eq('id', id);
  if (error) console.error('removeHospital:', error.message);
}

export async function resetDoctorsAndHospitals() {
  // No-op for Supabase -- seed data is managed via SQL
}

// ─── Appointments (Supabase) ───

export async function saveAppointment(appointment) {
  const session = await supabase.auth.getSession();
  const userId = session?.data?.session?.user?.id;
  if (!userId) {
    console.error('saveAppointment: no user session');
    return [];
  }
  // Ensure we always send a non-null date to satisfy NOT NULL constraint.
  const safeDate =
    appointment.date ||
    new Date().toISOString().slice(0, 10); // e.g. '2026-03-02'
  const row = {
    id: appointment.id,
    user_id: userId,
    doctor_id: appointment.doctorId,
    doctor_name: appointment.doctorName,
    specialty: appointment.specialty,
    hospital_id: appointment.hospitalId,
    hospital_name: appointment.hospitalName,
    hospital_address: appointment.hospitalAddress || '',
    date: safeDate,
    // time_slot remains required in the DB schema, so we send a
    // friendly fallback when the simplified flow doesn't capture it.
    time_slot: appointment.timeSlot || 'Any time',
    status: appointment.status || 'Confirmed',
  };
  const { error } = await supabase.from('appointments').insert(row);
  if (error) console.error('saveAppointment:', error.message);
  return getAppointments();
}

export async function getAppointments() {
  const session = await supabase.auth.getSession();
  const userId = session?.data?.session?.user?.id;
  if (!userId) return [];
  const { data, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) { console.error('getAppointments:', error.message); return []; }
  return data.map(mapAppointment);
}

export async function clearAppointments() {
  const session = await supabase.auth.getSession();
  const userId = session?.data?.session?.user?.id;
  if (!userId) return;
  const { error } = await supabase.from('appointments').delete().eq('user_id', userId);
  if (error) console.error('clearAppointments:', error.message);
}

function mapAppointment(row) {
  return {
    id: row.id,
    doctorId: row.doctor_id,
    doctorName: row.doctor_name,
    specialty: row.specialty,
    hospitalId: row.hospital_id,
    hospitalName: row.hospital_name,
    hospitalAddress: row.hospital_address,
    date: row.date,
    timeSlot: row.time_slot,
    status: row.status,
  };
}

// ─── Profile (Supabase) ───

export async function getUserProfile() {
  const session = await supabase.auth.getSession();
  const userId = session?.data?.session?.user?.id;
  if (!userId) return null;
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data ? mapProfile(data) : null;
}

export async function saveUserProfile(profile) {
  const session = await supabase.auth.getSession();
  const userId = session?.data?.session?.user?.id;
  if (!userId) return;
  const row = {
    name: profile.name,
    phone: profile.phone || '',
    date_of_birth: profile.dateOfBirth || '',
    gender: profile.gender || '',
    weight: profile.weight || '',
    height: profile.height || '',
    blood_type: profile.bloodType || '',
    allergies: profile.allergies || '',
    emergency_contact_name: profile.emergencyContact?.name || '',
    emergency_contact_phone: profile.emergencyContact?.phone || '',
    avatar_url: profile.profilePhoto || profile.avatar_url || '',
  };
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) console.error('saveUserProfile:', error.message);
}

function mapProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    phone: row.phone,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    weight: row.weight,
    height: row.height,
    bloodType: row.blood_type,
    allergies: row.allergies,
    emergencyContact: {
      name: row.emergency_contact_name,
      phone: row.emergency_contact_phone,
    },
    profilePhoto: row.avatar_url,
  };
}

export async function clearUserProfile() {}

// ─── Settings (local-only) ───

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getSettings() {
  try {
    const json = await AsyncStorage.getItem(KEYS.SETTINGS);
    return json ? JSON.parse(json) : { notifications: true };
  } catch {
    return { notifications: true };
  }
}

// ─── Legacy stubs (no longer needed) ───
export async function seedIfNeeded() {}
export async function hashPassword() { return ''; }
export async function getUsers() { return []; }
export async function getUserByEmail() { return null; }
export async function getUserById() { return null; }
export async function saveUser() {}
export async function saveSession() {}
export async function getSession() { return null; }
export async function clearSession() {}
