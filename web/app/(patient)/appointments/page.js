'use client';
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import AppointmentCard from '../../components/AppointmentCard';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

function mapAppointment(row) {
  return {
    id: row.id, doctorId: row.doctor_id, doctorName: row.doctor_name,
    specialty: row.specialty, hospitalId: row.hospital_id,
    hospitalName: row.hospital_name, hospitalAddress: row.hospital_address,
    date: row.date, timeSlot: row.time_slot, status: row.status,
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { appointments, loadAppointments } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  const fetchAppointments = useCallback(async () => {
    const session = await supabase.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    if (!userId) return;
    const { data } = await supabase.from('appointments').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    if (data) loadAppointments(data.map(mapAppointment));
  }, [loadAppointments]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Navbar />
      <div className="lg:ml-20 px-4 lg:px-8 pt-6 pb-24 lg:pb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text)]">My Appointments</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{appointments.length} booking{appointments.length !== 1 ? 's' : ''}</p>
        </motion.div>

        {appointments.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-[var(--card)] flex items-center justify-center mb-4">
              <Calendar size={36} className="text-[var(--text-tertiary)]" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text)] mb-1">No appointments yet</h3>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-xs">
              Describe your symptoms on the Home tab to book your first appointment.
            </p>
          </motion.div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="w-full lg:w-1/2 xl:w-1/3"
              >
                <AppointmentCard appointment={appt} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
