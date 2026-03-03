import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeInRight, FadeOutDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const { height: SCREEN_H } = Dimensions.get('window');

export default function DoctorDetailSheet({ doctor, hospital, onBook, onBack }) {
  const { colors, isDark } = useTheme();

  const openDirections = useCallback(() => {
    if (!hospital) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`);
  }, [hospital]);

  if (!doctor || !hospital) return null;

  const blurTint = isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  const glassBg = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)';
  const rowBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  return (
    <Animated.View
      entering={FadeInUp.duration(400)}
      exiting={FadeOutDown.duration(300)}
      style={styles.wrapper}
    >
      <BlurView
        intensity={95}
        tint={blurTint}
        style={[styles.card, { backgroundColor: glassBg, borderColor: glassBorder }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={[styles.heading, { color: colors.text }]} numberOfLines={1}>
              {doctor.name}
            </Text>
            <Text style={[styles.subtitle, { color: colors.primary }]}>
              {doctor.specialty}
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          bounces={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.statsRow}>
            <View style={[styles.stat, { backgroundColor: rowBg }]}>
              <Ionicons name="briefcase" size={16} color={colors.primary} />
              <Text style={[FONTS.caption, { flex: 1, color: colors.textSecondary }]}>Experience</Text>
              <Text style={[FONTS.semibold, { fontSize: 14, color: colors.text }]}>{doctor.experience} yrs</Text>
            </View>
            <View style={[styles.stat, { backgroundColor: rowBg }]}>
              <Ionicons name="cash" size={16} color={colors.primary} />
              <Text style={[FONTS.caption, { flex: 1, color: colors.textSecondary }]}>Fee</Text>
              <Text style={[FONTS.semibold, { fontSize: 14, color: colors.text }]}>Rs. {doctor.fee}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <InfoRow icon="business" text={hospital.name} colors={colors} isDark={isDark} />
            <InfoRow icon="location" text={hospital.address} colors={colors} isDark={isDark} />
            <TouchableOpacity style={styles.directionBtn} onPress={openDirections} activeOpacity={0.7}>
              <Ionicons name="navigate" size={14} color={colors.primary} />
              <Text style={[FONTS.regular, { color: colors.primary, fontWeight: '600', fontSize: 14 }]}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Time-slot selection is temporarily disabled in the simplified booking flow.
              To restore it, re-enable the section below and wire selectedSlot/onSelectSlot props. */}
        </ScrollView>

        <TouchableOpacity
          style={[styles.bookBtn, { backgroundColor: colors.primary }]}
          onPress={onBook}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar" size={18} color="#fff" />
          <Text style={styles.bookText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
}

function InfoRow({ icon, text, colors, isDark }) {
  const rowBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  return (
    <View style={[styles.infoRow, { backgroundColor: rowBg }]}>
      <View style={[styles.infoIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[FONTS.regular, { color: colors.textSecondary, flex: 1 }]} numberOfLines={2}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: 96,
    maxHeight: '70%',
    zIndex: 10,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    maxHeight: SCREEN_H * 0.45,
  },
  scrollContent: {
    paddingBottom: SPACING.lg,
  },
  statsRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  stat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, padding: SPACING.md, borderRadius: RADIUS.md },
  section: { marginBottom: SPACING.lg },
  sectionLast: { marginBottom: SPACING.xs },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  infoIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  directionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: SPACING.xs, paddingLeft: SPACING.xs },
  slotsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  bookBtn: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  bookText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
