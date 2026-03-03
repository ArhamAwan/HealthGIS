import React, { forwardRef } from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { View, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import mapDarkStyle from '../constants/mapDarkStyle';

const Map = forwardRef(({ children, region, onRegionChangeComplete, ...props }, ref) => {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0e1626' : '#e8eaed' }]}>
      <MapView
        key={isDark ? 'dark' : 'light'}
        ref={ref}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        region={region}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        customMapStyle={isDark ? mapDarkStyle : []}
        userInterfaceStyle={isDark ? 'dark' : 'light'}
        {...props}
      >
        {children}
      </MapView>
    </View>
  );
});

Map.displayName = 'Map';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default Map;
