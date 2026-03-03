import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';
import { SYMPTOM_CHIPS } from '../constants/symptoms';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Chip({ chip, active, onPress, colors, isDark }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const inactiveBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.04)';
  const inactiveBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <AnimatedPressable
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : inactiveBg,
          borderColor: active ? colors.primary : inactiveBorder,
        },
        animStyle,
      ]}
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
      onPress={onPress}
    >
      <Text style={[styles.chipText, { color: active ? '#fff' : colors.text }]}>{chip.label}</Text>
    </AnimatedPressable>
  );
}

export default function SymptomInput({ onSubmit, onLocate }) {
  const { colors, isDark } = useTheme();
  const [text, setText] = useState('');
  const [selectedChips, setSelectedChips] = useState([]);

  const hasInput = text.trim().length > 0 || selectedChips.length > 0;

  const handleSubmit = useCallback(() => {
    if (text.trim()) {
      onSubmit({ type: 'text', value: text.trim() });
      setText('');
    } else if (selectedChips.length > 0) {
      onSubmit({ type: 'chips', value: selectedChips });
      setSelectedChips([]);
    }
  }, [text, selectedChips, onSubmit]);

  const handleChipPress = useCallback((chipId) => {
    setSelectedChips((prev) =>
      prev.includes(chipId) ? prev.filter((c) => c !== chipId) : [...prev, chipId]
    );
  }, []);

  const blurTint = isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight';
  const glassBg = isDark ? 'rgba(0,0,0,0.65)' : 'rgba(255,255,255,0.6)';
  const glassBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)';

  return (
    <BlurView
      intensity={95}
      tint={blurTint}
      style={[styles.card, { backgroundColor: glassBg, borderColor: glassBorder }]}
    >
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={[styles.heading, { color: colors.text }]}>
            What are you feeling{'\n'}today?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tell us your symptoms for a quick checkup.
          </Text>
        </View>
        <View style={[styles.headerIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="chatbubbles" size={22} color={colors.primary} />
        </View>
      </View>

      <View style={styles.chipsWrap}>
        {SYMPTOM_CHIPS.map((chip) => (
          <Chip
            key={chip.id}
            chip={chip}
            active={selectedChips.includes(chip.id)}
            onPress={() => handleChipPress(chip.id)}
            colors={colors}
            isDark={isDark}
          />
        ))}
      </View>

      <View style={[styles.searchRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={[FONTS.regular, { flex: 1, color: colors.text, fontSize: 15, marginLeft: SPACING.sm }]}
          placeholder="Or describe your symptoms..."
          placeholderTextColor={colors.textTertiary}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
        />
        {text.length > 0 && (
          <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
            <Pressable onPress={handleSubmit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="arrow-forward-circle" size={26} color={colors.primary} />
            </Pressable>
          </Animated.View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity
          style={[styles.locateBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
          onPress={onLocate}
          activeOpacity={0.7}
        >
          <Ionicons name="navigate" size={18} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ctaBtn, { backgroundColor: colors.primary }, !hasInput && { opacity: 0.45 }]}
          onPress={handleSubmit}
          disabled={!hasInput}
          activeOpacity={0.85}
        >
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.ctaText}>Start Health Checkup</Text>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  chip: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    height: 46,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  locateBtn: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: RADIUS.full,
    gap: SPACING.sm,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
