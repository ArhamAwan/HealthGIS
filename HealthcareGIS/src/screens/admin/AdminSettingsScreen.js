import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useData } from '../../context/DataContext';
import { getSettings, saveSettings } from '../../utils/storage';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { doctors, hospitals, resetData } = useData();
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    getSettings().then((s) => setNotifications(s.notifications));
  }, []);

  const handleToggleNotifications = async (val) => {
    setNotifications(val);
    await saveSettings({ notifications: val });
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Data',
      'This will restore all doctors and hospitals to their default values. Admin accounts are not affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetData();
            Alert.alert('Done', 'Data has been reset to defaults.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: insets.top + SPACING.sm, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.headerRow}>
          <View style={[styles.adminBadge, { backgroundColor: 'rgba(187,126,93,0.12)' }]}>
            <Ionicons name="shield-checkmark" size={36} color="#BB7E5D" />
          </View>
          <View style={styles.headerInfo}>
            <Text style={[FONTS.hero, { color: colors.text, fontSize: 22 }]}>
              {user?.name || 'Admin'}
            </Text>
            <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 2 }]}>
              {user?.email}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: '#BB7E5D' }]}>
              <Text style={[FONTS.caption, { color: '#fff', fontWeight: '700', fontSize: 10 }]}>ADMIN</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Overview</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <StatRow icon="people" label="Total Doctors" value={doctors.length.toString()} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <StatRow icon="business" label="Total Hospitals" value={hospitals.length.toString()} colors={colors} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>App Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.primary} />
              <Text style={[FONTS.regular, { color: colors.text, marginLeft: SPACING.md }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={isDark ? colors.primary : '#f4f3f4'}
            />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={20} color={colors.primary} />
              <Text style={[FONTS.regular, { color: colors.text, marginLeft: SPACING.md }]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={handleToggleNotifications}
              trackColor={{ false: colors.border, true: colors.primary + '70' }}
              thumbColor={notifications ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Data Management</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleResetData} activeOpacity={0.7}>
            <Ionicons name="refresh-circle-outline" size={20} color="#BB7E5D" />
            <Text style={[FONTS.regular, { color: '#BB7E5D', marginLeft: SPACING.md, fontWeight: '600' }]}>
              Reset Doctors & Hospitals to Defaults
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(400)}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>Account</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.actionRow} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={[FONTS.regular, { color: '#FF3B30', marginLeft: SPACING.md, fontWeight: '600' }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(500).duration(400)}>
        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          HealthGIS Admin v1.0.0
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

function StatRow({ icon, label, value, colors }) {
  return (
    <View style={styles.statRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[FONTS.regular, { color: colors.text, marginLeft: SPACING.md }]}>{label}</Text>
      </View>
      <Text style={[FONTS.semibold, { color: colors.primary, fontSize: 16 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: SPACING.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xxl },
  adminBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { marginLeft: SPACING.lg, flex: 1 },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  card: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 2,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md + 4,
  },
  divider: { height: StyleSheet.hairlineWidth, marginHorizontal: SPACING.lg },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: SPACING.xxl + SPACING.lg,
  },
});
