'use client';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import SymptomInput from '../../components/SymptomInput';
import SpecialtySuggestionSheet from '../../components/SpecialtySuggestionSheet';
import DoctorCard from '../../components/DoctorCard';
import DoctorDetailSheet from '../../components/DoctorDetailSheet';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { calculateDistance, estimateETA, formatDistance } from '../../lib/distance';
import { SYMPTOM_TO_SPECIALTY, mapSymptomsToSpecialties } from '../../lib/symptoms';
import { supabase } from '../../lib/supabase';

const MapView = dynamic(() => import('../../components/MapView'), { ssr: false });

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { colors } = useTheme();
  const { doctors: DOCTORS, hospitals: HOSPITALS } = useData();
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);

  const {
    flowStage, userLocation, suggestedSpecialties, selectedSpecialty,
    filteredDoctors, selectedDoctor, selectedTimeSlot,
    setUserLocation, setSuggestedSpecialties, selectSpecialty,
    setFilteredDoctors, selectDoctor, selectTimeSlot,
    addAppointment, resetFlow, goBackToDiscovery,
  } = useApp();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
          setUserLocation(loc);
          setMapCenter([loc.latitude, loc.longitude]);
        },
        () => {
          const fallback = { latitude: 33.6938, longitude: 73.0489 };
          setUserLocation(fallback);
          setMapCenter([fallback.latitude, fallback.longitude]);
        }
      );
    }
  }, [setUserLocation]);

  const hospitalMap = useMemo(
    () => Object.fromEntries(HOSPITALS.map((h) => [h.id, h])), [HOSPITALS]
  );

  const enrichedDoctors = useMemo(() => {
    if (!userLocation) return [];
    return filteredDoctors.map((doc) => {
      const hosp = hospitalMap[doc.hospitalId];
      if (!hosp) return null;
      const dist = calculateDistance(userLocation.latitude, userLocation.longitude, hosp.latitude, hosp.longitude);
      return { ...doc, hospital: hosp, distanceKm: dist, distanceFormatted: formatDistance(dist), eta: estimateETA(dist) };
    }).filter(Boolean).sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filteredDoctors, userLocation, hospitalMap]);

  const visibleHospitals = useMemo(() => {
    if (flowStage !== 'discovery' && flowStage !== 'detail') return [];
    const ids = new Set(enrichedDoctors.map((d) => d.hospitalId));
    return HOSPITALS.filter((h) => ids.has(h.id));
  }, [flowStage, enrichedDoctors, HOSPITALS]);

  const handleSymptomSubmit = useCallback((input) => {
    let specs;
    if (input.type === 'text') specs = mapSymptomsToSpecialties(input.value);
    else {
      const all = new Set();
      input.value.forEach((id) => (SYMPTOM_TO_SPECIALTY[id] || ['General Medicine']).forEach((s) => all.add(s)));
      specs = Array.from(all);
    }
    setSuggestedSpecialties(specs);
  }, [setSuggestedSpecialties]);

  const handleSelectSpecialty = useCallback((spec) => {
    selectSpecialty(spec);
    setFilteredDoctors(DOCTORS.filter((d) => d.specialty === spec));
  }, [selectSpecialty, setFilteredDoctors, DOCTORS]);

  const handleSelectDoctor = useCallback((doc) => {
    selectDoctor(doc);
    const hosp = hospitalMap[doc.hospitalId];
    if (hosp) {
      setMapCenter([hosp.latitude, hosp.longitude]);
      setMapZoom(15);
    }
  }, [selectDoctor, hospitalMap]);

  const handleBook = useCallback(async () => {
    if (!selectedDoctor) return;
    const hosp = hospitalMap[selectedDoctor.hospitalId];
    if (!hosp) return;

    const createdAt = new Date().toISOString();
    const safeDate = createdAt.slice(0, 10);

    const appt = {
      id: `appt_${Date.now()}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalAddress: hosp.address,
      date: safeDate,
      timeSlot: 'Any time',
      status: 'Saved',
      createdAt,
    };

    addAppointment(appt);
    const session = await supabase.auth.getSession();
    const userId = session?.data?.session?.user?.id;
    if (userId) {
      await supabase.from('appointments').insert({
        id: appt.id,
        user_id: userId,
        doctor_id: appt.doctorId,
        doctor_name: appt.doctorName,
        specialty: appt.specialty,
        hospital_id: appt.hospitalId,
        hospital_name: appt.hospitalName,
        hospital_address: appt.hospitalAddress,
        date: appt.date,
        time_slot: appt.timeSlot,
        status: appt.status,
      });
    }
    resetFlow();
    router.push('/appointments');
  }, [selectedDoctor, hospitalMap, addAppointment, resetFlow, router]);

  const handleLocateMe = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setUserLocation(loc);
        setMapCenter([loc.latitude, loc.longitude]);
        setMapZoom(14);
      });
    }
  }, [setUserLocation]);

  const handleReset = useCallback(() => {
    resetFlow();
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
      setMapZoom(13);
    }
  }, [resetFlow, userLocation]);

  const selectedDoctorHospital = selectedDoctor ? hospitalMap[selectedDoctor.hospitalId] : null;

  if (authLoading) return null;

  return (
    <div className="h-screen w-screen flex">
      <Navbar />
      <div className="flex-1 lg:ml-20 relative">
        <div className="absolute inset-0">
          <MapView
            center={mapCenter || [33.6938, 73.0489]}
            zoom={mapZoom}
            hospitals={visibleHospitals}
            selectedHospitalId={selectedDoctor?.hospitalId}
            userLocation={userLocation}
            onMarkerClick={(h) => {
              const doc = enrichedDoctors.find((d) => d.hospitalId === h.id);
              if (doc) handleSelectDoctor(doc);
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {flowStage !== 'home' && (
            <motion.button key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={handleReset}
              className="absolute top-4 left-4 lg:left-6 z-20 w-10 h-10 glass rounded-full flex items-center justify-center hover:bg-[var(--primary-light)] transition-colors">
              <X size={20} className="text-[var(--text)]" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute bottom-20 lg:bottom-6 left-3 right-3 lg:left-6 lg:right-auto lg:w-[460px] xl:w-[500px] z-10">
          <AnimatePresence mode="wait">
            {flowStage === 'home' && (
              <SymptomInput key="symptom" onSubmit={handleSymptomSubmit} onLocate={handleLocateMe} />
            )}
            {flowStage === 'specialty' && (
              <SpecialtySuggestionSheet key="specialty" specialties={suggestedSpecialties} onSelect={handleSelectSpecialty} />
            )}
            {flowStage === 'discovery' && (
              <motion.div
                key="discovery"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="glass rounded-3xl p-5 max-h-[60vh] flex flex-col border !border-black"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-[var(--text)]">{selectedSpecialty}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">{enrichedDoctors.length} doctor{enrichedDoctors.length !== 1 ? 's' : ''} nearby</p>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {enrichedDoctors.map((doc) => (
                    <DoctorCard key={doc.id} doctor={doc} hospital={doc.hospital}
                      distance={doc.distanceFormatted} eta={doc.eta}
                      onSelect={handleSelectDoctor} isHighlighted={selectedDoctor?.id === doc.id} />
                  ))}
                </div>
              </motion.div>
            )}
            {flowStage === 'detail' && (
              <DoctorDetailSheet
                key="detail"
                doctor={selectedDoctor}
                hospital={selectedDoctorHospital}
                onBook={handleBook}
                onBack={goBackToDiscovery}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
