import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen({ navigation }) {
  const { signup, isLoading, error, clearError } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    return () => clearError();
  }, []);

  const displayError = error || localError;

  const validate = () => {
    if (!name.trim()) { setLocalError('Name is required'); return false; }
    if (!email.trim() || !EMAIL_RE.test(email.trim())) { setLocalError('Enter a valid email address'); return false; }
    if (password.length < 6) { setLocalError('Password must be at least 6 characters'); return false; }
    setLocalError('');
    return true;
  };

  const handleSignup = async () => {
    if (!validate()) return;
    await signup({
      name: name.trim(),
      email: email.trim(),
      password,
      phone: phone.trim(),
      dateOfBirth: dob.trim(),
      gender,
      weight: weight.trim(),
      height: height.trim(),
      bloodType,
      allergies: allergies.trim(),
      emergencyContact: { name: emergencyName.trim(), phone: emergencyPhone.trim() },
      profilePhoto: null,
    });
  };

  const clearErrors = () => {
    if (localError) setLocalError('');
    if (error) clearError();
  };

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={[s.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + SPACING.lg, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backRow}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            <Text style={[FONTS.regular, { color: colors.textSecondary }]}>Back to Login</Text>
          </TouchableOpacity>
          <Text style={[FONTS.hero, { color: colors.text, marginBottom: 4 }]}>Create Account</Text>
          <Text style={[FONTS.caption, { color: colors.textSecondary, marginBottom: SPACING.xl }]}>Fill in your details to get started</Text>
        </Animated.View>

        {displayError ? (
          <Animated.View entering={FadeInDown.duration(300)} style={s.errorBox}>
            <Ionicons name="alert-circle" size={16} color="#FF3B30" />
            <Text style={s.errorText}>{displayError}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>Account</Text>
          <Input icon="person-outline" placeholder="Full name" value={name} onChangeText={(t) => { setName(t); clearErrors(); }} colors={colors} />
          <Input icon="mail-outline" placeholder="Email address" value={email} onChangeText={(t) => { setEmail(t); clearErrors(); }} keyboardType="email-address" autoCapitalize="none" colors={colors} />
          <Input icon="lock-closed-outline" placeholder="Password (min 6 chars)" value={password} onChangeText={(t) => { setPassword(t); clearErrors(); }} secureTextEntry colors={colors} />
          <Input icon="call-outline" placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" colors={colors} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>Personal</Text>
          <Input icon="calendar-outline" placeholder="Date of birth (DD/MM/YYYY)" value={dob} onChangeText={setDob} colors={colors} />

          <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Gender</Text>
          <View style={s.chipRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                style={[s.segChip, { borderColor: colors.border, backgroundColor: gender === g ? colors.primary : colors.card }]}
                onPress={() => setGender(g)}
              >
                <Text style={[s.segText, { color: gender === g ? '#fff' : colors.text }]}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.row}>
            <View style={s.half}>
              <Input icon="fitness-outline" placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" colors={colors} />
            </View>
            <View style={s.half}>
              <Input icon="resize-outline" placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" colors={colors} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(400)}>
          <Text style={[s.sectionLabel, { color: colors.textTertiary }]}>Medical</Text>

          <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Blood Type</Text>
          <View style={s.chipRow}>
            {BLOOD_TYPES.map((bt) => (
              <TouchableOpacity
                key={bt}
                style={[s.segChip, s.segChipSmall, { borderColor: colors.border, backgroundColor: bloodType === bt ? colors.primary : colors.card }]}
                onPress={() => setBloodType(bt)}
              >
                <Text style={[s.segText, { color: bloodType === bt ? '#fff' : colors.text }]}>{bt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Input icon="alert-circle-outline" placeholder="Allergies (comma-separated)" value={allergies} onChangeText={setAllergies} colors={colors} />

          <Text style={[s.fieldLabel, { color: colors.textSecondary }]}>Emergency Contact</Text>
          <Input icon="people-outline" placeholder="Contact name" value={emergencyName} onChangeText={setEmergencyName} colors={colors} />
          <Input icon="call-outline" placeholder="Contact phone" value={emergencyPhone} onChangeText={setEmergencyPhone} keyboardType="phone-pad" colors={colors} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600).duration(400)}>
          <TouchableOpacity
            style={[s.btn, (!name.trim() || !email.trim() || !password.trim()) && s.btnDisabled]}
            onPress={handleSignup}
            disabled={isLoading || !name.trim() || !email.trim() || !password.trim()}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ icon, colors, ...props }) {
  return (
    <View style={[inputStyles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Ionicons name={icon} size={18} color={colors.textTertiary} style={inputStyles.icon} />
      <TextInput
        style={[FONTS.regular, { flex: 1, color: colors.text }]}
        placeholderTextColor={colors.textTertiary}
        {...props}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
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

function makeStyles(colors) {
  return StyleSheet.create({
    flex: { flex: 1 },
    scroll: { paddingHorizontal: SPACING.xxl },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: SPACING.xl },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: SPACING.md,
      marginTop: SPACING.xl,
    },
    fieldLabel: { ...FONTS.caption, fontWeight: '600', marginBottom: SPACING.sm },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.md },
    segChip: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm + 2,
      borderRadius: RADIUS.full,
      borderWidth: 1.5,
    },
    segChipSmall: { paddingHorizontal: SPACING.md },
    segText: { ...FONTS.regular, fontWeight: '600', fontSize: 14 },
    row: { flexDirection: 'row', gap: SPACING.md },
    half: { flex: 1 },
    errorBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,59,48,0.1)',
      borderColor: 'rgba(255,59,48,0.3)',
      borderWidth: 1,
      borderRadius: RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm + 2,
      marginBottom: SPACING.md,
    },
    errorText: { color: '#FF3B30', flex: 1, marginLeft: 8, fontSize: 13 },
    btn: {
      backgroundColor: colors.primary,
      borderRadius: RADIUS.full,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: SPACING.xl,
    },
    btnDisabled: { opacity: 0.35 },
    btnText: { color: '#fff', ...FONTS.semibold, fontSize: 17 },
  });
}
