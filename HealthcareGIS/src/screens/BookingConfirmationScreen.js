import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { BounceIn, FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

export default function BookingConfirmationScreen({ navigation }) {
  const { appointments, resetFlow } = useApp();
  const { colors } = useTheme();
  const latest = appointments[0];

  const handleViewAppointments = () => { resetFlow(); navigation.replace('MainTabs', { screen: 'Appointments' }); };
  const handleBackHome = () => { resetFlow(); navigation.replace('MainTabs', { screen: 'Home' }); };

  if (!latest) return null;

  const details = [
    { icon: 'person', label: 'Doctor', value: latest.doctorName },
    { icon: 'medkit', label: 'Specialty', value: latest.specialty },
    { icon: 'business', label: 'Hospital', value: latest.hospitalName },
    { icon: 'calendar', label: 'Date', value: latest.date },
    { icon: 'time', label: 'Time', value: latest.timeSlot },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.center}>
        <Animated.View entering={BounceIn.delay(100)}>
          <View style={[styles.checkCircle, { backgroundColor: colors.success }]}>
            <Ionicons name="checkmark" size={40} color="#fff" />
          </View>
        </Animated.View>
        <Animated.Text entering={FadeInDown.delay(400).duration(400)} style={[FONTS.title, { color: colors.text, marginBottom: 6 }]}>
          Appointment Booked!
        </Animated.Text>
        <Animated.Text entering={FadeInDown.delay(500).duration(400)} style={[FONTS.caption, { color: colors.textSecondary, fontSize: 15 }]}>
          Your appointment has been confirmed
        </Animated.Text>
      </View>

      <Animated.View entering={FadeInUp.delay(550).springify()}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {details.map((d, index) => (
            <Animated.View key={d.label} entering={FadeInRight.delay(600 + index * 80).duration(350)}>
              <View style={styles.row}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name={d.icon} size={14} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[FONTS.caption, { fontSize: 12, color: colors.textTertiary }]}>{d.label}</Text>
                  <Text style={[FONTS.semibold, { fontSize: 15, color: colors.text, marginTop: 1 }]}>{d.value}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      <View style={{ gap: SPACING.md }}>
        <Animated.View entering={FadeInUp.delay(900).duration(400)}>
          <View style={[{ borderRadius: RADIUS.full }]}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleViewAppointments} activeOpacity={0.8}>
              <Text style={[FONTS.semibold, { color: '#fff', fontSize: 17 }]}>View Appointments</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
        <Animated.View entering={FadeInUp.delay(1000).duration(400)}>
          <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleBackHome} activeOpacity={0.7}>
            <Text style={[FONTS.semibold, { fontSize: 16, color: colors.text }]}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: SPACING.xxl, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  checkCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl },
  card: { borderRadius: RADIUS.xl, padding: SPACING.xl, gap: SPACING.md, marginBottom: SPACING.xxl, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryBtn: { borderRadius: RADIUS.full, height: 54, alignItems: 'center', justifyContent: 'center' },
  secondaryBtn: { borderRadius: RADIUS.full, height: 54, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
