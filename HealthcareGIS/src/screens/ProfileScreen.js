import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { clearAppointments, getSettings, saveSettings } from '../utils/storage';
import { useApp } from '../context/AppContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { loadAppointments } = useApp();
  const insets = useSafeAreaInsets();
  const [notifs, setNotifs] = useState(true);
  const [editing, setEditing] = useState(false);

  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [allergies, setAllergies] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  useEffect(() => {
    getSettings().then((s) => setNotifs(s.notifications));
  }, []);

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setDob(user.dateOfBirth || '');
      setGender(user.gender || '');
      setWeight(user.weight || '');
      setHeight(user.height || '');
      setBloodType(user.bloodType || '');
      setAllergies(user.allergies || '');
      setEmergencyName(user.emergencyContact?.name || '');
      setEmergencyPhone(user.emergencyContact?.phone || '');
    }
  }, [user]);

  const handleStartEdit = useCallback(() => setEditing(true), []);

  const handleSave = useCallback(async () => {
    await updateProfile({
      phone: phone.trim(),
      dateOfBirth: dob.trim(),
      gender,
      weight: weight.trim(),
      height: height.trim(),
      bloodType,
      allergies: allergies.trim(),
      emergencyContact: { name: emergencyName.trim(), phone: emergencyPhone.trim() },
    });
    setEditing(false);
  }, [updateProfile, phone, dob, gender, weight, height, bloodType, allergies, emergencyName, emergencyPhone]);

  const handleCancel = useCallback(() => {
    if (user) {
      setPhone(user.phone || '');
      setDob(user.dateOfBirth || '');
      setGender(user.gender || '');
      setWeight(user.weight || '');
      setHeight(user.height || '');
      setBloodType(user.bloodType || '');
      setAllergies(user.allergies || '');
      setEmergencyName(user.emergencyContact?.name || '');
      setEmergencyPhone(user.emergencyContact?.phone || '');
    }
    setEditing(false);
  }, [user]);

  const handleToggleNotifs = useCallback(async (val) => {
    setNotifs(val);
    await saveSettings({ notifications: val });
  }, []);

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      await updateProfile({ profilePhoto: result.assets[0].uri });
    }
  }, [updateProfile]);

  const handleClearAppointments = useCallback(() => {
    Alert.alert('Clear Appointments', 'This will delete all your appointment history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAppointments();
          loadAppointments([]);
        },
      },
    ]);
  }, [loadAppointments]);

  const handleLogout = useCallback(() => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  }, [logout]);

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const cardBg = isDark ? 'rgba(17,17,17,0.8)' : 'rgba(255,255,255,0.7)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[st.headerArea, { paddingTop: insets.top + SPACING.xxxl }]}
      >
        <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8} style={st.avatarWrap}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={st.avatar} />
          ) : (
            <View style={[st.avatar, { backgroundColor: isDark ? 'rgba(12,164,165,0.25)' : 'rgba(8,146,165,0.15)' }]}>
              <Text style={[st.avatarText, { color: colors.primary }]}>{initials}</Text>
            </View>
          )}
          <View style={[st.cameraBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}>
            <Ionicons name="camera" size={13} color="#fff" />
          </View>
        </TouchableOpacity>

        <Text style={[st.nameText, { color: colors.text }]}>{user?.name || 'User'}</Text>
        <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 2 }]}>{user?.email}</Text>
        <View style={[st.roleBadge, { backgroundColor: colors.primary }]}>
          <Text style={st.roleBadgeText}>PATIENT</Text>
        </View>
      </Animated.View>

      <View style={st.body}>
        <Animated.View entering={FadeInUp.delay(150).duration(400)}>
          <View style={st.sectionHeader}>
            <View style={st.sectionHeaderText}>
              <Text style={[st.sectionTitle, { color: colors.text }]}>Patient Information</Text>
              <Text style={[st.sectionSubtitle, { color: colors.textSecondary }]}>Your health details</Text>
            </View>
            {!editing ? (
              <TouchableOpacity onPress={handleStartEdit} style={[st.editBtn, { backgroundColor: colors.primaryLight }]} activeOpacity={0.7}>
                <Ionicons name="pencil" size={14} color={colors.primary} />
                <Text style={[st.editBtnText, { color: colors.primary }]}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={st.editActions}>
                <TouchableOpacity onPress={handleCancel} style={[st.editBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]} activeOpacity={0.7}>
                  <Text style={[st.editBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={[st.editBtn, { backgroundColor: colors.primary }]} activeOpacity={0.7}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                  <Text style={[st.editBtnText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {editing ? (
              <>
                <EditField icon="call" label="Phone" value={phone} onChangeText={setPhone} placeholder="Phone number" keyboardType="phone-pad" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />
                <EditField icon="calendar" label="Date of Birth" value={dob} onChangeText={setDob} placeholder="DD/MM/YYYY" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />

                <View style={st.infoRow}>
                  <View style={[st.rowIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="male-female" size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[FONTS.caption, { color: colors.textTertiary, fontSize: 11, marginBottom: SPACING.xs }]}>Gender</Text>
                    <View style={st.chipRow}>
                      {GENDERS.map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[st.chip, { borderColor: inputBorder, backgroundColor: gender === g ? colors.primary : inputBg }]}
                          onPress={() => setGender(g)}
                        >
                          <Text style={[st.chipText, { color: gender === g ? '#fff' : colors.text }]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <EditField icon="fitness" label="Weight (kg)" value={weight} onChangeText={setWeight} placeholder="e.g. 70" keyboardType="numeric" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />
                <EditField icon="resize" label="Height (cm)" value={height} onChangeText={setHeight} placeholder="e.g. 175" keyboardType="numeric" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />

                <View style={st.infoRow}>
                  <View style={[st.rowIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="water" size={14} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[FONTS.caption, { color: colors.textTertiary, fontSize: 11, marginBottom: SPACING.xs }]}>Blood Type</Text>
                    <View style={st.chipRow}>
                      {BLOOD_TYPES.map((bt) => (
                        <TouchableOpacity
                          key={bt}
                          style={[st.chip, st.chipSmall, { borderColor: inputBorder, backgroundColor: bloodType === bt ? colors.primary : inputBg }]}
                          onPress={() => setBloodType(bt)}
                        >
                          <Text style={[st.chipText, { color: bloodType === bt ? '#fff' : colors.text }]}>{bt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <EditField icon="alert-circle" label="Allergies" value={allergies} onChangeText={setAllergies} placeholder="Comma-separated" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />
                <EditField icon="people" label="Emergency Name" value={emergencyName} onChangeText={setEmergencyName} placeholder="Contact name" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />
                <EditField icon="call" label="Emergency Phone" value={emergencyPhone} onChangeText={setEmergencyPhone} placeholder="Contact phone" keyboardType="phone-pad" colors={colors} inputBg={inputBg} inputBorder={inputBorder} />
              </>
            ) : (
              <>
                <InfoRow icon="call" label="Phone" value={user?.phone || 'Not set'} colors={colors} />
                <InfoRow icon="calendar" label="Date of Birth" value={user?.dateOfBirth || 'Not set'} colors={colors} />
                <InfoRow icon="male-female" label="Gender" value={user?.gender || 'Not set'} colors={colors} />
                <InfoRow icon="fitness" label="Weight" value={user?.weight ? `${user.weight} kg` : 'Not set'} colors={colors} />
                <InfoRow icon="resize" label="Height" value={user?.height ? `${user.height} cm` : 'Not set'} colors={colors} />
                <InfoRow icon="water" label="Blood Type" value={user?.bloodType || 'Not set'} colors={colors} />
                <InfoRow icon="alert-circle" label="Allergies" value={user?.allergies || 'None'} colors={colors} />
                <InfoRow
                  icon="people"
                  label="Emergency Contact"
                  value={user?.emergencyContact?.name ? `${user.emergencyContact.name} (${user.emergencyContact.phone})` : 'Not set'}
                  colors={colors}
                />
              </>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <SectionHeader icon="settings" title="App Settings" subtitle="Preferences" colors={colors} />
          <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <SettingRow icon="moon" label="Dark Mode" colors={colors}>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </SettingRow>
            <SettingRow icon="notifications" label="Notifications" colors={colors}>
              <Switch
                value={notifs}
                onValueChange={handleToggleNotifs}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#fff"
              />
            </SettingRow>
            <SettingRow icon="map" label="Map Style" colors={colors}>
              <Text style={[FONTS.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                {isDark ? 'Dark' : 'Light'}
              </Text>
            </SettingRow>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(450).duration(400)}>
          <SectionHeader icon="shield" title="Account" subtitle="Manage your account" colors={colors} />
          <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <TouchableOpacity style={st.actionRow} onPress={handleClearAppointments} activeOpacity={0.6}>
              <View style={[st.rowIcon, { backgroundColor: 'rgba(220,38,38,0.1)' }]}>
                <Ionicons name="trash" size={14} color={colors.error} />
              </View>
              <Text style={[FONTS.regular, { color: colors.error, fontWeight: '600', flex: 1 }]}>Clear Appointments</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={st.actionRow} onPress={handleLogout} activeOpacity={0.6}>
              <View style={[st.rowIcon, { backgroundColor: 'rgba(220,38,38,0.1)' }]}>
                <Ionicons name="log-out" size={14} color={colors.error} />
              </View>
              <Text style={[FONTS.regular, { color: colors.error, fontWeight: '600', flex: 1 }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(550).duration(400)} style={st.footer}>
          <Text style={[FONTS.caption, { color: colors.textTertiary, textAlign: 'center' }]}>HealthGIS v1.0</Text>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ icon, title, subtitle, colors }) {
  return (
    <View style={st.sectionHeader}>
      <View style={st.sectionHeaderText}>
        <Text style={[st.sectionTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[st.sectionSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <View style={[st.sectionIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
    </View>
  );
}

function InfoRow({ icon, label, value, colors }) {
  return (
    <View style={st.infoRow}>
      <View style={[st.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[FONTS.caption, { color: colors.textTertiary, fontSize: 11 }]}>{label}</Text>
        <Text style={[FONTS.regular, { color: colors.text, fontWeight: '500', marginTop: 1 }]}>{value}</Text>
      </View>
    </View>
  );
}

function EditField({ icon, label, value, onChangeText, placeholder, keyboardType, colors, inputBg, inputBorder }) {
  return (
    <View style={st.infoRow}>
      <View style={[st.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[FONTS.caption, { color: colors.textTertiary, fontSize: 11, marginBottom: 3 }]}>{label}</Text>
        <TextInput
          style={[st.input, { backgroundColor: inputBg, borderColor: inputBorder, color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}

function SettingRow({ icon, label, colors, children }) {
  return (
    <View style={st.settingRow}>
      <View style={[st.rowIcon, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={14} color={colors.primary} />
      </View>
      <Text style={[FONTS.regular, { color: colors.text, fontWeight: '500', flex: 1 }]}>{label}</Text>
      {children}
    </View>
  );
}

const st = StyleSheet.create({
  headerArea: {
    alignItems: 'center',
    paddingBottom: SPACING.xl,
  },
  brandPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  brandPillText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  avatarWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: '700' },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginTop: SPACING.md,
  },
  roleBadge: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  body: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionHeaderText: { flex: 1, marginRight: SPACING.md },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.full,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  chipSmall: {
    paddingHorizontal: SPACING.sm + 2,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.sm + 2,
  },
  footer: { marginTop: SPACING.xxl, paddingBottom: SPACING.xxl },
});
