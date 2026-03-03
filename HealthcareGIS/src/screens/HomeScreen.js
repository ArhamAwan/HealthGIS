import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutDown,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Marker, Callout } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';

import Map from '../components/Map';
import SymptomInput from '../components/SymptomInput';
import SpecialtySuggestionSheet from '../components/SpecialtySuggestionSheet';
import DoctorDetailSheet from '../components/DoctorDetailSheet';
import DoctorCard from '../components/DoctorCard';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { getCurrentLocation } from '../utils/location';
import { calculateDistance, estimateETA, formatDistance } from '../utils/distance';
import { saveAppointment } from '../utils/storage';
import {
  SYMPTOM_TO_SPECIALTY,
  mapSymptomsToSpecialties,
} from '../constants/symptoms';
import { SPACING, RADIUS } from '../constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { doctors: DOCTORS, hospitals: HOSPITALS } = useData();
  const mapRef = useRef(null);
  const markerRefs = useRef({});

  const {
    flowStage, userLocation, suggestedSpecialties, selectedSpecialty,
    filteredDoctors, selectedDoctor,
    setUserLocation, setSuggestedSpecialties, selectSpecialty,
    setFilteredDoctors, selectDoctor,
    addAppointment, resetFlow, goBackToDiscovery,
  } = useApp();

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      setUserLocation(loc);
    })();
  }, []);

  const region = useMemo(() => {
    if (!userLocation) return null;
    const delta = 0.08;
    return { latitude: userLocation.latitude - delta * 0.35, longitude: userLocation.longitude, latitudeDelta: delta, longitudeDelta: delta };
  }, [userLocation]);

  const hospitalMap = useMemo(
    () => Object.fromEntries(HOSPITALS.map((h) => [h.id, h])), [HOSPITALS]
  );

  const enrichedDoctors = useMemo(() => {
    if (!userLocation) return [];
    return filteredDoctors
      .map((doc) => {
        const hosp = hospitalMap[doc.hospitalId];
        const dist = calculateDistance(userLocation.latitude, userLocation.longitude, hosp.latitude, hosp.longitude);
        return { ...doc, hospital: hosp, distanceKm: dist, distanceFormatted: formatDistance(dist), eta: estimateETA(dist) };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [filteredDoctors, userLocation, hospitalMap]);

  const visibleHospitals = useMemo(() => {
    if (flowStage !== 'discovery' && flowStage !== 'detail') return [];
    const ids = new Set(enrichedDoctors.map((d) => d.hospitalId));
    return HOSPITALS.filter((h) => ids.has(h.id));
  }, [flowStage, enrichedDoctors]);

  const handleSymptomSubmit = useCallback((input) => {
    let specs;
    if (input.type === 'text') {
      specs = mapSymptomsToSpecialties(input.value);
    } else {
      const allSpecs = new Set();
      input.value.forEach((chipId) => {
        (SYMPTOM_TO_SPECIALTY[chipId] || ['General Medicine']).forEach((s) => allSpecs.add(s));
      });
      specs = Array.from(allSpecs);
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
    if (hosp && mapRef.current) {
      const delta = 0.02;
      mapRef.current.animateToRegion({ latitude: hosp.latitude - delta * 0.6, longitude: hosp.longitude, latitudeDelta: delta, longitudeDelta: delta }, 600);
      setTimeout(() => {
        markerRefs.current[hosp.id]?.showCallout();
      }, 650);
    }
  }, [selectDoctor, hospitalMap]);

  // Simplified booking: confirm once, create a minimal appointment record.
  const handleBook = useCallback(async () => {
    if (!selectedDoctor) return;
    const hosp = hospitalMap[selectedDoctor.hospitalId];
    if (!hosp) return;

    const createdAt = new Date().toISOString();
    const appt = {
      id: `appt_${Date.now()}`,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      specialty: selectedDoctor.specialty,
      hospitalId: hosp.id,
      hospitalName: hosp.name,
      hospitalAddress: hosp.address,
      createdAt,
      status: 'Saved',
    };

    addAppointment(appt);
    try {
      await saveAppointment(appt);
    } catch {
      // persistence failure is non-fatal for simplified flow
    }

    // Keep user on Home; they can view saved items in Appointments tab.
    resetFlow();
  }, [selectedDoctor, hospitalMap, addAppointment, resetFlow]);

  const handleLocateMe = useCallback(async () => {
    const loc = await getCurrentLocation();
    setUserLocation(loc);
    const delta = 0.04;
    if (mapRef.current) mapRef.current.animateToRegion({ latitude: loc.latitude - delta * 0.35, longitude: loc.longitude, latitudeDelta: delta, longitudeDelta: delta }, 500);
  }, [setUserLocation]);

  const handleReset = useCallback(() => {
    resetFlow();
    if (region && mapRef.current) mapRef.current.animateToRegion(region, 500);
  }, [resetFlow, region]);

  const handleBackFromDetail = useCallback(() => {
    goBackToDiscovery();
  }, [goBackToDiscovery]);

  const selectedDoctorHospital = selectedDoctor ? hospitalMap[selectedDoctor.hospitalId] : null;

  const blurTint = isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  const glassBg = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)';

  return (
    <View style={styles.container}>
      <Map ref={mapRef} region={region}>
        {visibleHospitals.map((h) => (
          <Marker
            key={h.id}
            ref={(ref) => { markerRefs.current[h.id] = ref; }}
            coordinate={{ latitude: h.latitude, longitude: h.longitude }}
            title={h.name}
            description={h.address}
            pinColor={selectedDoctor?.hospitalId === h.id ? colors.mapMarkerSelected : colors.mapMarker}
          />
        ))}
      </Map>

      <Animated.View
        entering={FadeIn.duration(300)}
        style={[
          styles.brandPill,
          {
            top: insets.top + SPACING.lg,
            left: SPACING.lg,
            borderColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.06)',
            backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.96)',
          },
        ]}
      >
        <Text style={[styles.brandPillText, { color: colors.primary }]}>Healthcare GIS</Text>
      </Animated.View>

      {flowStage === 'home' && (
        <Animated.View entering={FadeInUp.duration(400)} exiting={FadeOutDown.duration(300)} style={[styles.searchOverlay, { bottom: 96 }]}>
          <SymptomInput onSubmit={handleSymptomSubmit} onLocate={handleLocateMe} />
        </Animated.View>
      )}

      {flowStage !== 'home' && (
        <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)} style={[styles.backButton, { top: insets.top + SPACING.sm }]}>
          <TouchableOpacity onPress={handleReset} activeOpacity={0.8}>
            <BlurView intensity={90} tint={blurTint} style={[styles.backGlass, { backgroundColor: glassBg, borderColor: glassBorder }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </BlurView>
          </TouchableOpacity>
        </Animated.View>
      )}

      {flowStage === 'specialty' && (
        <SpecialtySuggestionSheet specialties={suggestedSpecialties} onSelect={handleSelectSpecialty} />
      )}

      {flowStage === 'discovery' && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          exiting={FadeOutDown.duration(300)}
          style={styles.discoveryWrapper}
        >
          <BlurView
            intensity={95}
            tint={blurTint}
            style={[styles.discoveryCard, { backgroundColor: glassBg, borderColor: glassBorder }]}
          >
            <View style={styles.discoveryHeader}>
              <View style={styles.discoveryHeaderText}>
                <Text style={[styles.discoveryHeading, { color: colors.text }]}>
                  {selectedSpecialty}
                </Text>
                <Text style={[styles.discoverySubtitle, { color: colors.textSecondary }]}>
                  {enrichedDoctors.length} doctor{enrichedDoctors.length !== 1 ? 's' : ''} found nearby
                </Text>
              </View>
              <View style={[styles.discoveryIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="people" size={22} color={colors.primary} />
              </View>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={styles.discoveryScroll}
              contentContainerStyle={styles.discoveryScrollContent}
            >
              {enrichedDoctors.map((item) => (
                <View key={item.id} style={{ marginBottom: SPACING.md }}>
                  <DoctorCard
                    doctor={item}
                    hospital={item.hospital}
                    distance={item.distanceFormatted}
                    eta={item.eta}
                    onSelect={handleSelectDoctor}
                    isHighlighted={selectedDoctor?.id === item.id}
                  />
                </View>
              ))}
            </ScrollView>
          </BlurView>
        </Animated.View>
      )}

      {flowStage === 'detail' && (
        <DoctorDetailSheet
          doctor={selectedDoctor}
          hospital={selectedDoctorHospital}
          onBook={handleBook}
          onBack={handleBackFromDetail}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  brandPill: {
    position: 'absolute',
    zIndex: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  brandPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  searchOverlay: { position: 'absolute', left: SPACING.md, right: SPACING.md, zIndex: 10 },
  backButton: { position: 'absolute', left: SPACING.lg, zIndex: 10 },
  backGlass: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  discoveryWrapper: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: 96,
    maxHeight: '60%',
    zIndex: 10,
  },
  discoveryCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  discoveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  discoveryHeaderText: { flex: 1, marginRight: SPACING.md },
  discoveryHeading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  discoverySubtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  discoveryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryScroll: {
    maxHeight: SCREEN_H * 0.35,
  },
  discoveryScrollContent: {
    paddingBottom: SPACING.sm,
  },
});
