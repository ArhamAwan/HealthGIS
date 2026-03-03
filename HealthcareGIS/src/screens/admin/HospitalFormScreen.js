import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useData } from '../../context/DataContext';
import { useTheme } from '../../context/ThemeContext';
import mapDarkStyle from '../../constants/mapDarkStyle';
import { SPACING, RADIUS, FONTS } from '../../constants/theme';

const { width: SCREEN_W } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 33.6938,
  longitude: 73.0489,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function HospitalFormScreen({ route, navigation }) {
  const existing = route.params?.hospital;
  const isEdit = !!existing;
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { addHospital, updateHospital } = useData();
  const mapRef = useRef(null);

  const [name, setName] = useState(existing?.name || '');
  const [address, setAddress] = useState(existing?.address || '');
  const [latitude, setLatitude] = useState(existing?.latitude?.toString() || '');
  const [longitude, setLongitude] = useState(existing?.longitude?.toString() || '');
  const [pinCoord, setPinCoord] = useState(
    existing
      ? { latitude: existing.latitude, longitude: existing.longitude }
      : null
  );

  const canSave = name.trim() && address.trim() && latitude.trim() && longitude.trim();

  const handleMapPress = (e) => {
    const { latitude: lat, longitude: lng } = e.nativeEvent.coordinate;
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
    setPinCoord({ latitude: lat, longitude: lng });
  };

  const handleSave = async () => {
    if (!canSave) return;
    const hospital = {
      ...(existing || {}),
      name: name.trim(),
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    if (isEdit) {
      await updateHospital(hospital);
    } else {
      await addHospital(hospital);
    }
    navigation.goBack();
  };

  const mapRegion = existing
    ? {
        latitude: existing.latitude,
        longitude: existing.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

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
            {isEdit ? 'Edit Hospital' : 'Add Hospital'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Details</Text>
          <Field icon="business-outline" placeholder="Hospital name" value={name} onChangeText={setName} colors={colors} />
          <Field icon="location-outline" placeholder="Address" value={address} onChangeText={setAddress} colors={colors} />
          <View style={styles.coordRow}>
            <View style={styles.half}>
              <Field icon="navigate-outline" placeholder="Latitude" value={latitude} onChangeText={setLatitude} keyboardType="numeric" colors={colors} />
            </View>
            <View style={styles.half}>
              <Field icon="navigate-outline" placeholder="Longitude" value={longitude} onChangeText={setLongitude} keyboardType="numeric" colors={colors} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200).duration(400)}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>Pick on Map</Text>
          <Text style={[FONTS.caption, { color: colors.textSecondary, marginBottom: SPACING.md }]}>
            Tap the map to set the hospital location
          </Text>
          <View style={[styles.mapContainer, { borderColor: colors.border }]}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={mapRegion}
              onPress={handleMapPress}
              customMapStyle={isDark ? mapDarkStyle : []}
              userInterfaceStyle={isDark ? 'dark' : 'light'}
            >
              {pinCoord && (
                <Marker coordinate={pinCoord} pinColor={colors.primary} />
              )}
            </MapView>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300).duration(400)}>
          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: colors.primary }, !canSave && styles.disabled]}
            onPress={handleSave}
            disabled={!canSave}
            activeOpacity={0.85}
          >
            <Text style={[FONTS.semibold, { color: '#fff', fontSize: 17 }]}>
              {isEdit ? 'Save Changes' : 'Add Hospital'}
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
  coordRow: { flexDirection: 'row', gap: SPACING.md },
  half: { flex: 1 },
  mapContainer: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    height: 220,
  },
  map: { width: '100%', height: '100%' },
  saveBtn: {
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xxl,
  },
  disabled: { opacity: 0.35 },
});
