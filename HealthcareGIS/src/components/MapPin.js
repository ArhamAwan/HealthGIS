import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MapPin({ size = 40, selected = false, count }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (selected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [selected, pulseAnim]);

  const fill = selected ? COLORS.primary : COLORS.primary;
  const dotFill = '#fff';
  const scale = selected ? 1.2 : 1;

  return (
    <View style={[styles.container, { width: size * scale, height: size * 1.3 * scale }]}>
      <Svg
        width={size * scale}
        height={size * 1.2 * scale}
        viewBox="0 0 24 24"
        fill="none"
      >
        <Path
          d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
          fill={fill}
          stroke={selected ? COLORS.primaryDark : 'rgba(0,0,0,0.15)'}
          strokeWidth={0.8}
        />
        <AnimatedCircle
          cx="12"
          cy="10"
          r="3.5"
          fill={dotFill}
          opacity={pulseAnim}
        />
      </Svg>
      {count > 1 && (
        <View style={[styles.badge, selected && styles.badgeSelected]}>
          <Animated.Text style={styles.badgeText}>{count}</Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeSelected: {
    backgroundColor: '#DC2626',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});
