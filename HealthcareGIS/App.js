import React, { useEffect, useMemo } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider } from './src/context/AppContext';
import { DataProvider } from './src/context/DataContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import AdminLoginScreen from './src/screens/AdminLoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import BookingConfirmationScreen from './src/screens/BookingConfirmationScreen';
import AppointmentsScreen from './src/screens/AppointmentsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

import AdminDoctorsScreen from './src/screens/admin/AdminDoctorsScreen';
import AdminHospitalsScreen from './src/screens/admin/AdminHospitalsScreen';
import AdminSettingsScreen from './src/screens/admin/AdminSettingsScreen';
import DoctorFormScreen from './src/screens/admin/DoctorFormScreen';
import HospitalFormScreen from './src/screens/admin/HospitalFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const AdminStack = createNativeStackNavigator();

function TabBarBackground() {
  const { isDark } = useTheme();
  return (
    <BlurView
      intensity={100}
      tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isDark ? 'rgba(15,17,23,0.7)' : 'rgba(255,255,255,0.6)',
          borderTopWidth: 0.5,
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)',
        },
      ]}
    />
  );
}

function AnimatedTabIcon({ name, focused, color, size }) {
  const scale = useSharedValue(focused ? 1.15 : 1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.15 : 1, { damping: 12, stiffness: 200 });
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

function PatientTabs() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 200 } },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'Appointments') iconName = focused ? 'calendar' : 'calendar-outline';
          else iconName = focused ? 'person' : 'person-outline';
          return <AnimatedTabIcon name={iconName} focused={focused} color={color} size={size} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: { position: 'absolute', borderTopWidth: 0, elevation: 0, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AdminTabsNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        lazy: false,
        freezeOnBlur: true,
        animation: 'fade',
        transitionSpec: { animation: 'timing', config: { duration: 200 } },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Doctors') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Hospitals') iconName = focused ? 'business' : 'business-outline';
          else iconName = focused ? 'settings' : 'settings-outline';
          return <AnimatedTabIcon name={iconName} focused={focused} color={color} size={size} />;
        },
        tabBarActiveTintColor: '#FF9500',
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: { position: 'absolute', borderTopWidth: 0, elevation: 0, height: 88, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.background },
      })}
    >
      <Tab.Screen name="Doctors" component={AdminDoctorsScreen} />
      <Tab.Screen name="Hospitals" component={AdminHospitalsScreen} />
      <Tab.Screen name="Settings" component={AdminSettingsScreen} />
    </Tab.Navigator>
  );
}

function AdminStackNavigator() {
  const { colors } = useTheme();
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'fade' }}>
      <AdminStack.Screen name="AdminTabs" component={AdminTabsNavigator} />
      <AdminStack.Screen name="DoctorForm" component={DoctorFormScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <AdminStack.Screen name="HospitalForm" component={HospitalFormScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </AdminStack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isDark, colors } = useTheme();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAdmin = isAuthenticated && user?.role === 'admin';

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
          freezeOnBlur: true,
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animationTypeForReplace: 'pop' }} />
            <Stack.Screen name="Signup" component={SignupScreen} />
            <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          </>
        ) : isAdmin ? (
          <Stack.Screen name="AdminRoot" component={AdminStackNavigator} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={PatientTabs} />
            <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
          </>
        )}
      </Stack.Navigator>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

function AppRoot() {
  const { isDark, colors, isReady } = useTheme();
  const { isLoading } = useAuth();

  const navTheme = useMemo(() => ({
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      primary: colors.primary,
    },
  }), [isDark, colors]);

  if (!isReady || isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <AppProvider>
              <AppRoot />
            </AppProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
