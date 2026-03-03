import React, { useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { getAppointments } from '../utils/storage';
import AppointmentCard from '../components/AppointmentCard';
import { SPACING, FONTS } from '../constants/theme';

export default function AppointmentsScreen() {
  const { appointments, loadAppointments } = useApp();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchAppointments = useCallback(async () => {
    const saved = await getAppointments();
    loadAppointments(saved);
  }, [loadAppointments]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAppointments();
    setRefreshing(false);
  }, [fetchAppointments]);

  const renderItem = useCallback(
    ({ item, index }) => <AppointmentCard appointment={item} enterDelay={index * 100} />,
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.duration(300)}>
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: insets.top + SPACING.md },
          ]}
        >
          <Text style={[FONTS.title, { fontSize: 22, color: colors.text }]}>My Appointments</Text>
          <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 2 }]}>
            {appointments.length} booking{appointments.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animated.View>

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[styles.list, appointments.length === 0 && styles.emptyContainer]}
        ItemSeparatorComponent={() => <View style={{ height: SPACING.md }} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn.delay(300).duration(500)} style={styles.emptyWrap}>
            <View style={[styles.emptyCircle, { backgroundColor: colors.card }]}>
              <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
            </View>
            <Text style={[FONTS.bold, { color: colors.text, marginBottom: SPACING.sm }]}>No appointments yet</Text>
            <Text
              style={[
                FONTS.caption,
                { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
              ]}
            >
              Describe your symptoms on the Home tab to book your first appointment.
            </Text>
          </Animated.View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, borderBottomWidth: 1 },
  list: { padding: SPACING.xl, paddingBottom: 120 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyWrap: { alignItems: 'center', paddingHorizontal: SPACING.xxl },
  emptyCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
});
