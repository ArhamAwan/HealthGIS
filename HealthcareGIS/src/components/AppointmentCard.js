import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, Linking, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate, SlideInDown,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useData } from '../context/DataContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function AppointmentCard({ appointment, enterDelay = 0 }) {
  const { colors } = useTheme();
  const { doctors: DOCTORS, hospitals: HOSPITALS } = useData();
  const [expanded, setExpanded] = useState(false);
  const progress = useSharedValue(0);
  const cardScale = useSharedValue(1);

  const toggle = useCallback(() => {
    const next = !expanded;
    setExpanded(next);
    progress.value = withTiming(next ? 1 : 0, { duration: 300 });
  }, [expanded, progress]);

  const detailStyle = useAnimatedStyle(() => ({
    height: interpolate(progress.value, [0, 1], [0, 180]),
    opacity: progress.value,
  }));
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
  }));
  const cardAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }] }));

  const doctor = DOCTORS.find((d) => d.id === appointment.doctorId);
  const hospital = HOSPITALS.find((h) => h.id === appointment.hospitalId);

  const openDirections = () => {
    if (!hospital) return;
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`);
  };

  return (
    <AnimatedPressable
      entering={SlideInDown.delay(enterDelay).duration(500)}
      style={[{ backgroundColor: colors.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: colors.border }, cardAnimStyle]}
      onPress={toggle}
      onPressIn={() => { cardScale.value = withSpring(0.98, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { cardScale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
    >
      <View style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[FONTS.bold, { fontSize: 16, color: colors.text }]}>{appointment.doctorName}</Text>
          <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: 1 }]}>{appointment.specialty}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <Text style={{ fontSize: 11, color: colors.success, fontWeight: '700' }}>{appointment.status}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={{ gap: SPACING.sm }}>
        <Row icon="business" text={appointment.hospitalName} colors={colors} />
        <Row icon="calendar" text={appointment.date} colors={colors} />
        <Row icon="time" text={appointment.timeSlot} colors={colors} />
      </View>

      <Animated.View style={[{ overflow: 'hidden' }, detailStyle]}>
        <View>
          <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: SPACING.md }]} />
          {doctor && (
            <View style={styles.detailRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="briefcase" size={14} color={colors.primary} />
              </View>
              <Text style={[FONTS.caption, { fontSize: 14, color: colors.textSecondary }]}>Experience</Text>
              <Text style={[FONTS.semibold, { fontSize: 14, color: colors.text, marginLeft: 'auto' }]}>{doctor.experience} years</Text>
            </View>
          )}
          {doctor && (
            <View style={styles.detailRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="cash" size={14} color={colors.primary} />
              </View>
              <Text style={[FONTS.caption, { fontSize: 14, color: colors.textSecondary }]}>Fee</Text>
              <Text style={[FONTS.semibold, { fontSize: 14, color: colors.text, marginLeft: 'auto' }]}>Rs. {doctor.fee}</Text>
            </View>
          )}
          {hospital && (
            <View style={styles.detailRow}>
              <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="location" size={14} color={colors.primary} />
              </View>
              <Text style={[FONTS.caption, { fontSize: 14, flex: 1, color: colors.textSecondary }]}>{hospital.address}</Text>
            </View>
          )}
          {hospital && (
            <TouchableOpacity style={[styles.directionsBtn, { backgroundColor: colors.primary }]} onPress={openDirections} activeOpacity={0.7}>
              <Ionicons name="navigate" size={15} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Get Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <View style={{ alignItems: 'center', marginTop: SPACING.sm }}>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-down" size={16} color={colors.textTertiary} />
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

function Row({ icon, text, colors }) {
  return (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[FONTS.regular, { color: colors.textSecondary, fontSize: 14 }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm + 2, paddingVertical: 4, borderRadius: RADIUS.full, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  divider: { height: 1, marginVertical: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  directionsBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: RADIUS.full, height: 40, marginTop: SPACING.sm },
});
