import React, { useEffect } from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function TimeSlotChip({ time, isSelected, onPress }) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isSelected) {
      scale.value = withSequence(
        withSpring(1.08, { damping: 8, stiffness: 400 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [isSelected]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={[
        styles.chip,
        { backgroundColor: isSelected ? colors.primary : colors.background, borderColor: isSelected ? colors.primary : colors.border },
        animStyle,
      ]}
      onPress={() => onPress(time)}
      onPressIn={() => { scale.value = withSpring(0.93, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 12, stiffness: 200 }); }}
    >
      <Text style={[FONTS.regular, { fontWeight: isSelected ? '600' : '500', color: isSelected ? '#FFFFFF' : colors.text }]}>
        {time}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.full, borderWidth: 1.5, minWidth: 80, alignItems: 'center' },
});
