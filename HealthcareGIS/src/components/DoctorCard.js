import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function DoctorCard({ doctor, hospital, distance, eta, onSelect, isHighlighted }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[
        { backgroundColor: colors.card, borderRadius: RADIUS.xl, padding: SPACING.lg, borderWidth: 1, borderColor: colors.border },
        isHighlighted && { borderColor: colors.primary, borderWidth: 1.5 },
        cardStyle,
      ]}
      onPress={() => onSelect(doctor)}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
    >
      <View style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="person" size={22} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={[FONTS.bold, { fontSize: 16, color: colors.text }]} numberOfLines={1}>{doctor.name}</Text>
          <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600', textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: 2 }]}>{doctor.specialty}</Text>
        </View>
      </View>

      <View style={{ gap: SPACING.xs, marginBottom: SPACING.md }}>
        <View style={styles.metaItem}>
          <Ionicons name="business-outline" size={13} color={colors.textTertiary} />
          <Text style={[FONTS.caption, { flex: 1, color: colors.textSecondary }]} numberOfLines={1}>{hospital.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={colors.primary} />
            <Text style={[FONTS.caption, { color: colors.text, fontWeight: '600' }]}>{distance}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={[FONTS.caption, { color: colors.text, fontWeight: '600' }]}>{eta}</Text>
          </View>
          <View style={[styles.feeBadge, { backgroundColor: colors.successLight }]}>
            <Text style={{ fontSize: 12, color: colors.success, fontWeight: '700' }}>Rs. {doctor.fee}</Text>
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <View style={[styles.selectBtn, { backgroundColor: isHighlighted ? colors.primary : colors.primaryLight }]}>
          <Text style={[FONTS.regular, { fontSize: 14, color: isHighlighted ? '#fff' : colors.primary, fontWeight: '600' }]}>Select</Text>
          <Ionicons name="chevron-forward" size={14} color={isHighlighted ? '#fff' : colors.primary} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.md },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  info: { flex: 1 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg, marginTop: 4 },
  feeBadge: { marginLeft: 'auto', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  selectBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: SPACING.lg, paddingVertical: 7, borderRadius: RADIUS.full },
});
