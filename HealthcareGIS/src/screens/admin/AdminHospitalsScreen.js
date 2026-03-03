import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';

export default function AdminHospitalsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hospitals, doctors, deleteHospital } = useData();
  const [search, setSearch] = useState('');

  const doctorCountMap = useMemo(() => {
    const map = {};
    doctors.forEach((d) => {
      map[d.hospitalId] = (map[d.hospitalId] || 0) + 1;
    });
    return map;
  }, [doctors]);

  const filtered = useMemo(() => {
    if (!search.trim()) return hospitals;
    const q = search.toLowerCase();
    return hospitals.filter(
      (h) => h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q)
    );
  }, [hospitals, search]);

  const handleDelete = useCallback(
    (hosp) => {
      const docCount = doctorCountMap[hosp.id] || 0;
      const msg = docCount > 0
        ? `Remove ${hosp.name}? This hospital has ${docCount} doctor(s) linked.`
        : `Remove ${hosp.name}?`;
      Alert.alert('Delete Hospital', msg, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHospital(hosp.id) },
      ]);
    },
    [deleteHospital, doctorCountMap]
  );

  const renderItem = useCallback(
    ({ item, index }) => {
      const docCount = doctorCountMap[item.id] || 0;
      return (
        <Animated.View entering={FadeInDown.delay(index * 40).duration(350)}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('HospitalForm', { hospital: item })}
          >
            <View style={styles.cardBody}>
              <View style={[styles.icon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="business" size={20} color={colors.primary} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[FONTS.semibold, { color: colors.text, fontSize: 15 }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={1}>
                  {item.address}
                </Text>
                <Text style={[FONTS.caption, { color: colors.textTertiary, marginTop: 1, fontSize: 11 }]}>
                  {docCount} doctor{docCount !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={12} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [colors, doctorCountMap, navigation, handleDelete]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.sm }]}>
        <Text style={[FONTS.hero, { color: colors.text, fontSize: 26 }]}>Hospitals</Text>
        <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 2 }]}>
          {hospitals.length} total
        </Text>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={18} color={colors.textTertiary} />
        <TextInput
          style={[FONTS.regular, { flex: 1, marginLeft: SPACING.sm, color: colors.text }]}
          placeholder="Search hospitals..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.textTertiary} />
            <Text style={[FONTS.regular, { color: colors.textTertiary, marginTop: SPACING.md }]}>
              {search ? 'No matches found' : 'No hospitals yet'}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary, bottom: insets.bottom + 100 }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('HospitalForm', {})}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.lg,
    height: 46,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  list: { paddingHorizontal: SPACING.lg, paddingBottom: 100 },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1, marginLeft: SPACING.md },
  deleteBtn: { padding: 4 },
  empty: { alignItems: 'center', paddingTop: 80 },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
