import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SPACING, RADIUS, FONTS } from '../constants/theme';

export default function AdminLoginScreen({ navigation }) {
  const { adminLogin, isLoading, error, clearError } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    return () => clearError();
  }, []);

  const handleLogin = () => {
    if (email.trim() && password.trim()) adminLogin(email.trim(), password);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <View style={styles.logoWrap}>
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View style={[styles.logoCircle, { backgroundColor: isDarkBg(colors) ? 'rgba(187,126,93,0.15)' : 'rgba(187,126,93,0.12)' }]}>
              <Ionicons name="shield-checkmark" size={44} color="#BB7E5D" />
            </View>
          </Animated.View>
          <Animated.Text entering={FadeInDown.delay(250).duration(500)} style={[FONTS.hero, { color: colors.text }]}>
            Admin Portal
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(350).duration(500)} style={[FONTS.caption, { color: colors.textSecondary, marginTop: 6, fontSize: 15 }]}>
            Manage doctors, hospitals & settings
          </Animated.Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <Animated.View entering={FadeInDown.duration(300)} style={[styles.errorBox, { backgroundColor: 'rgba(255,59,48,0.1)', borderColor: 'rgba(255,59,48,0.3)' }]}>
              <Ionicons name="alert-circle" size={16} color="#FF3B30" />
              <Text style={[FONTS.caption, { color: '#FF3B30', flex: 1, marginLeft: 8, fontSize: 13 }]}>{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInUp.delay(450).duration(500)}>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[FONTS.regular, { flex: 1, color: colors.text }]}
                placeholder="Admin email"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={(t) => { setEmail(t); if (error) clearError(); }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(550).duration(500)}>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[FONTS.regular, { flex: 1, color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textTertiary}
                value={password}
                onChangeText={(t) => { setPassword(t); if (error) clearError(); }}
                secureTextEntry
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(650).springify()}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: '#BB7E5D' }, (!email.trim() || !password.trim()) && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading || !email.trim() || !password.trim()}
              activeOpacity={0.8}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={[FONTS.semibold, { color: '#fff', fontSize: 17 }]}>Sign In as Admin</Text>}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(750).duration(500)}>
            <TouchableOpacity style={styles.switchLink} activeOpacity={0.6} onPress={() => { clearError(); navigation.goBack(); }}>
              <Text style={[FONTS.caption, { fontSize: 14, color: colors.textSecondary }]}>
                Patient? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in here</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function isDarkBg(colors) {
  return colors.background !== '#FFFFFF' && colors.background !== '#ffffff';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SPACING.xxl },
  logoWrap: { alignItems: 'center', marginBottom: 48 },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  form: { gap: SPACING.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderWidth: 1,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    height: 54,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
  },
  inputIcon: { marginRight: SPACING.sm },
  btn: {
    borderRadius: RADIUS.full,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  btnDisabled: { opacity: 0.35 },
  switchLink: { alignItems: 'center', marginTop: SPACING.xxl },
});
