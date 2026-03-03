import * as Location from 'expo-location';

// Default fallback: center of Islamabad
const DEFAULT_LOCATION = {
  latitude: 33.6844,
  longitude: 73.0479,
};

export async function requestLocationPermission() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation() {
  try {
    const granted = await requestLocationPermission();
    if (!granted) return DEFAULT_LOCATION;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch {
    return DEFAULT_LOCATION;
  }
}

export { DEFAULT_LOCATION };
