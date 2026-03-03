import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';

const SPECIALTIES = [
  'General Medicine',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Internal Medicine',
  'Orthopedic',
  'Pediatrician',
  'ENT Specialist',
  'Ophthalmologist',
  'Psychiatrist',
];

export default function DoctorFormScreen({ route, navigation }) {
  const existing = route.params?.doctor;
  const isEdit = !!existing;
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { hospitals, addDoctor, updateDoctor } = useData();

  const [name, setName] = useState(existing?.name || '');
  const [specialty, setSpecialty] = useState(existing?.specialty || '');
  const [hospitalId, setHospitalId] = useState(existing?.hospitalId || '');
  const [experience, setExperience] = useState(existing?.experience?.toString() || '');
  const [fee, setFee] = useState(existing?.fee?.toString() || '');
  const [slotInput, setSlotInput] = useState('');
  const [slots, setSlots] = useState(existing?.availableSlots || []);

  const canSave = name.trim() && specialty && hospitalId && fee.trim();

  const handleAddSlot = () => {
    const s = slotInput.trim();
    if (s && !slots.includes(s)) {
      setSlots((prev) => [...prev, s]);
      setSlotInput('');
    }
  };

  const handleRemoveSlot = (slot) => {
    setSlots((prev) => prev.filter((s) => s !== slot));
  };

  const handleSave = async () => {
    if (!canSave) return;
    const doctor = {
      ...(existing || {}),
      name: name.trim(),
      specialty,
      hospitalId,
      experience: parseInt(experience, 10) || 0,
      fee: parseInt(fee, 10) || 0,
      availableSlots: slots,
    };

    if (isEdit) {
      await updateDoctor(doctor);
    } else {
      await addDoctor(doctor);
    }
    navigation.goBack();
  };

  const selectedHosp = useMemo(
    () => hospitals.find((h) => h.id === hospitalId),
    [hospitals, hospitalId]
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.md, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(350)}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            <Text style={[FONTS.regular, { color: colors.textSecondary }]}>Back</Text>
          </TouchableOpacity>
          <Text style={[FONTS.hero, { color: colors.text, fontSize: 24, marginBottom: SPACING.xl }]}>
            {isEdit ? 'Edit Doctor' : 'Add Doctor'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Basic Info</Text>
          <Field icon="person-outline" placeholder="Full name" value={name} onChangeText={setName} colors={colors} />
          <Field icon="cash-outline" placeholder="Fee (PKR)" value={fee} onChangeText={setFee} keyboardType="numeric" colors={colors} />
          <Field icon="time-outline" placeholder="Years of experience" value={experience} onChangeText={setExperience} keyboardType="numeric" colors={colors} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Specialty</Text>
          <View style={styles.chipRow}>
            {SPECIALTIES.map((spec) => (
              <TouchableOpacity
                key={spec}
                style={[
                  styles.chip,
                  { borderColor: colors.border, backgroundColor: specialty === spec ? colors.primary : colors.card },
                ]}
                onPress={() => setSpecialty(spec)}
              >
                <Text style={[styles.chipText, { color: specialty === spec ? '#fff' : colors.text }]}>{spec}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Hospital</Text>
          {selectedHosp && (
            <View style={[styles.selectedTag, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '40' }]}>
              <Ionicons name="business" size={14} color={colors.primary} />
              <Text style={[FONTS.caption, { color: colors.primary, marginLeft: 6, fontWeight: '600' }]}>
                {selectedHosp.name}
              </Text>
              <TouchableOpacity onPress={() => setHospitalId('')} style={{ marginLeft: 'auto' }}>
                <Ionicons name="close-circle" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hospScroll}>
            {hospitals.map((h) => (
              <TouchableOpacity
                key={h.id}
                style={[
                  styles.hospChip,
                  { borderColor: colors.border, backgroundColor: hospitalId === h.id ? colors.primary : colors.card },
                ]}
                onPress={() => setHospitalId(h.id)}
              >
                <Text
                  style={[styles.chipText, { color: hospitalId === h.id ? '#fff' : colors.text, fontSize: 12 }]}
                  numberOfLines={1}
                >
                  {h.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Available Slots</Text>
          <View style={styles.slotInputRow}>
            <View style={[styles.slotField, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[FONTS.regular, { flex: 1, color: colors.text }]}
                placeholder="e.g. 09:00 AM"
                placeholderTextColor={colors.textTertiary}
                value={slotInput}
                onChangeText={setSlotInput}
                onSubmitEditing={handleAddSlot}
                returnKeyType="done"
              />
            </View>
            <TouchableOpacity
              style={[styles.addSlotBtn, { backgroundColor: colors.primary }]}
              onPress={handleAddSlot}
              disabled={!slotInput.trim()}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.chipRow}>
            {slots.map((slot) => (
              <TouchableOpacity key={slot} style={[styles.slotChip, { backgroundColor: colors.primaryLight }]} onPress={() => handleRemoveSlot(slot)}>
                <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600' }]}>{slot}</Text>
                <Ionicons name="close" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500).duration(400)}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, !canSave && styles.disabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <Text style={[FONTS.semibold, { color: '#fff', fontSize: 17 }]}>
              {isEdit ? 'Save Changes' : 'Add Doctor'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ icon, colors, ...props }) {
  return (
    <View style={[fieldStyles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.textTertiary} style={fieldStyles.icon} />
      <TextInput
        style={[FONTS.regular, { flex: 1, color: colors.text }]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    height: 52,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  icon: { marginRight: SPACING.sm },
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.xl },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.lg },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.sm },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
  },
  chipText: { ...FONTS.caption, fontWeight: '600', fontSize: 13 },
  hospScroll: { marginBottom: SPACING.md },
  hospChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
    maxWidth: 180,
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  slotInputRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  slotField: {
    flex: 1,
    borderRadius: RADIUS.lg,
    height: 48,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    justifyContent: 'center',
  },
  addSlotBtn: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  saveBtn: {
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  disabled: { opacity: 0.35 },
});
