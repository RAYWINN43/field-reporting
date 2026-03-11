import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Region } from 'react-native-maps';
import { Coordinates, LocationMapProps } from '../types';

export const LocationMap: React.FC<LocationMapProps> = ({ onLocationFound }) => {
  const [location, setLocation] = useState<Coordinates | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          setErrorMsg("Permission de localisation refusée.");
          setIsLoading(false);
          return;
        }

        const currentPosition = await Location.getCurrentPositionAsync({});
        const coords: Coordinates = {
          latitude: currentPosition.coords.latitude,
          longitude: currentPosition.coords.longitude,
        };

        setLocation(coords);
        onLocationFound(coords);
      } catch (error) {
        setErrorMsg("Impossible de récupérer la position actuelle.");
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentLocation();
  }, [onLocationFound]);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.infoText}>Recherche de votre position...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Aucune position disponible.</Text>
      </View>
    );
  }

  const initialRegion: Region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  };

  return (
    <View style={styles.mapContainer}>
      <MapView style={styles.map} initialRegion={initialRegion}>
        <Marker coordinate={location} pinColor="red" />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
  },
  mapContainer: {
    width: '100%',
    height: 250,
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  infoText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});