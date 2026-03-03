import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { FadeInRight, FadeInUp, FadeOutDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPECIALTY_ICON = {
  Neurologist: 'pulse',
  'General Medicine': 'medkit',
  'Internal Medicine': 'fitness',
  Cardiologist: 'heart',
  Dermatologist: 'leaf',
  Orthopedic: 'body',
  Pediatrician: 'happy',
  'ENT Specialist': 'ear',
  Ophthalmologist: 'eye',
  Psychiatrist: 'brain',
};

function SpecialtyRow({ spec, index, onSelect, colors, isDark }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const rowBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';

  return (
    <Animated.View entering={FadeInRight.delay(index * 80).duration(400).springify()}>
      <AnimatedPressable
        style={[styles.row, { backgroundColor: rowBg }, animStyle]}
        onPress={() => onSelect(spec)}
        onPressIn={() => { scale.value = withSpring(0.96, { damping: 15, stiffness: 300 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name={SPECIALTY_ICON[spec] || 'medkit'} size={20} color={colors.primary} />
        </View>
        <Text style={[FONTS.semibold, { flex: 1, color: colors.text }]}>{spec}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function SpecialtySuggestionSheet({ sheetRef, specialties, onSelect }) {
  const { colors, isDark } = useTheme();
  const handleSelect = useCallback((spec) => onSelect(spec), [onSelect]);

  const blurTint = isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  const glassBg = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)';

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
          <View style={styles.headerText}>
            <Text style={[styles.heading, { color: colors.text }]}>
              Recommended Specialties
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Based on your symptoms
            </Text>
          </View>
          <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="medical" size={22} color={colors.primary} />
          </View>
        </View>

        <View style={styles.specList}>
          {specialties.map((spec, index) => (
            <SpecialtyRow key={spec} spec={spec} index={index} onSelect={handleSelect} colors={colors} isDark={isDark} />
          ))}
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: 96,
    zIndex: 10,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    paddingTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  headerText: { flex: 1, marginRight: SPACING.md },
  heading: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specList: {
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
